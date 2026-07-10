<script setup>
defineProps({
  value: { type: [String, Number], required: true },
  label: { type: String, default: '' },
  percent: { type: [String, Number], default: 60 },
  color: { type: String, default: 'var(--accent-yellow)' },
})
</script>

<template>
  <div class="stat-card">
    <div class="stat-value">{{ value }}</div>
    <div v-if="label" class="stat-label">{{ label }}</div>
    <div class="bar">
      <div class="bar-fill" :style="{ width: percent + '%', background: color }" />
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: 18px 20px;
  backdrop-filter: blur(6px);
}

.stat-value {
  font-size: 30px;
  font-weight: 700;
  color: var(--text-on-dark);
  line-height: 1.1;
}

.stat-label {
  font-size: 12.5px;
  color: var(--text-on-dark-soft);
  margin-top: 4px;
  font-weight: 500;
}

.bar {
  margin-top: 12px;
  height: 7px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.28);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 8px;
}
</style>
