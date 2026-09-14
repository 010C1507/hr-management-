-- เก็บความสัมพันธ์เป็นเส้นเชื่อมจริง (พ่อ/แม่/คู่สมรส) แทนการเดาจากคอลัมน์ relation
-- ทำให้ตั้งค่าความสัมพันธ์เองได้ และมีผลสองทางอัตโนมัติ
-- (A ตั้งพ่อเป็น B → ฝั่ง B ก็เห็น A เป็นลูกทันที เพราะเป็นเส้นเดียวกัน)

alter table family_members
  add column if not exists father_id uuid references family_members (id) on delete set null,
  add column if not exists mother_id uuid references family_members (id) on delete set null,
  add column if not exists spouse_id uuid references family_members (id) on delete set null;

create index if not exists family_members_father_id_idx on family_members (father_id);
create index if not exists family_members_mother_id_idx on family_members (mother_id);

-- แปลงข้อมูลเดิมที่เก็บแบบ "ความสัมพันธ์เทียบกับตัวเอง" ให้เป็นเส้นเชื่อม
do $$
declare
  id_self uuid;
  id_spouse uuid;
  id_father uuid;
  id_mother uuid;
  id_gf_paternal uuid;
  id_gm_paternal uuid;
  id_gf_maternal uuid;
  id_gm_maternal uuid;
  self_gender text;
  child_father uuid;
  child_mother uuid;
begin
  select id, gender into id_self, self_gender from family_members where relation = 'self' limit 1;
  select id into id_spouse from family_members where relation = 'spouse' limit 1;
  select id into id_father from family_members where relation = 'father' limit 1;
  select id into id_mother from family_members where relation = 'mother' limit 1;
  select id into id_gf_paternal from family_members where relation = 'grandfather_paternal' limit 1;
  select id into id_gm_paternal from family_members where relation = 'grandmother_paternal' limit 1;
  select id into id_gf_maternal from family_members where relation = 'grandfather_maternal' limit 1;
  select id into id_gm_maternal from family_members where relation = 'grandmother_maternal' limit 1;

  -- ตัวเองและพี่น้อง มีพ่อแม่ชุดเดียวกัน
  update family_members
    set father_id = coalesce(father_id, id_father),
        mother_id = coalesce(mother_id, id_mother)
    where relation in ('self', 'sibling');

  -- พ่อ ← ปู่ย่า, แม่ ← ตายาย
  update family_members
    set father_id = coalesce(father_id, id_gf_paternal),
        mother_id = coalesce(mother_id, id_gm_paternal)
    where id = id_father;
  update family_members
    set father_id = coalesce(father_id, id_gf_maternal),
        mother_id = coalesce(mother_id, id_gm_maternal)
    where id = id_mother;

  -- ลูก ← ตัวเอง + คู่สมรส (แยกพ่อ/แม่ตามเพศของตัวเอง)
  if self_gender = 'female' then
    child_father := id_spouse;
    child_mother := id_self;
  else
    child_father := id_self;
    child_mother := id_spouse;
  end if;
  update family_members
    set father_id = coalesce(father_id, child_father),
        mother_id = coalesce(mother_id, child_mother)
    where relation = 'child';

  -- คู่สมรส (สองทาง)
  if id_self is not null and id_spouse is not null then
    update family_members set spouse_id = id_spouse where id = id_self and spouse_id is null;
    update family_members set spouse_id = id_self where id = id_spouse and spouse_id is null;
  end if;
  if id_father is not null and id_mother is not null then
    update family_members set spouse_id = id_mother where id = id_father and spouse_id is null;
    update family_members set spouse_id = id_father where id = id_mother and spouse_id is null;
  end if;
  if id_gf_paternal is not null and id_gm_paternal is not null then
    update family_members set spouse_id = id_gm_paternal where id = id_gf_paternal and spouse_id is null;
    update family_members set spouse_id = id_gf_paternal where id = id_gm_paternal and spouse_id is null;
  end if;
  if id_gf_maternal is not null and id_gm_maternal is not null then
    update family_members set spouse_id = id_gm_maternal where id = id_gf_maternal and spouse_id is null;
    update family_members set spouse_id = id_gf_maternal where id = id_gm_maternal and spouse_id is null;
  end if;
end $$;

notify pgrst, 'reload schema';
