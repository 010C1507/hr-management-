-- Family Tracker demo schema
-- วิธีใช้: เปิด Supabase Dashboard > SQL Editor > วางไฟล์นี้ทั้งหมด > Run

create extension if not exists pgcrypto;

-- สมาชิกในครอบครัว (ตัวเอง, คู่สมรส, ลูก, พ่อแม่, ปู่ย่าตายาย ฯลฯ)
create table if not exists family_members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  relation text not null check (
    relation in (
      'self', 'spouse', 'child',
      'father', 'mother',
      'grandfather_paternal', 'grandmother_paternal',
      'grandfather_maternal', 'grandmother_maternal',
      'other'
    )
  ),
  gender text check (gender in ('male', 'female', 'other')),
  birth_date date,
  photo_url text,
  note text,
  created_at timestamptz not null default now()
);

-- บันทึกการเติบโต (น้ำหนัก/ส่วนสูง) โดยเฉพาะสำหรับติดตามพัฒนาการของลูก
create table if not exists growth_records (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references family_members (id) on delete cascade,
  record_date date not null default current_date,
  weight_kg numeric(6, 2),
  height_cm numeric(6, 2),
  note text,
  created_at timestamptz not null default now()
);

-- กรมธรรม์ประกันของสมาชิกแต่ละคน
create table if not exists insurance_policies (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references family_members (id) on delete cascade,
  provider text not null,
  policy_type text not null check (policy_type in ('life', 'health', 'accident', 'car', 'other')),
  policy_number text,
  coverage_amount numeric(12, 2),
  premium numeric(12, 2),
  start_date date,
  end_date date,
  status text not null default 'active' check (status in ('active', 'expired', 'cancelled')),
  note text,
  created_at timestamptz not null default now()
);

