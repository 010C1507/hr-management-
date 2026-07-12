-- Migration: เพิ่มตาราง candidates และ candidate_stages
-- รันไฟล์นี้ใน Supabase Dashboard > SQL Editor > New query > วางแล้วกด Run

create extension if not exists pgcrypto;

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

alter table candidates enable row level security;
alter table candidate_stages enable row level security;

-- RLS policies (demo: allow all for anon key)
do $$ begin
  if not exists (select 1 from pg_policies where tablename='candidates' and policyname='demo_select_candidates') then
    create policy "demo_select_candidates" on candidates for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='candidates' and policyname='demo_insert_candidates') then
    create policy "demo_insert_candidates" on candidates for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='candidates' and policyname='demo_update_candidates') then
    create policy "demo_update_candidates" on candidates for update using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='candidates' and policyname='demo_delete_candidates') then
    create policy "demo_delete_candidates" on candidates for delete using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='candidate_stages' and policyname='demo_select_candidate_stages') then
    create policy "demo_select_candidate_stages" on candidate_stages for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='candidate_stages' and policyname='demo_insert_candidate_stages') then
    create policy "demo_insert_candidate_stages" on candidate_stages for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='candidate_stages' and policyname='demo_update_candidate_stages') then
    create policy "demo_update_candidate_stages" on candidate_stages for update using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='candidate_stages' and policyname='demo_delete_candidate_stages') then
    create policy "demo_delete_candidate_stages" on candidate_stages for delete using (true);
  end if;
end $$;
