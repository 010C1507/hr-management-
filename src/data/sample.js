export const employees = [
  { id: 'EMP-001', name: 'มิเชล ชาวราช', role: 'UX Designer', dept: 'Product', status: 'Active', avatarColor: '#3ecf8e' },
  { id: 'EMP-002', name: 'ธนพล ศรีสุข', role: 'Backend Engineer', dept: 'Engineering', status: 'Active', avatarColor: '#8ec1f4' },
  { id: 'EMP-003', name: 'กมลชนก ใจดี', role: 'HR Specialist', dept: 'People', status: 'On Leave', avatarColor: '#f4977a' },
  { id: 'EMP-004', name: 'ปิยะดา รุ่งเรือง', role: 'Product Manager', dept: 'Product', status: 'Active', avatarColor: '#b0a3ec' },
  { id: 'EMP-005', name: 'อธิป มั่งมี', role: 'Accountant', dept: 'Finance', status: 'Active', avatarColor: '#e3ef6c' },
  { id: 'EMP-006', name: 'ศิริพร แสงทอง', role: 'QA Engineer', dept: 'Engineering', status: 'Inactive', avatarColor: '#8ec1f4' },
]

export const attendance = [
  { name: 'มิเชล ชาวราช', checkIn: '08:55', checkOut: '18:02', status: 'มาปกติ', color: 'var(--accent-green)' },
  { name: 'ธนพล ศรีสุข', checkIn: '09:20', checkOut: '18:10', status: 'มาสาย', color: 'var(--accent-blue)' },
  { name: 'กมลชนก ใจดี', checkIn: '-', checkOut: '-', status: 'ลา', color: 'var(--accent-yellow)' },
  { name: 'ปิยะดา รุ่งเรือง', checkIn: '08:47', checkOut: '17:55', status: 'มาปกติ', color: 'var(--accent-green)' },
  { name: 'อธิป มั่งมี', checkIn: '-', checkOut: '-', status: 'ขาดงาน', color: 'var(--accent-orange)' },
]

export const leaveRequests = [
  { name: 'กมลชนก ใจดี', type: 'ลาป่วย', range: '10 - 11 ก.ค. 2569', status: 'อนุมัติ' },
  { name: 'ศิริพร แสงทอง', type: 'ลาพักร้อน', range: '15 - 18 ก.ค. 2569', status: 'รออนุมัติ' },
  { name: 'อธิป มั่งมี', type: 'ลากิจ', range: '20 ก.ค. 2569', status: 'รออนุมัติ' },
  { name: 'ธนพล ศรีสุข', type: 'ลาพักร้อน', range: '1 - 3 ส.ค. 2569', status: 'ปฏิเสธ' },
]

export const payroll = [
  { name: 'มิเชล ชาวราช', role: 'UX Designer', salary: '48,000', bonus: '3,000', status: 'จ่ายแล้ว' },
  { name: 'ธนพล ศรีสุข', role: 'Backend Engineer', salary: '55,000', bonus: '4,500', status: 'จ่ายแล้ว' },
  { name: 'กมลชนก ใจดี', role: 'HR Specialist', salary: '42,000', bonus: '2,000', status: 'รอดำเนินการ' },
  { name: 'ปิยะดา รุ่งเรือง', role: 'Product Manager', salary: '68,000', bonus: '6,000', status: 'จ่ายแล้ว' },
]
