<script setup>
defineProps({
  items: {
    type: Array,
    default: () => [
      { color: 'var(--accent-green)', label: 'มาปกติ' },
      { color: 'var(--accent-blue)', label: 'มาสาย' },
      { color: 'var(--accent-yellow)', label: 'ลา' },
      { color: 'var(--accent-orange)', label: 'ขาดงาน' },
      { color: 'var(--accent-purple)', label: 'วันหยุด' },
    ],
  },
})
</script>

<template>
  <div class="legend">
    <div v-for="item in items" :key="item.label" class="legend-item" :title="item.label">
      <span class="dot" :style="{ background: item.color }" />
    </div>
  </div>
</template>

<style scoped>
.legend {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  padding: 20px 12px;
  backdrop-filter: blur(6px);
}

.dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: block;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
  cursor: pointer;
}
</style>
