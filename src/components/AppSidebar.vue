<script setup>
import { useRoute } from 'vue-router'
import AppIcon from './AppIcon.vue'

const route = useRoute()

const menu = [
  { to: '/', label: 'แดชบอร์ด', icon: 'home' },
  { to: '/members', label: 'สมาชิกครอบครัว', icon: 'users' },
  { to: '/growth', label: 'พัฒนาการลูก', icon: 'heart' },
  { to: '/insurance', label: 'ประกัน', icon: 'shield' },
  { to: '/welfare', label: 'สวัสดิการ', icon: 'gift' },
]

const bottomMenu = [{ to: '/settings', label: 'ตั้งค่า', icon: 'settings' }]

const isActive = (to) => (to === '/' ? route.path === '/' : route.path.startsWith(to))
</script>

<template>
  <aside class="sidebar">
    <!-- Brand card -->
    <router-link to="/" class="brand" aria-label="Family Tracker">
      <span class="brand-mark">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 20V11M10 20V5M16 20v-8M22 20H2" />
        </svg>
      </span>
      <span class="brand-text">
        <span class="brand-name">Family Tracker</span>
        <span class="brand-sub">by BUGpairoj</span>
      </span>
    </router-link>

    <!-- Main navigation -->
    <nav class="nav">
      <router-link
        v-for="item in menu"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :class="{ active: isActive(item.to) }"
      >
        <span class="nav-icon"><AppIcon :name="item.icon" :size="18" /></span>
        <span class="nav-label">{{ item.label }}</span>
        <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
      </router-link>

      <router-link
        v-for="item in bottomMenu"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :class="{ active: isActive(item.to) }"
      >
        <span class="nav-icon"><AppIcon :name="item.icon" :size="18" /></span>
        <span class="nav-label">{{ item.label }}</span>
        <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
      </router-link>
    </nav>

    <!-- Footer tagline -->
    <div class="sidebar-footer">
      <span class="footer-brand">Family Tracker</span>
      <span class="footer-tagline">Better Family<br />Better Future</span>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  --sb-radius: 18px;
  --sb-blue: #2b7cf5;

  position: sticky;
  top: 12px;
  align-self: flex-start;
  width: 196px;
  height: calc(100vh - 24px);
  flex-shrink: 0;
  margin: 12px 0 12px 12px;
  padding: 16px 12px 18px;
  border-radius: var(--sb-radius);
  background: linear-gradient(180deg, #0b2a5c 0%, #0f3a73 42%, #1653a8 78%, #1c62c9 100%);
  box-shadow: 0 10px 30px -12px rgba(11, 42, 92, 0.55);
  color: #ffffff;
  font-family: 'Noto Sans Thai', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow: hidden;
}

/* ---------- Brand ---------- */
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 4px 12px;
  color: #ffffff;
}

.brand-mark {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 9px;
  background: linear-gradient(135deg, #4a9eff 0%, #1a63d8 100%);
  box-shadow: 0 4px 12px -2px rgba(26, 99, 216, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
  min-width: 0;
}

.brand-name {
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.brand-sub {
  font-size: 10.5px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.78);
  white-space: nowrap;
}

/* ---------- Navigation ---------- */
.nav {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: none;
}

.nav::-webkit-scrollbar {
  display: none;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 10px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.3;
  white-space: nowrap;
  transition: background 0.16s ease, color 0.16s ease;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
  background: var(--sb-blue);
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 4px 12px -4px rgba(43, 124, 245, 0.7);
}

.nav-icon {
  display: flex;
  flex-shrink: 0;
  color: #ffffff;
}

.nav-item :deep(svg) {
  stroke-width: 1.9;
}

.nav-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-badge {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: #ef3b3b;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  line-height: 18px;
  text-align: center;
  flex-shrink: 0;
}

/* ---------- Footer ---------- */
.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 6px 0;
  line-height: 1.25;
}

.footer-brand {
  font-size: 13px;
  font-weight: 700;
  color: #8fc0ff;
  letter-spacing: 0.01em;
}

.footer-tagline {
  font-size: 10.5px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.72);
}

/* ---------- Responsive ---------- */
@media (max-width: 900px) {
  .sidebar {
    width: 68px;
    padding: 14px 10px 16px;
    align-items: center;
  }
  .brand {
    padding: 2px 0 10px;
    justify-content: center;
  }
  .brand-text,
  .nav-label,
  .sidebar-footer {
    display: none;
  }
  .nav {
    width: 100%;
  }
  .nav-item {
    justify-content: center;
    padding: 10px;
  }
  .nav-badge {
    position: absolute;
    top: 4px;
    right: 4px;
    min-width: 16px;
    height: 16px;
    font-size: 10px;
    line-height: 16px;
  }
}
</style>
