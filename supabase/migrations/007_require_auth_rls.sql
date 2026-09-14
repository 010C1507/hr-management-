-- บังคับให้ต้องเข้าสู่ระบบก่อนอ่าน/เขียนข้อมูลครอบครัว (แทนนโยบาย demo ที่เปิดให้ anon)
--
-- ⚠️ รันไฟล์นี้ "หลังจาก" ตั้งค่า Google login ใน Supabase และทดสอบว่าเข้าสู่ระบบได้แล้วเท่านั้น
-- ถ้ารันก่อน แอปจะอ่านข้อมูลไม่ได้เลยจนกว่าจะ login สำเร็จ
--
-- ถ้าต้องการย้อนกลับไปเป็นแบบเปิด (demo) ให้รัน schema.sql ส่วน policy ใหม่อีกครั้ง

do $$
declare
  t text;
  p record;
begin
  foreach t in array array['family_members', 'growth_records', 'insurance_policies',
                           'welfare_benefits', 'education_history', 'medical_records']
  loop
    -- ลบ policy เดิมทั้งหมดของตารางนี้ทิ้งก่อน
    for p in select policyname from pg_policies where schemaname = 'public' and tablename = t
    loop
      execute format('drop policy if exists %I on %I', p.policyname, t);
    end loop;

    execute format(
      'create policy "authenticated_read_%1$s" on %1$I for select to authenticated using (true)', t
    );
    execute format(
      'create policy "authenticated_insert_%1$s" on %1$I for insert to authenticated with check (true)', t
    );
    execute format(
      'create policy "authenticated_update_%1$s" on %1$I for update to authenticated using (true) with check (true)', t
    );
    execute format(
      'create policy "authenticated_delete_%1$s" on %1$I for delete to authenticated using (true)', t
    );
  end loop;
end $$;

notify pgrst, 'reload schema';
