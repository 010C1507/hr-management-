-- แก้ไขข้อมูลลูกจากชื่อตัวอย่าง (demo) ให้เป็นข้อมูลจริง
-- รันไฟล์นี้บน Supabase project ที่เคยรัน schema.sql (รุ่นที่มี "น้องภูมิ ชาวราช" / "น้องใบตอง ชาวราช") มาก่อน

do $$
declare
  id_child1 uuid;
  id_child2 uuid;
begin
  select id into id_child1 from family_members where full_name = 'น้องภูมิ ชาวราช';
  select id into id_child2 from family_members where full_name = 'น้องใบตอง ชาวราช';

  if id_child1 is not null then
    update family_members set
      full_name = 'กวินท์ณภัทร ริยาพันธ์',
      nickname = 'วินเนอร์',
      gender = 'male',
      birth_date = '2021-05-20',
      photo_url = '/avatars/boy-1.svg',
      blood_type = null,
      occupation = null,
      allergies = null,
      chronic_conditions = null,
      hospital = null,
      hobbies = null
    where id = id_child1;

    -- ล้างข้อมูลตัวอย่าง (fabricated) เดิมที่ผูกกับเด็กคนนี้ทิ้ง แล้วใส่แค่น้ำหนักแรกเกิดที่เป็นข้อมูลจริง
    delete from education_history where member_id = id_child1;
    delete from medical_records where member_id = id_child1;
    delete from growth_records where member_id = id_child1;
    delete from insurance_policies where member_id = id_child1;
    delete from welfare_benefits where member_id = id_child1;
    insert into growth_records (member_id, record_date, weight_kg, note)
      values (id_child1, '2021-05-20', 2.9, 'น้ำหนักแรกเกิด');
  end if;

  if id_child2 is not null then
    update family_members set
      full_name = 'ชินท์ณภัทร์ ริยาพันธ์',
      nickname = 'โอชิน',
      gender = 'male',
      birth_date = '2023-07-07',
      photo_url = '/avatars/boy-1.svg',
      blood_type = null,
      occupation = null,
      allergies = null,
      chronic_conditions = null,
      hospital = null,
      hobbies = null
    where id = id_child2;

    delete from education_history where member_id = id_child2;
    delete from medical_records where member_id = id_child2;
    delete from growth_records where member_id = id_child2;
    delete from insurance_policies where member_id = id_child2;
    delete from welfare_benefits where member_id = id_child2;
    insert into growth_records (member_id, record_date, weight_kg, note)
      values (id_child2, '2023-07-07', 3.4, 'น้ำหนักแรกเกิด');
  end if;
end $$;

notify pgrst, 'reload schema';
