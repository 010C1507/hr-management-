-- ผูกบัญชี Google (auth.users) เข้ากับโปรไฟล์สมาชิกในครอบครัว
-- รันไฟล์นี้บน Supabase project ที่ใช้งานอยู่ (ทำครั้งเดียว)

create table if not exists member_accounts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  member_id uuid not null unique references family_members (id) on delete cascade,
  email text,
  linked_at timestamptz not null default now()
);

alter table member_accounts enable row level security;

-- แต่ละบัญชีเห็นและแก้ไขได้เฉพาะการผูกของตัวเองเท่านั้น
drop policy if exists "own_member_account_select" on member_accounts;
drop policy if exists "own_member_account_insert" on member_accounts;
drop policy if exists "own_member_account_update" on member_accounts;
drop policy if exists "own_member_account_delete" on member_accounts;

create policy "own_member_account_select" on member_accounts
  for select using (auth.uid() = user_id);
create policy "own_member_account_insert" on member_accounts
  for insert with check (auth.uid() = user_id);
create policy "own_member_account_update" on member_accounts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_member_account_delete" on member_accounts
  for delete using (auth.uid() = user_id);

notify pgrst, 'reload schema';
