export const relationLabels = {
  self: 'ตัวเอง',
  spouse: 'คู่สมรส',
  child: 'ลูก',
  sibling: 'พี่น้อง',
  father: 'พ่อ',
  mother: 'แม่',
  grandfather_paternal: 'ปู่',
  grandmother_paternal: 'ย่า',
  grandfather_maternal: 'ตา',
  grandmother_maternal: 'ยาย',
  other: 'อื่น ๆ',
}

const homeAddress = '99/12 หมู่บ้านสุขสันต์ ถ.รามอินทรา แขวงท่าแร้ง เขตบางเขน กรุงเทพฯ 10230'
const hatyaiAddress = '45 ถ.เพชรเกษม ต.หาดใหญ่ อ.หาดใหญ่ จ.สงขลา 90110'

export const familyMembers = [
  { id: 'm-1', photo_url: '/avatars/man-1.svg', full_name: 'เอกชัย ชาวราช', relation: 'self', gender: 'male', birth_date: '1990-04-12', avatarColor: '#8ec1f4', nickname: 'เอก', blood_type: 'O', phone: '081-234-5678', email: 'eak@example.com', address: homeAddress, occupation: 'Software Engineer บริษัท ABC จำกัด', allergies: '-', chronic_conditions: '-', hospital: 'โรงพยาบาลสินแพทย์', hobbies: 'วิ่ง, ถ่ายภาพ, อ่านหนังสือ' },
  { id: 'm-2', photo_url: '/avatars/woman-1.svg', full_name: 'พิมพ์ชนก ชาวราช', relation: 'spouse', gender: 'female', birth_date: '1991-08-03', avatarColor: '#f4977a', nickname: 'พิม', blood_type: 'A', phone: '089-876-5432', email: 'pim@example.com', address: homeAddress, occupation: 'นักบัญชี บริษัท XYZ จำกัด', allergies: 'แพ้อาหารทะเล', chronic_conditions: '-', hospital: 'โรงพยาบาลสินแพทย์', hobbies: 'ทำอาหาร, โยคะ' },
  { id: 'm-3', photo_url: '/avatars/boy-1.svg', full_name: 'กวินท์ณภัทร ริยาพันธ์', relation: 'child', gender: 'male', birth_date: '2021-05-20', avatarColor: '#3ecf8e', nickname: 'วินเนอร์' },
  { id: 'm-4', photo_url: '/avatars/boy-1.svg', full_name: 'ชินท์ณภัทร์ ริยาพันธ์', relation: 'child', gender: 'male', birth_date: '2023-07-07', avatarColor: '#b0a3ec', nickname: 'โอชิน' },
  { id: 'm-5', photo_url: '/avatars/elder-man-1.svg', full_name: 'สมชาย ชาวราช', relation: 'father', gender: 'male', birth_date: '1962-01-05', avatarColor: '#e3ef6c', nickname: 'ชาย', blood_type: 'B', phone: '081-111-2222', address: hatyaiAddress, occupation: 'ข้าราชการบำนาญ', allergies: 'แพ้ยาเพนิซิลลิน', chronic_conditions: 'ความดันโลหิตสูง, เบาหวานชนิดที่ 2', hospital: 'โรงพยาบาลหาดใหญ่', hobbies: 'ปลูกต้นไม้, ตกปลา' },
  { id: 'm-6', photo_url: '/avatars/elder-woman-1.svg', full_name: 'สมศรี ชาวราช', relation: 'mother', gender: 'female', birth_date: '1964-06-22', avatarColor: '#8ec1f4', nickname: 'ศรี', blood_type: 'O', phone: '081-333-4444', address: hatyaiAddress, occupation: 'แม่บ้าน', allergies: '-', chronic_conditions: 'ไขมันในเลือดสูง', hospital: 'โรงพยาบาลหาดใหญ่', hobbies: 'ทำขนม, สวดมนต์' },
  { id: 'm-7', photo_url: '/avatars/elder-man-2.svg', full_name: 'สมพงษ์ ชาวราช', relation: 'grandfather_paternal', gender: 'male', birth_date: '1938-03-10', avatarColor: '#e3ef6c', nickname: 'ปู่พงษ์', blood_type: 'B', address: hatyaiAddress, occupation: 'เกษียณ', chronic_conditions: 'ข้อเข่าเสื่อม', hospital: 'โรงพยาบาลหาดใหญ่' },
  { id: 'm-8', photo_url: '/avatars/elder-woman-2.svg', full_name: 'บุญมี ชาวราช', relation: 'grandmother_paternal', gender: 'female', birth_date: '1941-09-18', avatarColor: '#f4977a', nickname: 'ย่ามี', blood_type: 'O', address: hatyaiAddress, occupation: 'เกษียณ', chronic_conditions: 'ความดันโลหิตสูง', hospital: 'โรงพยาบาลหาดใหญ่' },
  { id: 'm-9', photo_url: '/avatars/elder-man-3.svg', full_name: 'ประเสริฐ ใจงาม', relation: 'grandfather_maternal', gender: 'male', birth_date: '1940-11-02', avatarColor: '#8ec1f4', nickname: 'ตาเสริฐ', blood_type: 'A', occupation: 'เกษียณ' },
  { id: 'm-10', photo_url: '/avatars/elder-woman-3.svg', full_name: 'ทองสุข ใจงาม', relation: 'grandmother_maternal', gender: 'female', birth_date: '1943-05-27', avatarColor: '#b0a3ec', nickname: 'ยายสุข', blood_type: 'AB', occupation: 'เกษียณ' },
  { id: 'm-11', photo_url: '/avatars/woman-2.svg', full_name: 'เอมิกา ชาวราช', relation: 'sibling', gender: 'female', birth_date: '1993-07-19', avatarColor: '#b0a3ec', nickname: 'เอม', blood_type: 'O', phone: '086-555-7788', address: hatyaiAddress, occupation: 'เภสัชกร โรงพยาบาลหาดใหญ่', hobbies: 'เดินป่า, เบเกอรี่' },
]

