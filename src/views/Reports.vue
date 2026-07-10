<script setup>
import PageHeader from '../components/PageHeader.vue'
import StatProgressCard from '../components/StatProgressCard.vue'

const reports = [
  { title: 'อัตราการมาทำงาน', value: '96%', percent: 96, color: 'var(--accent-green)' },
  { title: 'อัตราการลาออก', value: '3.2%', percent: 12, color: 'var(--accent-orange)' },
  { title: 'ความพึงพอใจพนักงาน', value: '4.6/5', percent: 92, color: 'var(--accent-blue)' },
  { title: 'ชั่วโมงทำงานเฉลี่ย', value: '7.8 ชม.', percent: 78, color: 'var(--accent-yellow)' },
]
</script>

<template>
  <section>
    <PageHeader title="รายงาน" subtitle="ภาพรวมตัวชี้วัดด้านทรัพยากรบุคคล" />

    <div class="report-grid">
      <StatProgressCard
        v-for="report in reports"
        :key="report.title"
        :value="report.value"
        :label="report.title"
        :percent="report.percent"
        :color="report.color"
      />
    </div>

    <div class="data-card placeholder">
      <p>กราฟแนวโน้มโดยละเอียดจะแสดงที่นี่</p>
    </div>
  </section>
</template>

<style scoped>
.report-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  color: var(--text-on-dark-soft);
  font-size: 14px;
}
</style>
