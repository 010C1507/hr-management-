<script setup>
import AppIcon from './AppIcon.vue'

defineProps({
  name: { type: String, default: 'Mike' },
  taskDone: { type: Number, default: 7 },
  taskTotal: { type: Number, default: 10 },
})
</script>

<template>
  <header class="app-header">
    <div class="welcome">
      <h1>Welcome back, <span>{{ name }}</span>!</h1>
    </div>

    <div class="task-progress">
      <div class="bar">
        <div class="bar-fill" :style="{ width: (taskDone / taskTotal) * 100 + '%' }" />
      </div>
      <span class="fraction">{{ taskDone }}/{{ taskTotal }}</span>
    </div>

    <div class="actions">
      <button class="icon-btn" type="button" aria-label="ทีมงาน">
        <AppIcon name="users" :size="18" />
      </button>
      <button class="icon-btn" type="button" aria-label="เมนูทั้งหมด">
        <AppIcon name="grid" :size="18" />
      </button>
      <router-link to="/" class="icon-btn" aria-label="หน้าแรก">
        <AppIcon name="home" :size="18" />
      </router-link>
      <router-link to="/settings" class="avatar" aria-label="โปรไฟล์">MC</router-link>
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

.task-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  max-width: 320px;
  margin-left: 12px;
}

.bar {
  flex: 1;
  height: 7px;
  border-radius: 8px;
  background: #dde6f5;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 8px;
  background: #1a3f7a;
}

.fraction {
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
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
}

@media (max-width: 720px) {
  .task-progress {
    order: 3;
    max-width: none;
    margin-left: 0;
    width: 100%;
  }
}
</style>
