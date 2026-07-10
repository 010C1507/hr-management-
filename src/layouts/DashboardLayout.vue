<script setup>
import AppSidebar from '../components/AppSidebar.vue'
import AppHeader from '../components/AppHeader.vue'
</script>

<template>
  <div class="stage">
    <div class="stack-card stack-card--back"></div>
    <div class="stack-card stack-card--mid"></div>

    <div class="main-card">
      <AppSidebar />

      <div class="content-col">
        <AppHeader />
        <main class="content">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stage {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  position: relative;
}

.stack-card {
  position: absolute;
  border-radius: var(--radius-xl);
  background: rgba(255, 255, 255, 0.35);
}

.stack-card--back {
  width: min(1180px, 84%);
  height: 78%;
  top: 10px;
  filter: blur(0.5px);
  opacity: 0.55;
}

.stack-card--mid {
  width: min(1240px, 90%);
  height: 84%;
  top: 34px;
  opacity: 0.75;
}

.main-card {
  position: relative;
  width: min(1320px, 96%);
  min-height: 720px;
  display: flex;
  background: var(--card-gradient);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.content-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 20px 32px 32px;
  overflow: auto;
}

@media (max-width: 640px) {
  .stage {
    padding: 24px 12px;
  }
  .main-card {
    min-height: unset;
  }
  .content {
    padding: 16px 18px 24px;
  }
}
</style>
