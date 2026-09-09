import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { label: 'แดชบอร์ด', icon: 'home' },
  },
  {
    path: '/members',
    name: 'members',
    component: () => import('../views/Members.vue'),
    meta: { label: 'สมาชิกครอบครัว', icon: 'users' },
  },
  {
    path: '/growth',
    name: 'growth',
    component: () => import('../views/Growth.vue'),
    meta: { label: 'พัฒนาการลูก', icon: 'heart' },
  },
  {
    path: '/insurance',
    name: 'insurance',
    component: () => import('../views/Insurance.vue'),
    meta: { label: 'ประกัน', icon: 'shield' },
  },
  {
    path: '/welfare',
    name: 'welfare',
    component: () => import('../views/Welfare.vue'),
    meta: { label: 'สวัสดิการ', icon: 'gift' },
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
