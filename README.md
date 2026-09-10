# Household Registry

Web UI สำหรับติดตามข้อมูลครอบครัว พัฒนาด้วย Vue 3 + Vite

ดีไซน์และเลย์เอาต์อ้างอิงจากภาพต้นแบบ: การ์ดแบบซ้อนชั้น (stacked card), พื้นหลังไล่เฉดสีเขียวมิ้นต์-ฟ้า-ม่วง, แถบไซด์บาร์กระจก (glassmorphism), แถบความคืบหน้า, ป้ายสถานะสี, และปุ่ม CTA ทรงกลม

## เมนูตัวอย่างที่ init มาให้

- **แดชบอร์ด** — สรุปภาพรวมครอบครัว: จำนวนสมาชิก, ลูกที่ติดตามพัฒนาการ, กรมธรรม์และสวัสดิการที่ใช้งานอยู่
- **สมาชิกครอบครัว** — เพิ่ม/จัดการสมาชิกในครอบครัว (ตัวเอง, คู่สมรส, ลูก, พ่อ, แม่, ปู่, ย่า, ตา, ยาย, อื่น ๆ) พร้อมวันเกิด อายุ และรูปโปรไฟล์ — คลิกที่แถวเพื่อเปิดหน้าโปรไฟล์รายบุคคล — **ส่งออก/นำเข้าเป็นไฟล์ JSON** ได้: กด "ส่งออก JSON" เพื่อดาวน์โหลดข้อมูลสมาชิกทั้งหมดพร้อมความสัมพันธ์ แก้ไขไฟล์แล้วกด "นำเข้า JSON" เพื่ออัปโหลดกลับเข้าระบบ (ระบบตรวจสอบข้อมูลและแสดงตัวอย่างก่อนยืนยันเสมอ)
- **ผังครอบครัว** — แผนผังความเชื่อมโยงของสมาชิก พร้อม **สลับมุมมองได้ว่าจะมองจากใคร** เช่น มองจากลูกจะเห็นเราเป็น "พ่อ" และปู่เป็น "ทวด" — คำเรียกญาติ (ปู่/ย่า/ตา/ยาย, ลุง/ป้า/น้า/อา, พี่/น้อง, เขย/สะใภ้) คำนวณจากกราฟความสัมพันธ์จริง
- **โปรไฟล์สมาชิก** — ข้อมูลส่วนตัวแบบละเอียด (ติดต่อ, สุขภาพ, อาชีพ), ประวัติการศึกษา, ประวัติการรักษา, พัฒนาการ, ประกัน และสวัสดิการของคนนั้น พร้อมแก้ไขข้อมูลและตั้งรูปโปรไฟล์ได้ (เลือกรูปสำเร็จรูปใน `public/avatars/`, อัปโหลดรูปจากเครื่อง หรือวางลิงก์รูป)
- **พัฒนาการลูก** — บันทึกและติดตามน้ำหนัก/ส่วนสูงของลูกตามช่วงเวลา พร้อมดูการเปลี่ยนแปลงล่าสุด
- **ประกัน** — จัดการกรมธรรม์ประกัน (ชีวิต, สุขภาพ, อุบัติเหตุ, รถยนต์ ฯลฯ) ของสมาชิกแต่ละคน พร้อมแจ้งเตือนใกล้หมดอายุ
- **สวัสดิการ** — ติดตามสวัสดิการและสิทธิประโยชน์ของสมาชิกแต่ละคน (ค่ารักษาพยาบาล, การศึกษา, เงินช่วยเหลือ ฯลฯ)
- **ตั้งค่า** — โปรไฟล์และการตั้งค่าระบบ

## เริ่มต้นใช้งาน

```bash
npm install
npm run dev      # เริ่ม dev server
npm run build    # build สำหรับ production
```

หากยังไม่ได้ตั้งค่า Supabase (ดูด้านล่าง) แอปจะทำงานด้วยข้อมูลตัวอย่าง (mock data) โดยอัตโนมัติ และจะมีข้อความแจ้งเตือนที่หัวตาราง

## ตั้งค่า Supabase (สำหรับข้อมูลจริง)

