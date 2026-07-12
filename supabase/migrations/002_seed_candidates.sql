-- Seed ข้อมูลผู้สมัครตัวอย่าง 7 คน (ข้อมูลสมมติทั้งหมด)
-- วันที่คำนวณจาก current_date เพื่อให้ข้อมูลสดใหม่เสมอ
-- รันใน Supabase Dashboard > SQL Editor > New query > Run

do $$
declare
  c1 uuid; c2 uuid; c3 uuid; c4 uuid; c5 uuid; c6 uuid; c7 uuid;
begin

  -- 1. ปริญญา วงศ์สว่าง — Data Engineer (กำลังสัมภาษณ์)
  if not exists (select 1 from candidates where email = 'parinya.w@example.com') then
    insert into candidates (full_name, phone, email, position, division, department, status, expected_salary, remark)
    values ('ปริญญา วงศ์สว่าง','081-000-0001','parinya.w@example.com','Data Engineer','สายงานเทคโนโลยี','ฝ่ายบริหารจัดการงานวิศวกรรมข้อมูล','in_progress',85000,'นัดสัมภาษณ์รอบผู้บริหารกลุ่ม รอยืนยันวัน')
    returning id into c1;
    insert into candidate_stages (candidate_id,stage_key,start_date,end_date,result) values
      (c1,'request',   current_date-25, current_date-23, 'ผ่าน'),
      (c1,'screening', current_date-22, current_date-18, 'ผ่าน'),
      (c1,'interview', current_date-10, null,            'รอดำเนินการ');
  end if;

  -- 2. ชลธิชา บุญมาก — System Analyst (รอต่อรองค่าตอบแทน)
  if not exists (select 1 from candidates where email = 'chonthicha.b@example.com') then
    insert into candidates (full_name, phone, email, position, division, department, status, expected_salary, offered_salary, remark)
    values ('ชลธิชา บุญมาก','081-000-0002','chonthicha.b@example.com','System Analyst','สายงานเทคโนโลยี','ฝ่ายพัฒนาระบบงาน Core Banking System','in_progress',72000,70000,'ต่อรองค่าตอบแทนรอบที่ 2')
    returning id into c2;
    insert into candidate_stages (candidate_id,stage_key,start_date,end_date,result) values
      (c2,'request',   current_date-40, current_date-38, 'ผ่าน'),
      (c2,'screening', current_date-37, current_date-33, 'ผ่าน'),
      (c2,'interview', current_date-30, current_date-24, 'ผ่าน'),
      (c2,'approval',  current_date-23, current_date-20, 'ผ่าน'),
      (c2,'offer',     current_date-4,  null,            'รอดำเนินการ');
  end if;

  -- 3. กิตติพงศ์ รักเรียน — รองผู้อำนวยการฝ่าย (เข้างานแล้ว)
  if not exists (select 1 from candidates where email = 'kittipong.r@example.com') then
    insert into candidates (full_name, phone, email, position, division, department, status, expected_salary, offered_salary, remark)
    values ('กิตติพงศ์ รักเรียน','081-000-0003','kittipong.r@example.com','รองผู้อำนวยการฝ่าย','สายงานเทคโนโลยี','ฝ่าย Data Protection','onboard',130000,140000,'อนุมัติค่าตอบแทนจากผู้บริหารกลุ่มเรียบร้อย เริ่มงานแล้ว')
    returning id into c3;
    insert into candidate_stages (candidate_id,stage_key,start_date,end_date,result) values
      (c3,'request',   current_date-60, current_date-58, 'ผ่าน'),
      (c3,'screening', current_date-57, current_date-53, 'ผ่าน'),
      (c3,'interview', current_date-50, current_date-46, 'ผ่าน'),
      (c3,'approval',  current_date-45, current_date-42, 'ผ่าน'),
      (c3,'offer',     current_date-41, current_date-38, 'ผ่าน'),
      (c3,'contract',  current_date-37, current_date-31, 'ผ่าน'),
      (c3,'onboard',   current_date-30, current_date-30, 'ผ่าน');
  end if;

  -- 4. สุนิสา แจ่มใส — QA Engineer (คัดกรองใบสมัคร)
  if not exists (select 1 from candidates where email = 'sunisa.j@example.com') then
    insert into candidates (full_name, phone, email, position, division, department, status, expected_salary, remark)
    values ('สุนิสา แจ่มใส','081-000-0004','sunisa.j@example.com','QA Engineer','สายงานเทคโนโลยี','ฝ่ายทดสอบและควบคุมคุณภาพระบบงาน (TQA)','in_progress',55000,'รอผลตรวจสอบคุณสมบัติเบื้องต้น')
    returning id into c4;
    insert into candidate_stages (candidate_id,stage_key,start_date,end_date,result) values
      (c4,'request',   current_date-8, current_date-6, 'ผ่าน'),
      (c4,'screening', current_date-3, null,           'รอดำเนินการ');
  end if;

  -- 5. อรรถพล ตั้งใจ — DevOps Engineer (ไม่ผ่านสัมภาษณ์)
  if not exists (select 1 from candidates where email = 'attapol.t@example.com') then
    insert into candidates (full_name, phone, email, position, division, department, status, expected_salary, remark)
    values ('อรรถพล ตั้งใจ','081-000-0005','attapol.t@example.com','DevOps Engineer','สายงานเทคโนโลยี','สนับสนุนเทคโนโลยีและควบคุมผู้ให้บริการภายนอก','failed',90000,'ผลสัมภาษณ์ไม่ผ่านเกณฑ์ด้านประสบการณ์')
    returning id into c5;
    insert into candidate_stages (candidate_id,stage_key,start_date,end_date,result) values
      (c5,'request',   current_date-55, current_date-53, 'ผ่าน'),
      (c5,'screening', current_date-52, current_date-48, 'ผ่าน'),
      (c5,'interview', current_date-45, current_date-40, 'ไม่ผ่าน');
  end if;

  -- 6. เมธาวี ศรีวิไล — Business Analyst (ถอนตัว)
  if not exists (select 1 from candidates where email = 'methawee.s@example.com') then
    insert into candidates (full_name, phone, email, position, division, department, status, expected_salary, offered_salary, remark)
    values ('เมธาวี ศรีวิไล','081-000-0006','methawee.s@example.com','Business Analyst','สายงานเทคโนโลยี','ฝ่ายวิเคราะห์และพัฒนากระบวนการ','withdrawn',65000,63000,'ผู้สมัครถอนตัว ได้รับข้อเสนอจากที่อื่น')
    returning id into c6;
    insert into candidate_stages (candidate_id,stage_key,start_date,end_date,result) values
      (c6,'request',   current_date-70, current_date-68, 'ผ่าน'),
      (c6,'screening', current_date-67, current_date-63, 'ผ่าน'),
      (c6,'interview', current_date-60, current_date-55, 'ผ่าน'),
      (c6,'approval',  current_date-54, current_date-51, 'ผ่าน'),
      (c6,'offer',     current_date-50, current_date-46, 'ผ่าน'),
      (c6,'contract',  current_date-45, current_date-42, 'ถอนตัว');
  end if;

  -- 7. ภูริทัต คำแก้ว — Mobile Developer (รับเรื่องใหม่)
  if not exists (select 1 from candidates where email = 'phuritat.k@example.com') then
    insert into candidates (full_name, phone, email, position, division, department, status, expected_salary, remark)
    values ('ภูริทัต คำแก้ว','081-000-0007','phuritat.k@example.com','Mobile Developer','สายงานเทคโนโลยี','ฝ่ายพัฒนาช่องทางอิเล็กทรอนิกส์และผลิตภัณฑ์บัตร','in_progress',68000,'เปิดอัตราใหม่ รออนุมัติกรอบอัตรากำลัง')
    returning id into c7;
    insert into candidate_stages (candidate_id,stage_key,start_date,end_date,result) values
      (c7,'request', current_date-1, null, 'รอดำเนินการ');
  end if;

end $$;
