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

-- ระบบติดตามการสรรหา (Recruitment Tracking)
create table if not exists candidates (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  email text,
  position text not null,
  division text,
  department text,
  status text not null default 'in_progress' check (status in ('in_progress', 'onboard', 'failed', 'withdrawn')),
  expected_salary numeric(12, 2),
  offered_salary numeric(12, 2),
  remark text,
  created_at timestamptz not null default now()
);

create table if not exists candidate_stages (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates (id) on delete cascade,
  stage_key text not null check (stage_key in ('request', 'screening', 'interview', 'approval', 'offer', 'contract', 'onboard')),
  start_date date not null,
  end_date date,
  result text not null default 'รอดำเนินการ' check (result in ('รอดำเนินการ', 'ผ่าน', 'ไม่ผ่าน', 'ถอนตัว')),
  note text,
  created_at timestamptz not null default now(),
  unique (candidate_id, stage_key)
);

-- Row Level Security
alter table employees enable row level security;
alter table attendance enable row level security;
alter table leave_requests enable row level security;
alter table payroll enable row level security;
alter table candidates enable row level security;
alter table candidate_stages enable row level security;

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

create policy "demo_select_candidates" on candidates for select using (true);
create policy "demo_insert_candidates" on candidates for insert with check (true);
create policy "demo_update_candidates" on candidates for update using (true);
create policy "demo_delete_candidates" on candidates for delete using (true);

create policy "demo_select_candidate_stages" on candidate_stages for select using (true);
create policy "demo_insert_candidate_stages" on candidate_stages for insert with check (true);
create policy "demo_update_candidate_stages" on candidate_stages for update using (true);
create policy "demo_delete_candidate_stages" on candidate_stages for delete using (true);

-- Seed data ตัวอย่าง (ตรงกับ mock data เดิมในหน้าเว็บ)
insert into employees (employee_code, full_name, role, department, status) values
  ('EMP-001', 'มิเชล ชาวราช', 'UX Designer', 'Product', 'Active'),
  ('EMP-002', 'ธนพล ศรีสุข', 'Backend Engineer', 'Engineering', 'Active'),
  ('EMP-003', 'กมลชนก ใจดี', 'HR Specialist', 'People', 'On Leave'),
  ('EMP-004', 'ปิยะดา รุ่งเรือง', 'Product Manager', 'Product', 'Active'),
  ('EMP-005', 'อธิป มั่งมี', 'Accountant', 'Finance', 'Active'),
  ('EMP-006', 'ศิริพร แสงทอง', 'QA Engineer', 'Engineering', 'Inactive')
on conflict (employee_code) do nothing;

-- Seed ผู้สมัครตัวอย่าง (ข้อมูลสมมติ) พร้อมประวัติขั้นตอน
do $$
declare
  cand_id uuid;
begin
  if not exists (select 1 from candidates where email = 'parinya.w@example.com') then
    insert into candidates (full_name, phone, email, position, division, department, status, expected_salary, remark)
    values ('ปริญญา วงศ์สว่าง', '081-000-0001', 'parinya.w@example.com', 'Data Engineer', 'สายงานเทคโนโลยี', 'ฝ่ายบริหารจัดการงานวิศวกรรมข้อมูล', 'in_progress', 85000, 'นัดสัมภาษณ์รอบผู้บริหารกลุ่ม')
    returning id into cand_id;

    insert into candidate_stages (candidate_id, stage_key, start_date, end_date, result) values
      (cand_id, 'request', current_date - 25, current_date - 23, 'ผ่าน'),
      (cand_id, 'screening', current_date - 22, current_date - 18, 'ผ่าน'),
      (cand_id, 'interview', current_date - 10, null, 'รอดำเนินการ');
  end if;
end $$;
