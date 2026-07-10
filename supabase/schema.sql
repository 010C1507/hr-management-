-- HR Management demo schema
-- วิธีใช้: เปิด Supabase Dashboard > SQL Editor > วางไฟล์นี้ทั้งหมด > Run

create extension if not exists pgcrypto;

create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  employee_code text unique not null,
  full_name text not null,
  role text not null,
  department text not null,
  status text not null default 'Active' check (status in ('Active', 'On Leave', 'Inactive')),
  created_at timestamptz not null default now()
);

create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees (id) on delete cascade,
  work_date date not null default current_date,
  check_in time,
  check_out time,
  status text not null default 'มาปกติ' check (status in ('มาปกติ', 'มาสาย', 'ลา', 'ขาดงาน')),
  created_at timestamptz not null default now()
);

create table if not exists leave_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees (id) on delete cascade,
  leave_type text not null,
  start_date date not null,
  end_date date not null,
  status text not null default 'รออนุมัติ' check (status in ('อนุมัติ', 'รออนุมัติ', 'ปฏิเสธ')),
  created_at timestamptz not null default now()
);

create table if not exists payroll (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees (id) on delete cascade,
  period date not null default date_trunc('month', current_date),
  salary numeric(12, 2) not null,
  bonus numeric(12, 2) not null default 0,
  status text not null default 'รอดำเนินการ' check (status in ('จ่ายแล้ว', 'รอดำเนินการ')),
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table employees enable row level security;
alter table attendance enable row level security;
alter table leave_requests enable row level security;
alter table payroll enable row level security;

-- นโยบายสำหรับ "ทดลองใช้" เท่านั้น: เปิดให้ทุกคน (รวม anon key) อ่าน/เขียนได้
-- ก่อนใช้งานจริงควรเปลี่ยนเป็นตรวจสอบ auth.uid() หรือ role ผู้ใช้แทน
create policy "demo_select_employees" on employees for select using (true);
create policy "demo_insert_employees" on employees for insert with check (true);
create policy "demo_update_employees" on employees for update using (true);
create policy "demo_delete_employees" on employees for delete using (true);

create policy "demo_select_attendance" on attendance for select using (true);
create policy "demo_insert_attendance" on attendance for insert with check (true);
create policy "demo_update_attendance" on attendance for update using (true);

create policy "demo_select_leave" on leave_requests for select using (true);
create policy "demo_insert_leave" on leave_requests for insert with check (true);
create policy "demo_update_leave" on leave_requests for update using (true);

create policy "demo_select_payroll" on payroll for select using (true);
create policy "demo_insert_payroll" on payroll for insert with check (true);
create policy "demo_update_payroll" on payroll for update using (true);

-- Seed data ตัวอย่าง (ตรงกับ mock data เดิมในหน้าเว็บ)
insert into employees (employee_code, full_name, role, department, status) values
  ('EMP-001', 'มิเชล ชาวราช', 'UX Designer', 'Product', 'Active'),
  ('EMP-002', 'ธนพล ศรีสุข', 'Backend Engineer', 'Engineering', 'Active'),
  ('EMP-003', 'กมลชนก ใจดี', 'HR Specialist', 'People', 'On Leave'),
  ('EMP-004', 'ปิยะดา รุ่งเรือง', 'Product Manager', 'Product', 'Active'),
  ('EMP-005', 'อธิป มั่งมี', 'Accountant', 'Finance', 'Active'),
  ('EMP-006', 'ศิริพร แสงทอง', 'QA Engineer', 'Engineering', 'Inactive')
on conflict (employee_code) do nothing;
