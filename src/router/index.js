import { createRouter, createWebHistory } from 'vue-router'
import { initAuth, isAuthenticated } from '../lib/auth'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue'),
    meta: { label: 'เข้าสู่ระบบ', layout: 'plain', public: true },
  },
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
    path: '/members/:id',
    name: 'member-profile',
    component: () => import('../views/MemberProfile.vue'),
    meta: { label: 'ข้อมูลสมาชิก' },
  },
  {
    path: '/family-tree',
    name: 'family-tree',
    component: () => import('../views/FamilyTree.vue'),
    meta: { label: 'ผังครอบครัว', icon: 'tree' },
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

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  await initAuth()

  if (to.meta.public) {
    return isAuthenticated.value ? { path: typeof to.query.redirect === 'string' ? to.query.redirect : '/' } : true
  }

  if (!isAuthenticated.value) {
    return { name: 'login', query: to.fullPath === '/' ? {} : { redirect: to.fullPath } }
  }

  return true
})

export default router
