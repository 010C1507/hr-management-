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
  padding: 26px 32px 10px;
  flex-wrap: wrap;
}

.welcome h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-on-dark);
  white-space: nowrap;
}

.welcome h1 span {
  font-weight: 700;
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
  height: 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.28);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 8px;
  background: var(--accent-yellow);
}

.fraction {
  color: var(--text-on-dark-soft);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.icon-btn {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: none;
  background: rgba(255, 255, 255, 0.16);
  color: var(--text-on-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.18s ease;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.28);
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #f4a95c;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.6);
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
