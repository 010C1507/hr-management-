<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <div class="page-header">
    <div>
      <h2>{{ title }}</h2>
      <p v-if="subtitle">{{ subtitle }}</p>
    </div>
    <div class="page-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

h2 {
  margin: 0;
  color: var(--text-on-dark);
  font-size: 22px;
  font-weight: 700;
}

p {
  margin: 4px 0 0;
  color: var(--text-on-dark-soft);
  font-size: 13.5px;
}

.page-actions {
  display: flex;
  gap: 10px;
}
</style>
