// ขั้นตอนการสรรหา (pipeline) อ้างอิงโครงสร้างจากไฟล์ Tracking สายงานเทคโนโลยี:
// แต่ละขั้นมีวันเริ่ม-จบ, จำนวนวันที่ใช้, ผลการพิจารณา และ SLA (จำนวนวันที่ควรเสร็จ)
export const PIPELINE = [
  { key: 'request', label: 'รับเรื่อง/ขออัตรา', sla: 3, color: '#8ec1f4' },
  { key: 'screening', label: 'คัดกรองใบสมัคร', sla: 5, color: '#b0a3ec' },
  { key: 'interview', label: 'สัมภาษณ์', sla: 7, color: '#e3ef6c' },
  { key: 'approval', label: 'อนุมัติว่าจ้าง', sla: 5, color: '#f4977a' },
  { key: 'offer', label: 'เสนอค่าตอบแทน', sla: 5, color: '#f2b8d8' },
  { key: 'contract', label: 'เซ็นสัญญา/เอกสาร', sla: 5, color: '#9fe8f0' },
  { key: 'onboard', label: 'เข้างาน (On Board)', sla: 3, color: '#3ecf8e' },
]

export const STATUS_META = {
  in_progress: { label: 'กำลังดำเนินการ', pillClass: 'pill--blue' },
  onboard: { label: 'เข้างานแล้ว', pillClass: 'pill--green' },
  failed: { label: 'ไม่ผ่าน', pillClass: 'pill--orange' },
  withdrawn: { label: 'ถอนตัว', pillClass: 'pill--purple' },
}

const today = new Date()
today.setHours(0, 0, 0, 0)

function addDays(offset) {
  const d = new Date(today)
  d.setDate(d.getDate() + offset)
  return d.toISOString().slice(0, 10)
}

