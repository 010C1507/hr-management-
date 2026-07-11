<script setup>
import AppIcon from './AppIcon.vue'

defineProps({
  icon: { type: String, required: true },
  value: { type: [String, Number], required: true },
  label: { type: String, required: true },
  color: { type: String, default: 'var(--accent-blue)' },
})
</script>

<template>
  <div class="stat-icon-card">
    <span class="icon-chip" :style="{ background: color }">
      <AppIcon :name="icon" :size="18" />
    </span>
    <div>
      <div class="value">{{ value }}</div>
      <div class="label">{{ label }}</div>
    </div>
  </div>
</template>

<style scoped>
.stat-icon-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  backdrop-filter: blur(6px);
}

.icon-chip {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #22264a;
  flex-shrink: 0;
}

.value {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-on-dark);
  line-height: 1.1;
}

.label {
  font-size: 11.5px;
  color: var(--text-on-dark-soft);
  margin-top: 2px;
}
</style>
