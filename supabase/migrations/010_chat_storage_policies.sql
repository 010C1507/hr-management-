-- แก้ "อัปโหลดไฟล์ไม่สำเร็จ: new row violates row-level security policy" ในหน้า Chat Room
-- สร้าง bucket + policy ของ storage สำหรับไฟล์แนบในแชทใหม่ทั้งหมด (รันซ้ำได้ ไม่กระทบข้อมูลเดิม)

insert into storage.buckets (id, name, public, file_size_limit)
values ('chat-attachments', 'chat-attachments', false, 20971520)
on conflict (id) do update set file_size_limit = excluded.file_size_limit;

drop policy if exists "chat_attachments_read" on storage.objects;
drop policy if exists "chat_attachments_upload" on storage.objects;
drop policy if exists "chat_attachments_delete_own" on storage.objects;

-- ทุกคนที่เข้าสู่ระบบอ่าน/อัปโหลดไฟล์ใน bucket นี้ได้ (ห้องแชทเดียวของครอบครัว ทุกคนเห็นไฟล์เดียวกันอยู่แล้ว)
create policy "chat_attachments_read" on storage.objects
  for select to authenticated using (bucket_id = 'chat-attachments');
create policy "chat_attachments_upload" on storage.objects
  for insert to authenticated with check (bucket_id = 'chat-attachments');
-- ลบได้เฉพาะไฟล์ที่ตัวเองอัปโหลด (ใช้ตอนยกเลิกการส่งข้อความ)
create policy "chat_attachments_delete_own" on storage.objects
  for delete to authenticated using (bucket_id = 'chat-attachments' and owner = auth.uid());

-- ตรวจผล: ควรเห็น 3 policy ด้านบน
select policyname, cmd from pg_policies
where schemaname = 'storage' and tablename = 'objects' and policyname like 'chat_attachments_%';
