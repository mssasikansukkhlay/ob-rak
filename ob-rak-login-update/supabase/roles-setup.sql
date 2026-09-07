-- รันหลังจากบัญชีผู้ดูแล/ผู้ให้คำปรึกษาสมัครผ่านหน้าเว็บแล้ว
-- แก้อีเมลให้เป็นอีเมลจริงก่อนกด Run

-- 1) ตั้งบัญชีผู้ดูแลระบบ
update public.profiles
set role = 'admin'
where email = 'admin@example.com';

-- 2) ตั้งบัญชีผู้ให้คำปรึกษาและเชื่อมกับรายการผู้ให้คำปรึกษาคนที่ 1
update public.profiles
set role = 'counselor'
where email = 'counselor@example.com';

update public.counselors
set user_id = (
  select id from public.profiles where email = 'counselor@example.com'
)
where id = '11111111-1111-4111-8111-111111111111';

-- ตรวจสอบผล
select id, student_id, name, email, role from public.profiles order by created_at;
select id, display_name, user_id, active from public.counselors order by created_at;
