-- ห้องโอบรัก: Migration ระบบล็อกอินด้วย USER ID + อีเมลจริงสำหรับยืนยันบัญชี/กู้รหัสผ่าน
-- ใช้ไฟล์นี้เมื่อฐานข้อมูลเดิมเคยรัน schema.sql แล้ว

begin;

alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists account_status text default 'student';
alter table public.profiles add column if not exists age integer;

update public.profiles
set username = coalesce(nullif(trim(username), ''), name)
where username is null or trim(username) = '';

update public.profiles
set account_status = 'student'
where account_status is null;

alter table public.profiles alter column username set not null;
alter table public.profiles alter column account_status set default 'student';
alter table public.profiles alter column account_status set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_account_status_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_account_status_check check (account_status in ('student', 'staff'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_age_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_age_check check (age is null or age between 15 and 100);
  end if;
end;
$$;

-- USER ID ห้ามซ้ำแบบไม่สนตัวพิมพ์เล็ก/ใหญ่
create unique index if not exists profiles_student_id_normalized_unique
  on public.profiles (lower(trim(student_id)))
  where student_id is not null;

create or replace function public.is_user_id_available(p_user_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    nullif(trim(p_user_id), '') is not null
    and not exists (
      select 1
      from public.profiles p
      where lower(trim(p.student_id)) = lower(trim(p_user_id))
    );
$$;

revoke all on function public.is_user_id_available(text) from public;
grant execute on function public.is_user_id_available(text) to anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, student_id, username, name, email, account_status, age, role, consent_privacy)
  values (
    new.id,
    nullif(lower(trim(coalesce(new.raw_user_meta_data ->> 'student_id', ''))), ''),
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'username'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
      split_part(new.email, '@', 1)
    ),
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'username'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
      split_part(new.email, '@', 1)
    ),
    coalesce(new.email, ''),
    case
      when new.raw_user_meta_data ->> 'account_status' in ('student', 'staff')
        then new.raw_user_meta_data ->> 'account_status'
      else 'student'
    end,
    case
      when coalesce(new.raw_user_meta_data ->> 'age', '') ~ '^[0-9]+$'
        then (new.raw_user_meta_data ->> 'age')::integer
      else null
    end,
    'student',
    coalesce((new.raw_user_meta_data ->> 'consent_privacy')::boolean, false)
  );
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

commit;
