-- เพิ่มข้อมูลส่วนบุคคลแบบละเอียด + ประวัติการศึกษา + ประวัติการรักษา
-- สำหรับฐานข้อมูลที่เคยรัน schema.sql เวอร์ชัน Family Tracker รุ่นแรกมาแล้ว
-- (ถ้าเพิ่งสร้างโปรเจกต์ใหม่ ให้รัน schema.sql อย่างเดียวพอ ไม่ต้องรันไฟล์นี้)

alter table family_members
  add column if not exists nickname text,
  add column if not exists blood_type text,
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists address text,
  add column if not exists occupation text,
  add column if not exists allergies text,
  add column if not exists chronic_conditions text,
  add column if not exists hospital text,
  add column if not exists hobbies text;

create table if not exists education_history (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references family_members (id) on delete cascade,
  level text not null,
  institution text not null,
  field text,
  start_year int,
  end_year int,
  status text not null default 'completed' check (status in ('studying', 'completed')),
  note text,
  created_at timestamptz not null default now()
);

create table if not exists medical_records (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references family_members (id) on delete cascade,
  record_date date not null default current_date,
  hospital text,
  doctor text,
  diagnosis text not null,
  treatment text,
  cost numeric(12, 2),
  note text,
  created_at timestamptz not null default now()
);

alter table education_history enable row level security;
alter table medical_records enable row level security;

drop policy if exists "demo_select_education_history" on education_history;
drop policy if exists "demo_insert_education_history" on education_history;
drop policy if exists "demo_update_education_history" on education_history;
drop policy if exists "demo_delete_education_history" on education_history;
create policy "demo_select_education_history" on education_history for select using (true);
create policy "demo_insert_education_history" on education_history for insert with check (true);
create policy "demo_update_education_history" on education_history for update using (true);
create policy "demo_delete_education_history" on education_history for delete using (true);

drop policy if exists "demo_select_medical_records" on medical_records;
drop policy if exists "demo_insert_medical_records" on medical_records;
drop policy if exists "demo_update_medical_records" on medical_records;
drop policy if exists "demo_delete_medical_records" on medical_records;
create policy "demo_select_medical_records" on medical_records for select using (true);
create policy "demo_insert_medical_records" on medical_records for insert with check (true);
create policy "demo_update_medical_records" on medical_records for update using (true);
create policy "demo_delete_medical_records" on medical_records for delete using (true);

-- เติมข้อมูลตัวอย่างให้สมาชิก demo ที่มีอยู่แล้ว (ข้ามถ้าไม่พบชื่อ)
update family_members set nickname = 'เอก', blood_type = 'O', phone = '081-234-5678', email = 'eak@example.com',
  address = '99/12 หมู่บ้านสุขสันต์ ถ.รามอินทรา แขวงท่าแร้ง เขตบางเขน กรุงเทพฯ 10230',
  occupation = 'Software Engineer บริษัท ABC จำกัด', allergies = '-', chronic_conditions = '-',
  hospital = 'โรงพยาบาลสินแพทย์', hobbies = 'วิ่ง, ถ่ายภาพ, อ่านหนังสือ'
  where full_name = 'เอกชัย ชาวราช' and nickname is null;
update family_members set nickname = 'พิม', blood_type = 'A', phone = '089-876-5432', email = 'pim@example.com',
  address = '99/12 หมู่บ้านสุขสันต์ ถ.รามอินทรา แขวงท่าแร้ง เขตบางเขน กรุงเทพฯ 10230',
  occupation = 'นักบัญชี บริษัท XYZ จำกัด', allergies = 'แพ้อาหารทะเล', chronic_conditions = '-',
  hospital = 'โรงพยาบาลสินแพทย์', hobbies = 'ทำอาหาร, โยคะ'
  where full_name = 'พิมพ์ชนก ชาวราช' and nickname is null;
update family_members set nickname = 'ภูมิ', blood_type = 'O',
  address = '99/12 หมู่บ้านสุขสันต์ ถ.รามอินทรา แขวงท่าแร้ง เขตบางเขน กรุงเทพฯ 10230',
  occupation = 'นักเรียนอนุบาล 2 โรงเรียนอนุบาลรุ่งเรือง', allergies = 'แพ้นมวัว (เล็กน้อย)', chronic_conditions = '-',
  hospital = 'โรงพยาบาลเด็กสมิติเวช', hobbies = 'ต่อเลโก้, วาดรูป, ว่ายน้ำ'
  where full_name = 'น้องภูมิ ชาวราช' and nickname is null;
update family_members set nickname = 'ใบตอง', blood_type = 'A',
  address = '99/12 หมู่บ้านสุขสันต์ ถ.รามอินทรา แขวงท่าแร้ง เขตบางเขน กรุงเทพฯ 10230',
  occupation = 'เนอสเซอรี่บ้านอุ่นรัก', allergies = '-', chronic_conditions = '-',
  hospital = 'โรงพยาบาลเด็กสมิติเวช', hobbies = 'ฟังเพลง, เล่นตุ๊กตา'
  where full_name = 'น้องใบตอง ชาวราช' and nickname is null;