export const educationHistory = [
  { id: 'e-1', member_id: 'm-1', level: 'ปริญญาโท', institution: 'จุฬาลงกรณ์มหาวิทยาลัย', field: 'วิศวกรรมคอมพิวเตอร์', start_year: 2013, end_year: 2015, status: 'completed' },
  { id: 'e-2', member_id: 'm-1', level: 'ปริญญาตรี', institution: 'มหาวิทยาลัยเกษตรศาสตร์', field: 'วิศวกรรมคอมพิวเตอร์', start_year: 2008, end_year: 2012, status: 'completed' },
  { id: 'e-3', member_id: 'm-1', level: 'มัธยมศึกษา', institution: 'โรงเรียนหาดใหญ่วิทยาลัย', field: 'วิทย์-คณิต', start_year: 2002, end_year: 2008, status: 'completed' },
  { id: 'e-4', member_id: 'm-2', level: 'ปริญญาตรี', institution: 'มหาวิทยาลัยธรรมศาสตร์', field: 'บัญชี', start_year: 2009, end_year: 2013, status: 'completed' },
]

export const medicalRecords = [
  { id: 'md-4', member_id: 'm-5', record_date: '2026-08-06', hospital: 'โรงพยาบาลหาดใหญ่', doctor: 'นพ.วิชัย', diagnosis: 'ติดตามเบาหวาน + ความดัน', treatment: 'ปรับยา Metformin, ตรวจ HbA1c', cost: 1500 },
  { id: 'md-5', member_id: 'm-1', record_date: '2026-02-22', hospital: 'โรงพยาบาลสินแพทย์', doctor: 'นพ.ประวิทย์', diagnosis: 'ตรวจสุขภาพประจำปี', treatment: 'ผลปกติ แนะนำออกกำลังกายสม่ำเสมอ', cost: 4500 },
]

export const growthRecords = [
  { id: 'g-1', member_id: 'm-3', record_date: '2021-05-20', weight_kg: 2.9, note: 'น้ำหนักแรกเกิด' },
  { id: 'g-2', member_id: 'm-4', record_date: '2023-07-07', weight_kg: 3.4, note: 'น้ำหนักแรกเกิด' },
]

export const insurancePolicies = [
  { id: 'i-1', member_id: 'm-1', provider: 'เมืองไทยประกันชีวิต', policy_type: 'life', policy_number: 'LF-100234', coverage_amount: 1000000, premium: 18000, end_date: '2027-02-01', status: 'active' },
  { id: 'i-2', member_id: 'm-2', provider: 'ไทยประกันชีวิต', policy_type: 'health', policy_number: 'HL-330012', coverage_amount: 500000, premium: 15000, end_date: '2026-11-20', status: 'active' },
  { id: 'i-5', member_id: 'm-5', provider: 'กรุงไทย-แอกซ่า', policy_type: 'health', policy_number: 'HL-778821', coverage_amount: 200000, premium: 22000, end_date: '2026-10-15', status: 'active' },
  { id: 'i-6', member_id: 'm-6', provider: 'กรุงไทย-แอกซ่า', policy_type: 'health', policy_number: 'HL-778822', coverage_amount: 200000, premium: 22000, end_date: '2026-10-15', status: 'active' },
  { id: 'i-7', member_id: 'm-1', provider: 'วิริยะประกันภัย', policy_type: 'car', policy_number: 'CR-991045', coverage_amount: 800000, premium: 12500, end_date: '2025-12-01', status: 'expired' },
]

export const welfareBenefits = [
  { id: 'w-1', member_id: 'm-1', benefit_name: 'สวัสดิการค่ารักษาพยาบาลพนักงาน', provider: 'บริษัท ABC จำกัด', benefit_type: 'medical', amount: 20000, valid_until: '2026-12-31', status: 'active' },
  { id: 'w-2', member_id: 'm-2', benefit_name: 'สวัสดิการค่ารักษาพยาบาลพนักงาน', provider: 'บริษัท XYZ จำกัด', benefit_type: 'medical', amount: 15000, valid_until: '2026-12-31', status: 'active' },
  { id: 'w-6', member_id: 'm-5', benefit_name: 'บัตรสวัสดิการแห่งรัฐ', provider: 'กระทรวงการคลัง', benefit_type: 'allowance', amount: 300, valid_until: '2026-09-30', status: 'active' },
  { id: 'w-7', member_id: 'm-6', benefit_name: 'เบี้ยยังชีพผู้สูงอายุ', provider: 'เทศบาลเมือง', benefit_type: 'allowance', amount: 700, valid_until: '2026-12-31', status: 'active' },
  { id: 'w-8', member_id: 'm-7', benefit_name: 'เบี้ยยังชีพผู้สูงอายุ', provider: 'เทศบาลเมือง', benefit_type: 'allowance', amount: 1000, valid_until: '2026-12-31', status: 'active' },
  { id: 'w-9', member_id: 'm-8', benefit_name: 'สิทธิบัตรทอง 30 บาท', provider: 'สำนักงานหลักประกันสุขภาพแห่งชาติ', benefit_type: 'medical', amount: 0, valid_until: '2027-12-31', status: 'active' },
]
