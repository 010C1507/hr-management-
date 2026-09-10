-- ใส่รูปโปรไฟล์ตัวอย่างให้สมาชิก demo ที่ยังไม่มีรูป
-- (คอลัมน์ photo_url มีอยู่แล้วตั้งแต่ schema แรก จึงไม่ต้อง alter table)
-- ไฟล์รูปอยู่ในโปรเจกต์ที่ public/avatars/*.svg — เก็บเป็น path ตรง ๆ ได้เลย

update family_members set photo_url = '/avatars/man-1.svg'          where full_name = 'เอกชัย ชาวราช'    and photo_url is null;
update family_members set photo_url = '/avatars/woman-1.svg'        where full_name = 'พิมพ์ชนก ชาวราช'  and photo_url is null;
update family_members set photo_url = '/avatars/boy-1.svg'          where full_name = 'น้องภูมิ ชาวราช'   and photo_url is null;
update family_members set photo_url = '/avatars/baby-1.svg'         where full_name = 'น้องใบตอง ชาวราช'  and photo_url is null;
update family_members set photo_url = '/avatars/elder-man-1.svg'    where full_name = 'สมชาย ชาวราช'     and photo_url is null;
update family_members set photo_url = '/avatars/elder-woman-1.svg'  where full_name = 'สมศรี ชาวราช'     and photo_url is null;
update family_members set photo_url = '/avatars/elder-man-2.svg'    where full_name = 'สมพงษ์ ชาวราช'    and photo_url is null;
update family_members set photo_url = '/avatars/elder-woman-2.svg'  where full_name = 'บุญมี ชาวราช'     and photo_url is null;
update family_members set photo_url = '/avatars/elder-man-3.svg'    where full_name = 'ประเสริฐ ใจงาม'   and photo_url is null;
update family_members set photo_url = '/avatars/elder-woman-3.svg'  where full_name = 'ทองสุข ใจงาม'     and photo_url is null;

-- สมาชิกที่เหลือซึ่งยังไม่มีรูป ให้ใช้รูปทั่วไปไปก่อน (เปลี่ยนเองได้ในหน้าโปรไฟล์)
update family_members set photo_url = '/avatars/neutral-1.svg' where photo_url is null;
