-- เพิ่มความสัมพันธ์ "พี่น้อง" (sibling) เพื่อใช้ในผังครอบครัว
-- สำหรับฐานข้อมูลที่รัน schema.sql มาก่อนแล้ว

alter table family_members drop constraint if exists family_members_relation_check;
alter table family_members add constraint family_members_relation_check check (
  relation in (
    'self', 'spouse', 'child', 'sibling',
    'father', 'mother',
    'grandfather_paternal', 'grandmother_paternal',
    'grandfather_maternal', 'grandmother_maternal',
    'other'
  )
);

-- พี่น้องตัวอย่าง (ข้ามถ้ามีอยู่แล้ว)
insert into family_members (full_name, relation, gender, birth_date, photo_url, nickname, blood_type, phone, occupation, hobbies)
select 'เอมิกา ชาวราช', 'sibling', 'female', '1993-07-19', '/avatars/woman-2.svg', 'เอม', 'O', '086-555-7788', 'เภสัชกร โรงพยาบาลหาดใหญ่', 'เดินป่า, เบเกอรี่'
where not exists (select 1 from family_members where full_name = 'เอมิกา ชาวราช');

notify pgrst, 'reload schema';
