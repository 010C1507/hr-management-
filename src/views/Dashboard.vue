<script setup>
import AppIcon from '../components/AppIcon.vue'
import StatusLegend from '../components/StatusLegend.vue'
import MascotCharacter from '../components/MascotCharacter.vue'
import StatProgressCard from '../components/StatProgressCard.vue'

const rating = 4
const stars = [1, 2, 3, 4, 5]
</script>

<template>
  <section class="dashboard">
    <div class="grid">
      <StatusLegend />

      <div class="hero">
        <MascotCharacter />
        <h2>คุณมีสถิติการทำงานที่ดีเยี่ยมในเดือนนี้!</h2>
        <p>ระบบสรุปการเข้างาน ผลปฏิบัติงาน และคำขอลาของคุณไว้ที่นี่</p>
      </div>

      <div class="side">
        <div class="stars">
          <AppIcon
            v-for="n in stars"
            :key="n"
            name="star"
            :size="20"
            :class="{ filled: n <= rating }"
          />
        </div>

        <StatProgressCard value="163" label="ชั่วโมงทำงานเดือนนี้" percent="72" color="var(--accent-yellow)" />
        <StatProgressCard value="12" label="วันลาคงเหลือ" percent="35" color="var(--accent-orange)" />

        <router-link to="/attendance" class="cta">เช็คอินตอนนี้</router-link>
      </div>
    </div>
  </section>
</template>

<style scoped>
.dashboard {
  height: 100%;
}

.grid {
  display: grid;
  grid-template-columns: 76px 1fr 260px;
  gap: 24px;
  align-items: center;
  min-height: 560px;
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 6px;
  padding: 20px;
}

.hero h2 {
  margin: 12px 0 0;
  color: var(--text-on-dark);
  font-size: 19px;
  font-weight: 600;
  max-width: 360px;
}

.hero p {
  margin: 0;
  color: var(--text-on-dark-soft);
  font-size: 13.5px;
  max-width: 320px;
}

.side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stars {
  display: flex;
  gap: 6px;
  color: #cbd5e1;
  justify-content: flex-start;
  padding-left: 4px;
}

.stars .filled {
  color: var(--accent-yellow);
}

.cta {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cta-bg);
  color: #fff;
  font-weight: 600;
  font-size: 15px;
  padding: 15px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
  transition: background 0.18s ease, transform 0.18s ease;
}

.cta:hover {
  background: var(--cta-bg-hover);
  transform: translateY(-1px);
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>
