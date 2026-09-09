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
]

export const growthRecords = [
  { id: 'g-1', member_id: 'm-3', record_date: '2025-03-15', weight_kg: 11.5, height_cm: 82.0 },
  { id: 'g-2', member_id: 'm-3', record_date: '2025-06-15', weight_kg: 12.3, height_cm: 85.5 },
  { id: 'g-3', member_id: 'm-3', record_date: '2025-09-09', weight_kg: 13.0, height_cm: 88.0 },
  { id: 'g-4', member_id: 'm-4', record_date: '2025-06-09', weight_kg: 5.8, height_cm: 58.0 },
  { id: 'g-5', member_id: 'm-4', record_date: '2025-09-09', weight_kg: 6.9, height_cm: 63.5 },
]

export const insurancePolicies = [
  { id: 'i-1', member_id: 'm-1', provider: 'เมืองไทยประกันชีวิต', policy_type: 'life', policy_number: 'LF-100234', coverage_amount: 1000000, premium: 18000, end_date: '2027-02-01', status: 'active' },
  { id: 'i-2', member_id: 'm-3', provider: 'AIA', policy_type: 'health', policy_number: 'HL-556677', coverage_amount: 300000, premium: 9500, end_date: '2026-05-30', status: 'active' },
  { id: 'i-3', member_id: 'm-4', provider: 'AIA', policy_type: 'health', policy_number: 'HL-556699', coverage_amount: 300000, premium: 9500, end_date: '2026-08-09', status: 'active' },
]

export const welfareBenefits = [
  { id: 'w-1', member_id: 'm-1', benefit_name: 'สวัสดิการค่ารักษาพยาบาลพนักงาน', provider: 'บริษัท ABC จำกัด', benefit_type: 'medical', amount: 20000, valid_until: '2026-12-31', status: 'active' },
  { id: 'w-2', member_id: 'm-3', benefit_name: 'เงินสงเคราะห์บุตร ประกันสังคม', provider: 'สำนักงานประกันสังคม', benefit_type: 'allowance', amount: 800, valid_until: '2026-09-09', status: 'active' },
  { id: 'w-3', member_id: 'm-4', benefit_name: 'เงินสงเคราะห์บุตร ประกันสังคม', provider: 'สำนักงานประกันสังคม', benefit_type: 'allowance', amount: 800, valid_until: '2026-09-09', status: 'active' },
]
