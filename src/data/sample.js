export const relationLabels = {
  self: 'ตัวเอง',
  spouse: 'คู่สมรส',
  child: 'ลูก',
  father: 'พ่อ',
  mother: 'แม่',
  grandfather_paternal: 'ปู่',
  grandmother_paternal: 'ย่า',
  grandfather_maternal: 'ตา',
  grandmother_maternal: 'ยาย',
  other: 'อื่น ๆ',
}

export const familyMembers = [
  { id: 'm-1', full_name: 'เอกชัย ชาวราช', relation: 'self', gender: 'male', birth_date: '1990-04-12', avatarColor: '#8ec1f4' },
  { id: 'm-2', full_name: 'พิมพ์ชนก ชาวราช', relation: 'spouse', gender: 'female', birth_date: '1991-08-03', avatarColor: '#f4977a' },
  { id: 'm-3', full_name: 'น้องภูมิ ชาวราช', relation: 'child', gender: 'male', birth_date: '2021-02-15', avatarColor: '#3ecf8e' },
  { id: 'm-4', full_name: 'น้องใบตอง ชาวราช', relation: 'child', gender: 'female', birth_date: '2023-11-20', avatarColor: '#b0a3ec' },
  { id: 'm-5', full_name: 'สมชาย ชาวราช', relation: 'father', gender: 'male', birth_date: '1962-01-05', avatarColor: '#e3ef6c' },
  { id: 'm-6', full_name: 'สมศรี ชาวราช', relation: 'mother', gender: 'female', birth_date: '1964-06-22', avatarColor: '#8ec1f4' },
  { id: 'm-7', full_name: 'สมพงษ์ ชาวราช', relation: 'grandfather_paternal', gender: 'male', birth_date: '1938-03-10', avatarColor: '#e3ef6c' },
  { id: 'm-8', full_name: 'บุญมี ชาวราช', relation: 'grandmother_paternal', gender: 'female', birth_date: '1941-09-18', avatarColor: '#f4977a' },
  { id: 'm-9', full_name: 'ประเสริฐ ใจงาม', relation: 'grandfather_maternal', gender: 'male', birth_date: '1940-11-02', avatarColor: '#8ec1f4' },
  { id: 'm-10', full_name: 'ทองสุข ใจงาม', relation: 'grandmother_maternal', gender: 'female', birth_date: '1943-05-27', avatarColor: '#b0a3ec' },
]

export const growthRecords = [
  { id: 'g-1', member_id: 'm-3', record_date: '2024-03-15', weight_kg: 9.8, height_cm: 74.0 },
  { id: 'g-2', member_id: 'm-3', record_date: '2024-06-15', weight_kg: 10.4, height_cm: 77.5 },
  { id: 'g-3', member_id: 'm-3', record_date: '2024-09-15', weight_kg: 10.9, height_cm: 79.8 },
  { id: 'g-4', member_id: 'm-3', record_date: '2024-12-15', weight_kg: 11.2, height_cm: 81.0 },
  { id: 'g-5', member_id: 'm-3', record_date: '2025-03-15', weight_kg: 11.5, height_cm: 82.0 },
  { id: 'g-6', member_id: 'm-3', record_date: '2025-06-15', weight_kg: 12.3, height_cm: 85.5 },
  { id: 'g-7', member_id: 'm-3', record_date: '2025-09-09', weight_kg: 13.0, height_cm: 88.0, note: 'ตรวจสุขภาพประจำปีที่คลินิกเด็ก' },
  { id: 'g-8', member_id: 'm-4', record_date: '2024-12-09', weight_kg: 3.4, height_cm: 50.5, note: 'แรกเกิด' },
  { id: 'g-9', member_id: 'm-4', record_date: '2025-03-09', weight_kg: 5.0, height_cm: 55.0 },
  { id: 'g-10', member_id: 'm-4', record_date: '2025-06-09', weight_kg: 5.8, height_cm: 58.0 },
  { id: 'g-11', member_id: 'm-4', record_date: '2025-09-09', weight_kg: 6.9, height_cm: 63.5, note: 'ฉีดวัคซีนตามนัด' },
]