โปรเจกต์นี้เชื่อมต่อกับ [Supabase](https://supabase.com) เป็น backend/database ทุกหน้า (สมาชิกครอบครัว, พัฒนาการลูก, ประกัน, สวัสดิการ) ต่อกับฐานข้อมูลจริงแล้ว (อ่านข้อมูล + เพิ่มข้อมูลใหม่)

### ขั้นตอนสร้างโปรเจกต์ Supabase

1. สมัคร/ล็อกอินที่ https://supabase.com แล้วกด **New project**
2. ตั้งชื่อโปรเจกต์ (เช่น `family-tracker`) เลือก region ที่ใกล้ที่สุด และตั้งรหัสผ่านฐานข้อมูล แล้วกด **Create new project** (รอสักครู่ให้ provision เสร็จ)
3. เมื่อโปรเจกต์พร้อมแล้ว ไปที่เมนู **SQL Editor** (แถบซ้าย) → **New query**
4. คัดลอกเนื้อหาทั้งหมดจากไฟล์ [`supabase/schema.sql`](./supabase/schema.sql) ในโปรเจกต์นี้ วางแล้วกด **Run** — จะได้ตาราง `family_members`, `growth_records`, `insurance_policies`, `welfare_benefits`, `education_history`, `medical_records` พร้อมข้อมูลตัวอย่าง
   - หากเคยรัน schema เวอร์ชัน HR เดิมมาก่อน ให้รัน [`supabase/migrations/001_family_schema.sql`](./supabase/migrations/001_family_schema.sql) ก่อน เพื่อลบตารางเดิมทิ้ง แล้วค่อยรัน `schema.sql`
   - หากเคยรัน `schema.sql` เวอร์ชัน Family Tracker รุ่นแรกแล้ว (ยังไม่มีคอลัมน์ข้อมูลส่วนตัวละเอียด/ตารางการศึกษา-การรักษา) ให้รัน [`supabase/migrations/002_personal_details.sql`](./supabase/migrations/002_personal_details.sql) เพิ่มเติม
   - หากต้องการใส่รูปโปรไฟล์ตัวอย่างให้สมาชิกที่มีอยู่แล้ว ให้รัน [`supabase/migrations/003_profile_photos.sql`](./supabase/migrations/003_profile_photos.sql)
   - หากฐานข้อมูลยังไม่รองรับความสัมพันธ์ "พี่น้อง" (ใช้ในผังครอบครัว) ให้รัน [`supabase/migrations/004_sibling_relation.sql`](./supabase/migrations/004_sibling_relation.sql)
5. ไปที่ **Project Settings → API** คัดลอกค่า:
   - **Project URL** → ใช้เป็น `VITE_SUPABASE_URL`
   - **anon public key** → ใช้เป็น `VITE_SUPABASE_ANON_KEY`
6. คัดลอกไฟล์ `.env.example` เป็น `.env` แล้วใส่ค่าทั้งสอง:

   ```bash
   cp .env.example .env
   ```

   ```
   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

7. รัน `npm run dev` ใหม่ — ข้อความแจ้งเตือน mock data จะหายไป และปุ่ม "เพิ่ม..." ในแต่ละหน้าจะบันทึกลงฐานข้อมูลจริง

> **หมายเหตุด้านความปลอดภัย:** นโยบาย RLS ในไฟล์ `schema.sql` เปิดให้ anon key อ่าน/เขียนได้ทั้งหมดเพื่อความสะดวกในการทดลอง ก่อนนำไปใช้งานจริงควรเพิ่มระบบ authentication และจำกัดสิทธิ์ตาม `auth.uid()` หรือ role ของผู้ใช้

## Deploy ขึ้นโฮสต์ฟรี

โปรเจกต์นี้เป็น static SPA (build แล้วได้ไฟล์ static ล้วน) จึงใช้โฮสต์ฟรีสำหรับ static site ได้เลย แนะนำ **Vercel** หรือ **Netlify** — มี config พร้อมใช้ในโปรเจกต์แล้ว (`vercel.json`, `netlify.toml`) ที่ทำให้ client-side routing ของ Vue Router ทำงานถูกต้อง (กัน 404 ตอน refresh หน้าอื่นที่ไม่ใช่ `/`)

**หมายเหตุ:** Google Apps Script ไม่เหมาะกับ hosting เว็บแอปแบบนี้ เพราะไม่รองรับการเสิร์ฟไฟล์ static หลายไฟล์ (JS/CSS ที่ Vite แยก chunk) และไม่รองรับ SPA routing

### วิธี deploy ด้วย Vercel

1. ไปที่ https://vercel.com สมัคร/ล็อกอินด้วยบัญชี GitHub
2. กด **Add New → Project** แล้วเลือก repo `010c1507/hr-management-`
3. Framework Preset จะตรวจพบ "Vite" อัตโนมัติ (Build Command: `npm run build`, Output: `dist`)
4. ไปที่ **Environment Variables** เพิ่ม `VITE_SUPABASE_URL` และ `VITE_SUPABASE_ANON_KEY` (ค่าจากขั้นตอน Supabase ด้านบน)
5. กด **Deploy** — จากนั้นทุกครั้งที่ push โค้ดเข้า branch ที่เชื่อมไว้ Vercel จะ build และ deploy ให้อัตโนมัติ

### วิธี deploy ด้วย Netlify

1. ไปที่ https://netlify.com สมัคร/ล็อกอินด้วยบัญชี GitHub
2. กด **Add new site → Import an existing project** แล้วเลือก repo นี้
3. Build command: `npm run build`, Publish directory: `dist` (มีอยู่แล้วใน `netlify.toml`)
4. ไปที่ **Site configuration → Environment variables** เพิ่ม `VITE_SUPABASE_URL` และ `VITE_SUPABASE_ANON_KEY`
5. กด **Deploy site**

## โครงสร้างโปรเจกต์

```
src/
  assets/styles/   ตัวแปรสี, ดีไซน์ระบบ
  components/      ส่วนประกอบ UI ที่ใช้ร่วมกัน (Sidebar, Header, StatCard, ฯลฯ)
  layouts/         โครงหน้าหลัก (DashboardLayout)
  views/           หน้าเมนูต่าง ๆ
  lib/supabase.js  ตัว client เชื่อมต่อ Supabase
  router/          เส้นทางของแอป
  data/            ข้อมูลตัวอย่าง (mock data สำรอง)
supabase/schema.sql  SQL สร้างตาราง + RLS policy + seed data
supabase/migrations/ SQL สำหรับย้ายฐานข้อมูลเดิม (HR) มาเป็นระบบครอบครัว
```
