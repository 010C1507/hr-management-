<script setup>
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
import { demoMode, displayName, displayPhoto, isSignedIn, signOut } from '../lib/auth'

const initials = computed(() =>
  displayName.value.trim().split(' ').map((p) => p[0]).slice(0, 2).join('')
)
</script>

<template>
  <header class="app-header">
    <div class="welcome">
      <h1>Welcome back, <span>{{ displayName }}</span>!</h1>
    </div>

    <span v-if="demoMode" class="demo-badge">โหมดสาธิต</span>

    <div class="actions">
      <router-link to="/" class="icon-btn" aria-label="หน้าแรก">
        <AppIcon name="home" :size="18" />
      </router-link>
      <button
        v-if="isSignedIn || demoMode"
        class="icon-btn"
        type="button"
        aria-label="ออกจากระบบ"
        title="ออกจากระบบ"
        @click="signOut"
      >
        <AppIcon name="logout" :size="18" />
      </button>
      <router-link to="/settings" class="avatar" aria-label="โปรไฟล์">
        <img v-if="displayPhoto" :src="displayPhoto" :alt="displayName" />
        <span v-else>{{ initials }}</span>
      </router-link>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 32px 14px;
  border-bottom: 1px solid var(--border-color);
  background: #ffffff;
  flex-wrap: wrap;
}

.welcome h1 {
  margin: 0;
  font-size: 19px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

.welcome h1 span {
  font-weight: 700;
  color: #1a3f7a;
}

.demo-badge {
  padding: 4px 12px;
  border-radius: 999px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  color: #c2410c;
  font-size: 12px;
  font-weight: 600;
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--surface-bg);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.icon-btn:hover {
  background: #dde6f5;
  border-color: #b8cef0;
  color: #1a3f7a;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f4a95c;
  color: #fff;
  font-size: 12.5px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--border-color);
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
