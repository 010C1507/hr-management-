<script setup>
import { useRoute } from 'vue-router'
import AppIcon from './AppIcon.vue'

const route = useRoute()

const menu = [
  { to: '/', label: 'แดชบอร์ด', icon: 'home' },
  { to: '/employees', label: 'พนักงาน', icon: 'users' },
  { to: '/recruitment', label: 'สรรหาบุคลากร', icon: 'search' },
  { to: '/onboarding', label: 'รับพนักงานใหม่', icon: 'briefcase' },
  { to: '/attendance', label: 'เวลาเข้า-ออกงาน', icon: 'clock' },
  { to: '/leave', label: 'การลา', icon: 'calendar' },
  { to: '/payroll', label: 'เงินเดือน', icon: 'wallet' },
  { to: '/reports', label: 'รายงาน', icon: 'chart' },
]

const bottomMenu = [{ to: '/settings', label: 'ตั้งค่า', icon: 'settings' }]
</script>

<template>
  <aside class="sidebar">
    <div class="brand">
      <span class="brand-mark">H</span>
    </div>

    <nav class="nav">
      <router-link
        v-for="item in menu"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :class="{ active: route.path === item.to }"
      >
        <span class="nav-icon"><AppIcon :name="item.icon" :size="18" /></span>
        <span class="nav-label">{{ item.label }}</span>
      </router-link>
    </nav>

    <nav class="nav nav-bottom">
      <router-link
        v-for="item in bottomMenu"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :class="{ active: route.path === item.to }"
      >
        <span class="nav-icon"><AppIcon :name="item.icon" :size="18" /></span>
        <span class="nav-label">{{ item.label }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 236px;
  flex-shrink: 0;
  background: var(--sidebar-gradient);
  padding: 28px 18px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 6px;
}

.brand-mark {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #ffffff;
  color: #4a5cd8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
  box-shadow: var(--shadow-soft);
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.nav-bottom {
  flex: none;
  border-top: 1px solid rgba(255, 255, 255, 0.18);
  padding-top: 16px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border-radius: var(--radius-md);
  color: var(--text-on-dark-soft);
  font-size: 14px;
  font-weight: 500;
  transition: background 0.18s ease, color 0.18s ease;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-on-dark);
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.22);
  color: var(--text-on-dark);
  box-shadow: var(--shadow-soft);
}

.nav-icon {
  display: flex;
}

@media (max-width: 900px) {
  .sidebar {
    width: 76px;
    padding: 24px 12px;
    align-items: center;
  }
  .nav-label {
    display: none;
  }
  .nav-item {
    justify-content: center;
    padding: 12px;
  }
}
</style>