update family_members set nickname = 'ชาย', blood_type = 'B', phone = '081-111-2222',
  address = '45 ถ.เพชรเกษม ต.หาดใหญ่ อ.หาดใหญ่ จ.สงขลา 90110',
  occupation = 'ข้าราชการบำนาญ', allergies = 'แพ้ยาเพนิซิลลิน', chronic_conditions = 'ความดันโลหิตสูง, เบาหวานชนิดที่ 2',
  hospital = 'โรงพยาบาลหาดใหญ่', hobbies = 'ปลูกต้นไม้, ตกปลา'
  where full_name = 'สมชาย ชาวราช' and nickname is null;
update family_members set nickname = 'ศรี', blood_type = 'O', phone = '081-333-4444',
  address = '45 ถ.เพชรเกษม ต.หาดใหญ่ อ.หาดใหญ่ จ.สงขลา 90110',
  occupation = 'แม่บ้าน', allergies = '-', chronic_conditions = 'ไขมันในเลือดสูง',
  hospital = 'โรงพยาบาลหาดใหญ่', hobbies = 'ทำขนม, สวดมนต์'
  where full_name = 'สมศรี ชาวราช' and nickname is null;

do $$
declare
  id_self uuid;
  id_spouse uuid;
  id_child1 uuid;
  id_child2 uuid;
  id_father uuid;
begin
  select id into id_self from family_members where full_name = 'เอกชัย ชาวราช' limit 1;
  select id into id_spouse from family_members where full_name = 'พิมพ์ชนก ชาวราช' limit 1;
  select id into id_child1 from family_members where full_name = 'น้องภูมิ ชาวราช' limit 1;
  select id into id_child2 from family_members where full_name = 'น้องใบตอง ชาวราช' limit 1;
  select id into id_father from family_members where full_name = 'สมชาย ชาวราช' limit 1;

  if id_self is not null and not exists (select 1 from education_history where member_id = id_self) then
    insert into education_history (member_id, level, institution, field, start_year, end_year, status) values
      (id_self, 'ปริญญาโท', 'จุฬาลงกรณ์มหาวิทยาลัย', 'วิศวกรรมคอมพิวเตอร์', 2013, 2015, 'completed'),
      (id_self, 'ปริญญาตรี', 'มหาวิทยาลัยเกษตรศาสตร์', 'วิศวกรรมคอมพิวเตอร์', 2008, 2012, 'completed'),
      (id_self, 'มัธยมศึกษา', 'โรงเรียนหาดใหญ่วิทยาลัย', 'วิทย์-คณิต', 2002, 2008, 'completed');
    insert into medical_records (member_id, record_date, hospital, doctor, diagnosis, treatment, cost) values
      (id_self, current_date - 200, 'โรงพยาบาลสินแพทย์', 'นพ.ประวิทย์', 'ตรวจสุขภาพประจำปี', 'ผลปกติ แนะนำออกกำลังกายสม่ำเสมอ', 4500);
  end if;
  if id_spouse is not null and not exists (select 1 from education_history where member_id = id_spouse) then
    insert into education_history (member_id, level, institution, field, start_year, end_year, status) values
      (id_spouse, 'ปริญญาตรี', 'มหาวิทยาลัยธรรมศาสตร์', 'บัญชี', 2009, 2013, 'completed');
  end if;
  if id_child1 is not null and not exists (select 1 from education_history where member_id = id_child1) then
    insert into education_history (member_id, level, institution, field, start_year, end_year, status) values
      (id_child1, 'อนุบาล', 'โรงเรียนอนุบาลรุ่งเรือง', 'อนุบาล 2', 2025, null, 'studying');
    insert into medical_records (member_id, record_date, hospital, doctor, diagnosis, treatment, cost) values
      (id_child1, current_date - 20, 'โรงพยาบาลเด็กสมิติเวช', 'พญ.กมลรัตน์', 'ไข้หวัดใหญ่สายพันธุ์ A', 'ยาต้านไวรัส Oseltamivir 5 วัน + ยาลดไข้', 3200),
      (id_child1, current_date - 120, 'โรงพยาบาลเด็กสมิติเวช', 'พญ.กมลรัตน์', 'ตรวจสุขภาพ + วัคซีน MMR เข็ม 2', 'ฉีดวัคซีนตามนัด', 1800);
  end if;
  if id_child2 is not null and not exists (select 1 from education_history where member_id = id_child2) then
    insert into education_history (member_id, level, institution, field, start_year, end_year, status) values
      (id_child2, 'เตรียมอนุบาล', 'เนอสเซอรี่บ้านอุ่นรัก', null, 2025, null, 'studying');
    insert into medical_records (member_id, record_date, hospital, doctor, diagnosis, treatment, cost) values
      (id_child2, current_date - 10, 'โรงพยาบาลเด็กสมิติเวช', 'นพ.ธีรพงษ์', 'วัคซีน DTP-HB-Hib เข็มกระตุ้น', 'ฉีดวัคซีนตามนัด', 2400);
  end if;
  if id_father is not null and not exists (select 1 from medical_records where member_id = id_father) then
    insert into medical_records (member_id, record_date, hospital, doctor, diagnosis, treatment, cost) values
      (id_father, current_date - 35, 'โรงพยาบาลหาดใหญ่', 'นพ.วิชัย', 'ติดตามเบาหวาน + ความดัน', 'ปรับยา Metformin, ตรวจ HbA1c', 1500);
  end if;
end $$;

-- ให้ PostgREST โหลด schema ใหม่ทันที (ไม่ต้องรอ)
notify pgrst, 'reload schema';
