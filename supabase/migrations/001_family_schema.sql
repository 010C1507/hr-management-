-- ย้ายจากระบบ HR เดิมมาเป็นระบบติดตามครอบครัว (Family Tracker)
-- หากเคยรันไฟล์ schema.sql เวอร์ชัน HR มาก่อน ให้รันไฟล์นี้เพื่อลบตารางเดิมและสร้างตารางใหม่

drop table if exists candidate_stages cascade;
drop table if exists candidates cascade;
drop table if exists payroll cascade;
drop table if exists leave_requests cascade;
drop table if exists attendance cascade;
drop table if exists employees cascade;

-- จากนั้นให้รันเนื้อหาทั้งหมดของ supabase/schema.sql เพื่อสร้างตารางครอบครัวชุดใหม่
