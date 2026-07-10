# HR Management

Web UI สำหรับระบบจัดการทรัพยากรบุคคล (HR Management) พัฒนาด้วย Vue 3 + Vite

ดีไซน์และเลย์เอาต์อ้างอิงจากภาพต้นแบบ: การ์ดแบบซ้อนชั้น (stacked card), พื้นหลังไล่เฉดสีเขียวมิ้นต์-ฟ้า-ม่วง, แถบไซด์บาร์กระจก (glassmorphism), แถบความคืบหน้า, ป้ายสถานะสี, และปุ่ม CTA ทรงกลม

## เมนูตัวอย่างที่ init มาให้

- **แดชบอร์ด** — สรุปภาพรวมสไตล์ตามภาพต้นแบบ (คะแนนดาว, สถิติชั่วโมงทำงาน/วันลา)
- **พนักงาน** — รายชื่อและสถานะพนักงาน
- **เวลาเข้า-ออกงาน** — บันทึกเวลาเข้า-ออกงานประจำวัน
- **การลา** — คำขอลาและสถานะการอนุมัติ
- **เงินเดือน** — สรุปเงินเดือนและโบนัส
- **รายงาน** — ตัวชี้วัด HR ภาพรวม
- **ตั้งค่า** — โปรไฟล์และการตั้งค่าระบบ

## เริ่มต้นใช้งาน

```bash
npm install
npm run dev      # เริ่ม dev server
npm run build    # build สำหรับ production
```

หากยังไม่ได้ตั้งค่า Supabase (ดูด้านล่าง) แอปจะทำงานด้วยข้อมูลตัวอย่าง (mock data) ในหน้า "พนักงาน" โดยอัตโนมัติ และจะมีข้อความแจ้งเตือนที่หัวตาราง

## ตั้งค่า Supabase (สำหรับข้อมูลจริง)

โปรเจกต์นี้เชื่อมต่อกับ [Supabase](https://supabase.com) เป็น backend/database ตัวอย่าง หน้า **พนักงาน** ถูกต่อกับฐานข้อมูลจริงแล้ว (อ่านรายชื่อ + เพิ่มพนักงานใหม่) ส่วนหน้าอื่น ๆ ยังใช้ mock data อยู่และสามารถต่อยอดตามแพทเทิร์นเดียวกันได้

### ขั้นตอนสร้างโปรเจกต์ Supabase

1. สมัคร/ล็อกอินที่ https://supabase.com แล้วกด **New project**
2. ตั้งชื่อโปรเจกต์ (เช่น `hr-management`) เลือก region ที่ใกล้ที่สุด และตั้งรหัสผ่านฐานข้อมูล แล้วกด **Create new project** (รอสักครู่ให้ provision เสร็จ)
3. เมื่อโปรเจกต์พร้อมแล้ว ไปที่เมนู **SQL Editor** (แถบซ้าย) → **New query**
4. คัดลอกเนื้อหาทั้งหมดจากไฟล์ [`supabase/schema.sql`](./supabase/schema.sql) ในโปรเจกต์นี้ วางแล้วกด **Run** — จะได้ตาราง `employees`, `attendance`, `leave_requests`, `payroll` พร้อมข้อมูลตัวอย่าง
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

7. รัน `npm run dev` ใหม่ — ไปที่หน้า "พนักงาน" ข้อความแจ้งเตือน mock data จะหายไป และปุ่ม "เพิ่มพนักงาน" จะบันทึกลงฐานข้อมูลจริง

> **หมายเหตุด้านความปลอดภัย:** นโยบาย RLS ในไฟล์ `schema.sql` เปิดให้ anon key อ่าน/เขียนได้ทั้งหมดเพื่อความสะดวกในการทดลอง ก่อนนำไปใช้งานจริงควรเพิ่มระบบ authentication และจำกัดสิทธิ์ตาม `auth.uid()` หรือ role ของผู้ใช้

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
```
