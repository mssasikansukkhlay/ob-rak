import { defineConfig, loadEnv } from 'vite';
import { createClient } from '@supabase/supabase-js';

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch (error) { reject(error); }
    });
    req.on('error', reject);
  });
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [{
      name: 'ob-rak-user-id-login-dev',
      configureServer(server) {
        server.middlewares.use('/api/login', async (req, res, next) => {
          if (req.method !== 'POST') return next();
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          try {
            const body = await readJson(req);
            const userId = String(body.userId || '').trim().toLowerCase();
            const password = String(body.password || '');
            const url = env.VITE_SUPABASE_URL;
            const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;
            const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
            if (!url || !publishableKey || !serviceRoleKey) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ message: 'กรุณาเพิ่ม SUPABASE_SERVICE_ROLE_KEY ใน .env.local' }));
            }
            const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
            const { data: profile } = await admin.from('profiles').select('email').ilike('student_id', userId).maybeSingle();
            if (!profile?.email) {
              res.statusCode = 401;
              return res.end(JSON.stringify({ message: 'USER ID หรือรหัสผ่านไม่ถูกต้อง' }));
            }
            const client = createClient(url, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
            const { data, error } = await client.auth.signInWithPassword({ email: profile.email, password });
            if (error || !data.session) {
              res.statusCode = 401;
              const message = String(error?.message || '').toLowerCase().includes('email not confirmed')
                ? 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ'
                : 'USER ID หรือรหัสผ่านไม่ถูกต้อง';
              return res.end(JSON.stringify({ message }));
            }
            res.statusCode = 200;
            res.end(JSON.stringify({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
              expires_at: data.session.expires_at
            }));
          } catch (error) {
            console.error(error);
            res.statusCode = 500;
            res.end(JSON.stringify({ message: 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่' }));
          }
        });
      }
    }]
  };
});