-- สวัสดิการ/สิทธิประโยชน์ของสมาชิกแต่ละคน (เช่น สวัสดิการบริษัท, สิทธิรัฐ, ทุนการศึกษา)
create table if not exists welfare_benefits (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references family_members (id) on delete cascade,
  benefit_name text not null,
  provider text,
  benefit_type text not null default 'other' check (benefit_type in ('medical', 'education', 'allowance', 'other')),
  amount numeric(12, 2),
  valid_until date,
  status text not null default 'active' check (status in ('active', 'used', 'expired')),
  note text,
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table family_members enable row level security;
alter table growth_records enable row level security;
alter table insurance_policies enable row level security;
alter table welfare_benefits enable row level security;

-- นโยบายสำหรับ "ทดลองใช้" เท่านั้น: เปิดให้ทุกคน (รวม anon key) อ่าน/เขียนได้
-- ก่อนใช้งานจริงควรเปลี่ยนเป็นตรวจสอบ auth.uid() หรือ role ผู้ใช้แทน
create policy "demo_select_family_members" on family_members for select using (true);
create policy "demo_insert_family_members" on family_members for insert with check (true);
create policy "demo_update_family_members" on family_members for update using (true);
create policy "demo_delete_family_members" on family_members for delete using (true);

create policy "demo_select_growth_records" on growth_records for select using (true);
create policy "demo_insert_growth_records" on growth_records for insert with check (true);
create policy "demo_update_growth_records" on growth_records for update using (true);
create policy "demo_delete_growth_records" on growth_records for delete using (true);

create policy "demo_select_insurance_policies" on insurance_policies for select using (true);
create policy "demo_insert_insurance_policies" on insurance_policies for insert with check (true);
create policy "demo_update_insurance_policies" on insurance_policies for update using (true);
create policy "demo_delete_insurance_policies" on insurance_policies for delete using (true);

create policy "demo_select_welfare_benefits" on welfare_benefits for select using (true);
create policy "demo_insert_welfare_benefits" on welfare_benefits for insert with check (true);
create policy "demo_update_welfare_benefits" on welfare_benefits for update using (true);
create policy "demo_delete_welfare_benefits" on welfare_benefits for delete using (true);

-- Seed data ตัวอย่าง
do $$
declare
  id_self uuid;
  id_spouse uuid;
  id_child1 uuid;
  id_child2 uuid;
  id_father uuid;
  id_mother uuid;
  id_gf_paternal uuid;
  id_gm_paternal uuid;
  id_gf_maternal uuid;
  id_gm_maternal uuid;
begin
  if not exists (select 1 from family_members where full_name = 'เอกชัย ชาวราช') then
    insert into family_members (full_name, relation, gender, birth_date) values
      ('เอกชัย ชาวราช', 'self', 'male', '1990-04-12') returning id into id_self;
    insert into family_members (full_name, relation, gender, birth_date) values
      ('พิมพ์ชนก ชาวราช', 'spouse', 'female', '1991-08-03') returning id into id_spouse;
    insert into family_members (full_name, relation, gender, birth_date) values
      ('น้องภูมิ ชาวราช', 'child', 'male', '2021-02-15') returning id into id_child1;
    insert into family_members (full_name, relation, gender, birth_date) values
      ('น้องใบตอง ชาวราช', 'child', 'female', '2023-11-20') returning id into id_child2;
    insert into family_members (full_name, relation, gender, birth_date) values
      ('สมชาย ชาวราช', 'father', 'male', '1962-01-05') returning id into id_father;
    insert into family_members (full_name, relation, gender, birth_date) values
      ('สมศรี ชาวราช', 'mother', 'female', '1964-06-22') returning id into id_mother;
    insert into family_members (full_name, relation, gender, birth_date) values
      ('สมพงษ์ ชาวราช', 'grandfather_paternal', 'male', '1938-03-10') returning id into id_gf_paternal;
    insert into family_members (full_name, relation, gender, birth_date) values
      ('บุญมี ชาวราช', 'grandmother_paternal', 'female', '1941-09-18') returning id into id_gm_paternal;
    insert into family_members (full_name, relation, gender, birth_date) values
      ('ประเสริฐ ใจงาม', 'grandfather_maternal', 'male', '1940-11-02') returning id into id_gf_maternal;
    insert into family_members (full_name, relation, gender, birth_date) values
      ('ทองสุข ใจงาม', 'grandmother_maternal', 'female', '1943-05-27') returning id into id_gm_maternal;

    insert into growth_records (member_id, record_date, weight_kg, height_cm, note) values
      (id_child1, current_date - 540, 9.8, 74.0, null),
      (id_child1, current_date - 450, 10.4, 77.5, null),
      (id_child1, current_date - 360, 10.9, 79.8, null),
      (id_child1, current_date - 270, 11.2, 81.0, null),
      (id_child1, current_date - 180, 11.5, 82.0, null),
      (id_child1, current_date - 90, 12.3, 85.5, null),
      (id_child1, current_date, 13.0, 88.0, 'ตรวจสุขภาพประจำปีที่คลินิกเด็ก'),
      (id_child2, current_date - 275, 3.4, 50.5, 'แรกเกิด'),
      (id_child2, current_date - 184, 5.0, 55.0, null),
      (id_child2, current_date - 90, 5.8, 58.0, null),
      (id_child2, current_date, 6.9, 63.5, 'ฉีดวัคซีนตามนัด');

    insert into insurance_policies (member_id, provider, policy_type, policy_number, coverage_amount, premium, start_date, end_date, status) values
      (id_self, 'เมืองไทยประกันชีวิต', 'life', 'LF-100234', 1000000, 18000, current_date - 200, current_date + 165, 'active'),
      (id_spouse, 'ไทยประกันชีวิต', 'health', 'HL-330012', 500000, 15000, current_date - 220, current_date + 75, 'active'),
      (id_child1, 'AIA', 'health', 'HL-556677', 300000, 9500, current_date - 100, current_date + 265, 'active'),
      (id_child2, 'AIA', 'health', 'HL-556699', 300000, 9500, current_date - 30, current_date + 335, 'active'),
      (id_father, 'กรุงไทย-แอกซ่า', 'health', 'HL-778821', 200000, 22000, current_date - 150, current_date + 400, 'active'),
      (id_mother, 'กรุงไทย-แอกซ่า', 'health', 'HL-778822', 200000, 22000, current_date - 150, current_date + 400, 'active'),
      (id_self, 'วิริยะประกันภัย', 'car', 'CR-991045', 800000, 12500, current_date - 550, current_date - 100, 'expired');

    insert into welfare_benefits (member_id, benefit_name, provider, benefit_type, amount, valid_until, status) values
      (id_self, 'สวัสดิการค่ารักษาพยาบาลพนักงาน', 'บริษัท ABC จำกัด', 'medical', 20000, current_date + 200, 'active'),
      (id_spouse, 'สวัสดิการค่ารักษาพยาบาลพนักงาน', 'บริษัท XYZ จำกัด', 'medical', 15000, current_date + 200, 'active'),
      (id_child1, 'เงินสงเคราะห์บุตร ประกันสังคม', 'สำนักงานประกันสังคม', 'allowance', 800, current_date + 365, 'active'),
      (id_child2, 'เงินสงเคราะห์บุตร ประกันสังคม', 'สำนักงานประกันสังคม', 'allowance', 800, current_date + 365, 'active'),
      (id_child1, 'ทุนการศึกษาอนุบาล', 'โรงเรียนอนุบาลรุ่งเรือง', 'education', 5000, current_date + 600, 'active'),
      (id_father, 'บัตรสวัสดิการแห่งรัฐ', 'กระทรวงการคลัง', 'allowance', 300, current_date + 20, 'active'),
      (id_mother, 'เบี้ยยังชีพผู้สูงอายุ', 'เทศบาลเมือง', 'allowance', 700, current_date + 115, 'active'),
      (id_gf_paternal, 'เบี้ยยังชีพผู้สูงอายุ', 'เทศบาลเมือง', 'allowance', 1000, current_date + 115, 'active'),
      (id_gm_paternal, 'สิทธิบัตรทอง 30 บาท', 'สำนักงานหลักประกันสุขภาพแห่งชาติ', 'medical', 0, current_date + 480, 'active');
  end if;
end $$;