export const insurancePolicies = [
  { id: 'i-1', member_id: 'm-1', provider: 'เมืองไทยประกันชีวิต', policy_type: 'life', policy_number: 'LF-100234', coverage_amount: 1000000, premium: 18000, end_date: '2027-02-01', status: 'active' },
  { id: 'i-2', member_id: 'm-2', provider: 'ไทยประกันชีวิต', policy_type: 'health', policy_number: 'HL-330012', coverage_amount: 500000, premium: 15000, end_date: '2026-11-20', status: 'active' },
  { id: 'i-3', member_id: 'm-3', provider: 'AIA', policy_type: 'health', policy_number: 'HL-556677', coverage_amount: 300000, premium: 9500, end_date: '2026-05-30', status: 'active' },
  { id: 'i-4', member_id: 'm-4', provider: 'AIA', policy_type: 'health', policy_number: 'HL-556699', coverage_amount: 300000, premium: 9500, end_date: '2026-08-09', status: 'active' },
  { id: 'i-5', member_id: 'm-5', provider: 'กรุงไทย-แอกซ่า', policy_type: 'health', policy_number: 'HL-778821', coverage_amount: 200000, premium: 22000, end_date: '2026-10-15', status: 'active' },
  { id: 'i-6', member_id: 'm-6', provider: 'กรุงไทย-แอกซ่า', policy_type: 'health', policy_number: 'HL-778822', coverage_amount: 200000, premium: 22000, end_date: '2026-10-15', status: 'active' },
  { id: 'i-7', member_id: 'm-1', provider: 'วิริยะประกันภัย', policy_type: 'car', policy_number: 'CR-991045', coverage_amount: 800000, premium: 12500, end_date: '2025-12-01', status: 'expired' },
]

export const welfareBenefits = [
  { id: 'w-1', member_id: 'm-1', benefit_name: 'สวัสดิการค่ารักษาพยาบาลพนักงาน', provider: 'บริษัท ABC จำกัด', benefit_type: 'medical', amount: 20000, valid_until: '2026-12-31', status: 'active' },
  { id: 'w-2', member_id: 'm-2', benefit_name: 'สวัสดิการค่ารักษาพยาบาลพนักงาน', provider: 'บริษัท XYZ จำกัด', benefit_type: 'medical', amount: 15000, valid_until: '2026-12-31', status: 'active' },
  { id: 'w-3', member_id: 'm-3', benefit_name: 'เงินสงเคราะห์บุตร ประกันสังคม', provider: 'สำนักงานประกันสังคม', benefit_type: 'allowance', amount: 800, valid_until: '2026-09-09', status: 'active' },
  { id: 'w-4', member_id: 'm-4', benefit_name: 'เงินสงเคราะห์บุตร ประกันสังคม', provider: 'สำนักงานประกันสังคม', benefit_type: 'allowance', amount: 800, valid_until: '2026-09-09', status: 'active' },
  { id: 'w-5', member_id: 'm-3', benefit_name: 'ทุนการศึกษาอนุบาล', provider: 'โรงเรียนอนุบาลรุ่งเรือง', benefit_type: 'education', amount: 5000, valid_until: '2027-04-30', status: 'active' },
  { id: 'w-6', member_id: 'm-5', benefit_name: 'บัตรสวัสดิการแห่งรัฐ', provider: 'กระทรวงการคลัง', benefit_type: 'allowance', amount: 300, valid_until: '2026-09-30', status: 'active' },
  { id: 'w-7', member_id: 'm-6', benefit_name: 'เบี้ยยังชีพผู้สูงอายุ', provider: 'เทศบาลเมือง', benefit_type: 'allowance', amount: 700, valid_until: '2026-12-31', status: 'active' },
  { id: 'w-8', member_id: 'm-7', benefit_name: 'เบี้ยยังชีพผู้สูงอายุ', provider: 'เทศบาลเมือง', benefit_type: 'allowance', amount: 1000, valid_until: '2026-12-31', status: 'active' },
  { id: 'w-9', member_id: 'm-8', benefit_name: 'สิทธิบัตรทอง 30 บาท', provider: 'สำนักงานหลักประกันสุขภาพแห่งชาติ', benefit_type: 'medical', amount: 0, valid_until: '2027-12-31', status: 'active' },
]
