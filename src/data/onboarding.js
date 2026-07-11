export const STAGES = [
  { key: 'docs', label: 'เตรียมเอกสาร', color: 'var(--accent-blue)' },
  { key: 'orientation', label: 'ปฐมนิเทศ', color: 'var(--accent-purple)' },
  { key: 'training', label: 'อบรมงาน', color: 'var(--accent-yellow)' },
  { key: 'probation', label: 'ทดลองงาน 90 วัน', color: 'var(--accent-orange)' },
  { key: 'confirmed', label: 'บรรจุพนักงาน', color: 'var(--accent-green)' },
]

const today = new Date()
today.setHours(0, 0, 0, 0)

function addDays(offset) {
  const d = new Date(today)
  d.setDate(d.getDate() + offset)
  return d.toISOString().slice(0, 10)
}

export const onboardingEmployees = [
  {
    id: 'NH-001',
    name: 'ธีรยุทธ คงกระพัน',
    position: 'Frontend Developer',
    department: 'Engineering',
    mentor: 'พี่เอก',
    hireDate: addDays(-28),
    status: 'active',
    remark: 'อยู่ระหว่างทดลองงาน 90 วัน',
    stages: [
      { key: 'docs', start: addDays(-33), end: addDays(-29) },
      { key: 'orientation', start: addDays(-28), end: addDays(-27) },
      { key: 'training', start: addDays(-26), end: addDays(-17) },
      { key: 'probation', start: addDays(-28), end: addDays(62) },
    ],
  },
  {
    id: 'NH-002',
    name: 'ณัฐพร ใจตรง',
    position: 'Accountant',
    department: 'Finance',
    mentor: 'พี่แนน',
    hireDate: addDays(-10),
    status: 'active',
    remark: 'อยู่ระหว่างอบรมงาน',
    stages: [
      { key: 'docs', start: addDays(-15), end: addDays(-11) },
      { key: 'orientation', start: addDays(-10), end: addDays(-10) },
      { key: 'training', start: addDays(-9), end: addDays(2) },
      { key: 'probation', start: addDays(-10), end: addDays(80) },
    ],
  },
  {
    id: 'NH-003',
    name: 'สมชาย ทองดี',
    position: 'HR Officer',
    department: 'People',
    mentor: '-',
    hireDate: addDays(10),
    status: 'wait',
    remark: 'รอเซ็นสัญญาและปฐมนิเทศ',
    stages: [
      { key: 'docs', start: addDays(3), end: addDays(7) },
      { key: 'orientation', start: addDays(10), end: addDays(10) },
    ],
  },
  {
    id: 'NH-004',
    name: 'พิมพ์ชนก แก้วมณี',
    position: 'UI/UX Designer',
    department: 'Product',
    mentor: 'พี่ตูน',
    hireDate: addDays(-70),
    status: 'done',
    remark: 'ผ่านทดลองงาน บรรจุเป็นพนักงานประจำเรียบร้อย',
    stages: [
      { key: 'docs', start: addDays(-75), end: addDays(-71) },
      { key: 'orientation', start: addDays(-70), end: addDays(-70) },
      { key: 'training', start: addDays(-69), end: addDays(-60) },
      { key: 'probation', start: addDays(-70), end: addDays(-11) },
      { key: 'confirmed', start: addDays(-10), end: addDays(-10) },
    ],
  },
  {
    id: 'NH-005',
    name: 'อนุชา ศรีสมบัติ',
    position: 'QA Engineer',
    department: 'Engineering',
    mentor: 'พี่กบ',
    hireDate: addDays(-40),
    status: 'cancelled',
    remark: 'ยกเลิกสัญญาระหว่างทดลองงานตามคำขอพนักงาน',
    stages: [
      { key: 'docs', start: addDays(-45), end: addDays(-41) },
      { key: 'orientation', start: addDays(-40), end: addDays(-40) },
      { key: 'training', start: addDays(-39), end: addDays(-30) },
      { key: 'probation', start: addDays(-40), end: addDays(-15) },
    ],
  },
  {
    id: 'NH-006',
    name: 'วรรณิศา พงษ์เจริญ',
    position: 'Data Analyst',
    department: 'Product',
    mentor: 'พี่มายด์',
    hireDate: addDays(2),
    status: 'wait',
    remark: 'เตรียมอุปกรณ์และบัญชีผู้ใช้งาน',
    stages: [
      { key: 'docs', start: addDays(-3), end: addDays(1) },
      { key: 'orientation', start: addDays(2), end: addDays(2) },
    ],
  },
]

export const STATUS_META = {
  active: { label: 'ดำเนินการ', pillClass: 'pill--blue' },
  wait: { label: 'รอเริ่มงาน', pillClass: 'pill--purple' },
  done: { label: 'บรรจุแล้ว', pillClass: 'pill--green' },
  cancelled: { label: 'ยกเลิก', pillClass: 'pill--orange' },
}
