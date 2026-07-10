<script setup>
defineProps({
  padding: { type: String, default: '20px' },
  strong: { type: Boolean, default: false },
})
</script>

<template>
  <div class="glass-card" :class="{ strong }" :style="{ padding }">
    <slot />
  </div>
</template>

<style scoped>
.glass-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(6px);
}

.glass-card.strong {
  background: var(--glass-bg-strong);
}
</style>
