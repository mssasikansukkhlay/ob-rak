# ห้องโอบรัก (Ob Rak) — Supabase + Vercel

เว็บดูแลสุขภาพใจสำหรับนักศึกษาพยาบาล มทร.ธัญบุรี เวอร์ชันนี้เปลี่ยนจาก Node.js + SQLite มาใช้:

- **Supabase Auth** สำหรับสมัครสมาชิก เข้าสู่ระบบ และยืนยันอีเมล
- **Supabase PostgreSQL** สำหรับเก็บข้อมูล
- **Row Level Security (RLS)** จำกัดสิทธิ์ข้อมูลตามผู้ใช้
- **Vite** สำหรับเปิดและ build หน้าเว็บ
- **Vercel** สำหรับนำเว็บขึ้นออนไลน์

## ฟังก์ชัน

- สมัครสมาชิกและเข้าสู่ระบบด้วยอีเมล
- บัญชีนักศึกษา ผู้ให้คำปรึกษา และผู้ดูแล
- เช็กอินอารมณ์ ความเครียด และพลังใจ
- แบบประเมินสุขภาพใจและประวัติผล
- จอง เลื่อน และยกเลิกนัดพูดคุย
- ป้องกันการจองเวลาซ้ำด้วยฐานข้อมูล
- แดชบอร์ดผู้ให้คำปรึกษา
- สถิติสำหรับผู้ดูแล
- สมุดบันทึกโอบใจส่วนตัว
- ฝึกหายใจ Grounding สถานการณ์จำลอง และ Flashcard

---

## 1. เปิดโฟลเดอร์ใน VS Code

เปิด VS Code แล้วเลือก:

```text
File > Open Folder...
```

เลือกโฟลเดอร์ `ob-rak-supabase-vercel`

เปิด Terminal ผ่าน:

```text
Terminal > New Terminal
```

ตรวจสอบ Node.js:

```bash
node -v
npm -v
```

แนะนำ Node.js 22 ขึ้นไป

---

## 2. สร้างโปรเจกต์ Supabase

1. เข้า Supabase Dashboard
2. กด **New project**
3. ตั้งชื่อโปรเจกต์ เช่น `ob-rak`
4. ตั้งรหัสผ่านฐานข้อมูลและเลือก Region
5. รอจนโปรเจกต์สร้างเสร็จ

จากนั้นไปที่:

```text
SQL Editor > New query
```

เปิดไฟล์นี้ใน VS Code:

```text
supabase/schema.sql
```

คัดลอกทั้งหมดไปวางใน SQL Editor แล้วกด **Run** หนึ่งครั้ง

ไฟล์นี้จะสร้างตาราง ฟังก์ชันจองนัด RLS และข้อมูลผู้ให้คำปรึกษาตัวอย่าง

---

## 3. นำ Supabase URL และ Publishable key มาใส่

ใน Supabase ไปที่:

```text
Project Settings > API Keys
```

คัดลอก:

- Project URL
- Publishable key ที่ขึ้นต้นด้วย `sb_publishable_`

กลับมาที่ VS Code สร้างไฟล์ชื่อ `.env.local` ในโฟลเดอร์หลัก แล้วใส่:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
```

ห้ามใส่ Secret key หรือ Service Role key ในไฟล์หน้าเว็บเด็ดขาด

---

## 4. ตั้งค่า URL สำหรับยืนยันอีเมล

ใน Supabase ไปที่:

```text
Authentication > URL Configuration
```

ตอนทดสอบในเครื่องให้เพิ่ม:

```text
Site URL: http://localhost:5173
Redirect URLs: http://localhost:5173/**
```

หลังนำขึ้น Vercel แล้ว ให้เปลี่ยน Site URL เป็น URL จริงของเว็บ เช่น:

```text
https://ob-rak.vercel.app
```

และเพิ่ม Redirect URL:

```text
https://ob-rak.vercel.app/**
```

---

## 5. เปิดเว็บในเครื่อง

ใน Terminal ของ VS Code พิมพ์:

```bash
npm install
npm run dev
```

Terminal จะแสดง URL ประมาณ:

```text
http://localhost:5173
```

กด Command ค้างแล้วคลิกลิงก์ หรือคัดลอกไปเปิดใน Safari/Chrome

---

## 6. สร้างบัญชีผู้ดูแลและผู้ให้คำปรึกษา

ทุกบัญชีที่สมัครจากหน้าเว็บจะเริ่มเป็น `student` เพื่อป้องกันผู้ใช้ตั้งตัวเองเป็นผู้ดูแล

1. สมัครบัญชีผู้ดูแลและบัญชีผู้ให้คำปรึกษาผ่านหน้าเว็บก่อน
2. เปิดไฟล์:

```text
supabase/roles-setup.sql
```

3. เปลี่ยนอีเมลตัวอย่างเป็นอีเมลจริง
4. นำ SQL ไป Run ใน Supabase SQL Editor

---

## 7. นำเว็บขึ้น Vercel

### วิธีผ่าน GitHub

1. สร้าง Repository ใหม่ใน GitHub
2. ใน Terminal พิมพ์:

```bash
git init
git add .
git commit -m "Ob Rak Supabase version"
git branch -M main
git remote add origin URL_REPOSITORY_ของคุณ
git push -u origin main
```

3. เข้า Vercel แล้วกด **Add New > Project**
4. เลือก Repository นี้
5. Vercel จะตรวจพบ Vite อัตโนมัติ
6. เพิ่ม Environment Variables:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

7. กด **Deploy**

หลังแก้ Environment Variables ต้อง Redeploy เพื่อให้ค่าถูกนำไปใช้กับ build ใหม่

---

## โครงสร้างไฟล์

```text
ob-rak-supabase-vercel/
├── index.html
├── package.json
├── vercel.json
├── .env.example
├── public/
│   └── manifest.json
├── src/
│   ├── app.js
│   └── styles.css
└── supabase/
    ├── schema.sql
    └── roles-setup.sql
```

## การแก้ส่วนต่าง ๆ

- ข้อความและโครงสร้างหน้าเว็บ: `index.html`
- สีและการจัดหน้า: `src/styles.css`
- ฟังก์ชันหน้าเว็บและ Supabase: `src/app.js`
- ตาราง ฐานข้อมูล และ RLS: `supabase/schema.sql`
- ตั้งสิทธิ์ผู้ดูแล/ผู้ให้คำปรึกษา: `supabase/roles-setup.sql`

## คำเตือนก่อนใช้จริง

ระบบนี้เป็นฐานสำหรับโครงงานและการทดสอบ แม้จะมี Auth และ RLS แล้ว แต่ข้อมูลสุขภาพจิตเป็นข้อมูลอ่อนไหว ก่อนเปิดใช้จริงควรให้มหาวิทยาลัย ผู้เชี่ยวชาญด้านความปลอดภัย และผู้รับผิดชอบ PDPA ตรวจสอบเพิ่มเติม เช่น ระยะเวลาเก็บข้อมูล การขอความยินยอม การลบข้อมูล การแจ้งเหตุข้อมูลรั่ว และขั้นตอนช่วยเหลือกรณีฉุกเฉิน
