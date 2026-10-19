-- ห้องแชทครอบครัว (Chat Room) — ข้อความ + แนบรูป/ไฟล์ แบบ Line group
-- รันไฟล์นี้บน Supabase project ที่ใช้งานอยู่ (ทำครั้งเดียว) หลังจากรัน 006_auth_member_accounts.sql แล้ว

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  sender_user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  sender_member_id uuid references family_members (id) on delete set null,
  sender_name text,
  content text,
  attachment_path text,
  attachment_name text,
  attachment_type text,
  attachment_size bigint,
  created_at timestamptz not null default now(),
  constraint chat_messages_not_empty check (
    coalesce(length(trim(content)), 0) > 0 or attachment_path is not null
  )
);

create index if not exists chat_messages_created_at_idx on chat_messages (created_at desc);

alter table chat_messages enable row level security;

drop policy if exists "chat_read" on chat_messages;
drop policy if exists "chat_insert_own" on chat_messages;
drop policy if exists "chat_delete_own" on chat_messages;

-- ทุกคนที่เข้าสู่ระบบอ่านแชทได้, ส่งได้ในนามตัวเองเท่านั้น, ลบได้เฉพาะข้อความตัวเอง
create policy "chat_read" on chat_messages
  for select to authenticated using (true);
create policy "chat_insert_own" on chat_messages
  for insert to authenticated with check (sender_user_id = auth.uid());
create policy "chat_delete_own" on chat_messages
  for delete to authenticated using (sender_user_id = auth.uid());

-- เปิด Realtime ให้ข้อความใหม่เด้งขึ้นทันทีโดยไม่ต้องรีเฟรช
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'chat_messages'
  ) then
    alter publication supabase_realtime add table chat_messages;
  end if;
end $$;

-- Storage bucket สำหรับรูป/ไฟล์ที่แนบในแชท (private — เปิดดูผ่าน signed URL เท่านั้น)
insert into storage.buckets (id, name, public, file_size_limit)
values ('chat-attachments', 'chat-attachments', false, 20971520)
on conflict (id) do nothing;

drop policy if exists "chat_attachments_read" on storage.objects;
drop policy if exists "chat_attachments_upload" on storage.objects;
drop policy if exists "chat_attachments_delete_own" on storage.objects;

create policy "chat_attachments_read" on storage.objects
  for select to authenticated using (bucket_id = 'chat-attachments');
-- อัปโหลดได้เฉพาะในโฟลเดอร์ของตัวเอง: <user_id>/...
create policy "chat_attachments_upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'chat-attachments' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "chat_attachments_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'chat-attachments' and owner = auth.uid());

notify pgrst, 'reload schema';
