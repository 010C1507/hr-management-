<script setup>
import AppSidebar from '../components/AppSidebar.vue'
import AppHeader from '../components/AppHeader.vue'
</script>

<template>
  <div class="main-card">
    <AppSidebar />

    <div class="content-col">
      <AppHeader />
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.main-card {
  width: 100%;
  min-height: 100vh;
  display: flex;
  background: var(--card-gradient);
}

.content-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: #ffffff;

  /* Remap dark variables → light for all content-area children */
  --text-on-dark: #1e293b;
  --text-on-dark-soft: #64748b;
  --text-on-dark-faint: #94a3b8;
  --glass-bg: #ffffff;
  --glass-bg-strong: #f8faff;
  --glass-border: #dde6f5;
}

.content {
  flex: 1;
  padding: 20px 32px 32px;
  overflow: auto;
  background: var(--card-gradient);
}

@media (max-width: 640px) {
  .content {
    padding: 16px 18px 24px;
  }
}
</style>
