import { createClient } from '@supabase/supabase-js';

function json(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function normalizeUserId(value) {
  return String(value || '').trim().toLowerCase();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { message: 'Method not allowed' });

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !publishableKey || !serviceRoleKey) {
    return json(res, 500, { message: 'ระบบล็อกอินยังตั้งค่า Environment Variables ไม่ครบ' });
  }

  const userId = normalizeUserId(req.body?.userId);
  const password = String(req.body?.password || '');
  if (!/^[a-z0-9._-]{3,30}$/i.test(userId) || !password) {
    return json(res, 400, { message: 'USER ID หรือรหัสผ่านไม่ถูกต้อง' });
  }

  try {
    // service role ใช้เฉพาะฝั่ง server เพื่อค้นหาอีเมลจาก USER ID และห้ามส่ง key กลับไปหน้าเว็บ
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('email')
      .ilike('student_id', userId)
      .maybeSingle();

    if (profileError || !profile?.email) {
      return json(res, 401, { message: 'USER ID หรือรหัสผ่านไม่ถูกต้อง' });
    }

    const authClient = createClient(supabaseUrl, publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data, error } = await authClient.auth.signInWithPassword({
      email: profile.email,
      password
    });

    if (error || !data.session) {
      const message = String(error?.message || '').toLowerCase().includes('email not confirmed')
        ? 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ'
        : 'USER ID หรือรหัสผ่านไม่ถูกต้อง';
      return json(res, 401, { message });
    }

    return json(res, 200, {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at
    });
  } catch (error) {
    console.error('login error', error);
    return json(res, 500, { message: 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่' });
  }
}