// ข้อมูลตัวอย่าง (ชื่อ/เบอร์/อีเมลสมมติทั้งหมด) โครงสร้างเดียวกับชีต Query ในไฟล์จริง
export const mockCandidates = [
  {
    id: 'CAND-001',
    name: 'ปริญญา วงศ์สว่าง',
    phone: '081-000-0001',
    email: 'parinya.w@example.com',
    position: 'Data Engineer',
    division: 'สายงานเทคโนโลยี',
    department: 'ฝ่ายบริหารจัดการงานวิศวกรรมข้อมูล',
    status: 'in_progress',
    expectedSalary: 85000,
    offeredSalary: null,
    remark: 'นัดสัมภาษณ์รอบผู้บริหารกลุ่ม รอยืนยันวัน',
    stages: [
      { key: 'request', start: addDays(-25), end: addDays(-23), result: 'ผ่าน' },
      { key: 'screening', start: addDays(-22), end: addDays(-18), result: 'ผ่าน' },
      { key: 'interview', start: addDays(-10), end: null, result: 'รอดำเนินการ' },
    ],
  },
  {
    id: 'CAND-002',
    name: 'ชลธิชา บุญมาก',
    phone: '081-000-0002',
    email: 'chonthicha.b@example.com',
    position: 'System Analyst',
    division: 'สายงานเทคโนโลยี',
    department: 'ฝ่ายพัฒนาระบบงาน Core Banking System',
    status: 'in_progress',
    expectedSalary: 72000,
    offeredSalary: 70000,
    remark: 'ต่อรองค่าตอบแทนรอบที่ 2',
    stages: [
      { key: 'request', start: addDays(-40), end: addDays(-38), result: 'ผ่าน' },
      { key: 'screening', start: addDays(-37), end: addDays(-33), result: 'ผ่าน' },
      { key: 'interview', start: addDays(-30), end: addDays(-24), result: 'ผ่าน' },
      { key: 'approval', start: addDays(-23), end: addDays(-20), result: 'ผ่าน' },
      { key: 'offer', start: addDays(-4), end: null, result: 'รอดำเนินการ' },
    ],
  },
  {
    id: 'CAND-003',
    name: 'กิตติพงศ์ รักเรียน',
    phone: '081-000-0003',
    email: 'kittipong.r@example.com',
    position: 'รองผู้อำนวยการฝ่าย',
    division: 'สายงานเทคโนโลยี',
    department: 'ฝ่าย Data Protection',
    status: 'onboard',
    expectedSalary: 130000,
    offeredSalary: 140000,
    remark: 'อนุมัติค่าตอบแทนจากผู้บริหารกลุ่มเรียบร้อย เริ่มงานแล้ว',
    stages: [
      { key: 'request', start: addDays(-60), end: addDays(-58), result: 'ผ่าน' },
      { key: 'screening', start: addDays(-57), end: addDays(-53), result: 'ผ่าน' },
      { key: 'interview', start: addDays(-50), end: addDays(-46), result: 'ผ่าน' },
      { key: 'approval', start: addDays(-45), end: addDays(-42), result: 'ผ่าน' },
      { key: 'offer', start: addDays(-41), end: addDays(-38), result: 'ผ่าน' },
      { key: 'contract', start: addDays(-37), end: addDays(-31), result: 'ผ่าน' },
      { key: 'onboard', start: addDays(-30), end: addDays(-30), result: 'ผ่าน' },
    ],
  },
  {
    id: 'CAND-004',
    name: 'สุนิสา แจ่มใส',
    phone: '081-000-0004',
    email: 'sunisa.j@example.com',
    position: 'QA Engineer',
    division: 'สายงานเทคโนโลยี',
    department: 'ฝ่ายทดสอบและควบคุมคุณภาพระบบงาน (TQA)',
    status: 'in_progress',
    expectedSalary: 55000,
    offeredSalary: null,
    remark: 'รอผลตรวจสอบคุณสมบัติเบื้องต้น',
    stages: [
      { key: 'request', start: addDays(-8), end: addDays(-6), result: 'ผ่าน' },
      { key: 'screening', start: addDays(-3), end: null, result: 'รอดำเนินการ' },
    ],
  },
  {
    id: 'CAND-005',
    name: 'อรรถพล ตั้งใจ',
    phone: '081-000-0005',
    email: 'attapol.t@example.com',
    position: 'DevOps Engineer',
    division: 'สายงานเทคโนโลยี',
    department: 'สนับสนุนเทคโนโลยีและควบคุมผู้ให้บริการภายนอก',
    status: 'failed',
    expectedSalary: 90000,
    offeredSalary: null,
    remark: 'ผลสัมภาษณ์ไม่ผ่านเกณฑ์ด้านประสบการณ์',
    stages: [
      { key: 'request', start: addDays(-55), end: addDays(-53), result: 'ผ่าน' },
      { key: 'screening', start: addDays(-52), end: addDays(-48), result: 'ผ่าน' },
      { key: 'interview', start: addDays(-45), end: addDays(-40), result: 'ไม่ผ่าน' },
    ],
  },
  {
    id: 'CAND-006',
    name: 'เมธาวี ศรีวิไล',
    phone: '081-000-0006',
    email: 'methawee.s@example.com',
    position: 'Business Analyst',
    division: 'สายงานเทคโนโลยี',
    department: 'ฝ่ายวิเคราะห์และพัฒนากระบวนการ',
    status: 'withdrawn',
    expectedSalary: 65000,
    offeredSalary: 63000,
    remark: 'ผู้สมัครถอนตัว ได้รับข้อเสนอจากที่อื่น',
    stages: [
      { key: 'request', start: addDays(-70), end: addDays(-68), result: 'ผ่าน' },
      { key: 'screening', start: addDays(-67), end: addDays(-63), result: 'ผ่าน' },
      { key: 'interview', start: addDays(-60), end: addDays(-55), result: 'ผ่าน' },
      { key: 'approval', start: addDays(-54), end: addDays(-51), result: 'ผ่าน' },
      { key: 'offer', start: addDays(-50), end: addDays(-46), result: 'ผ่าน' },
      { key: 'contract', start: addDays(-45), end: addDays(-42), result: 'ถอนตัว' },
    ],
  },
  {
    id: 'CAND-007',
    name: 'ภูริทัต คำแก้ว',
    phone: '081-000-0007',
    email: 'phuritat.k@example.com',
    position: 'Mobile Developer',
    division: 'สายงานเทคโนโลยี',
    department: 'ฝ่ายพัฒนาช่องทางอิเล็กทรอนิกส์และผลิตภัณฑ์บัตร',
    status: 'in_progress',
    expectedSalary: 68000,
    offeredSalary: null,
    remark: 'เปิดอัตราใหม่ รออนุมัติกรอบอัตรากำลัง',
    stages: [
      { key: 'request', start: addDays(-1), end: null, result: 'รอดำเนินการ' },
    ],
  },
]
