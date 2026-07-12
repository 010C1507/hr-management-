import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { label: 'แดชบอร์ด', icon: 'home' },
  },
  {
    path: '/employees',
    name: 'employees',
    component: () => import('../views/Employees.vue'),
    meta: { label: 'พนักงาน', icon: 'users' },
  },
  {
    path: '/recruitment',
    name: 'recruitment',
    component: () => import('../views/Recruitment.vue'),
    meta: { label: 'สรรหาบุคลากร', icon: 'search' },
  },
  {
    path: '/onboarding',
    name: 'onboarding',
    component: () => import('../views/Onboarding.vue'),
    meta: { label: 'รับพนักงานใหม่', icon: 'briefcase' },
  },
  {
    path: '/attendance',
    name: 'attendance',
    component: () => import('../views/Attendance.vue'),
    meta: { label: 'เวลาเข้า-ออกงาน', icon: 'clock' },
  },
  {
    path: '/leave',
    name: 'leave',
    component: () => import('../views/Leave.vue'),
    meta: { label: 'การลา', icon: 'calendar' },
  },
  {
    path: '/payroll',
    name: 'payroll',
    component: () => import('../views/Payroll.vue'),
    meta: { label: 'เงินเดือน', icon: 'wallet' },
  },
  {
    path: '/reports',
    name: 'reports',
    component: () => import('../views/Reports.vue'),
    meta: { label: 'รายงาน', icon: 'chart' },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../views/Settings.vue'),
    meta: { label: 'ตั้งค่า', icon: 'settings' },
  },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
