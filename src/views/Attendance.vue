<script setup>
import PageHeader from '../components/PageHeader.vue'
import AppIcon from '../components/AppIcon.vue'
import StatusLegend from '../components/StatusLegend.vue'
import { attendance } from '../data/sample'

function pillClass(status) {
  return {
    มาปกติ: 'pill--green',
    มาสาย: 'pill--blue',
    ลา: 'pill--yellow',
    ขาดงาน: 'pill--orange',
  }[status] || 'pill--purple'
}
</script>

<template>
  <section>
    <PageHeader title="เวลาเข้า-ออกงาน" subtitle="สรุปการมาทำงานของพนักงานประจำวัน">
      <template #actions>
        <button class="btn-primary" type="button"><AppIcon name="check" :size="16" /> เช็คอิน</button>
      </template>
    </PageHeader>

    <div class="layout">
      <StatusLegend />

      <div class="data-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>พนักงาน</th>
              <th>เข้างาน</th>
              <th>ออกงาน</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in attendance" :key="row.name">
              <td class="name-cell">{{ row.name }}</td>
              <td>{{ row.checkIn }}</td>
              <td>{{ row.checkOut }}</td>
              <td><span class="pill" :class="pillClass(row.status)">{{ row.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<style scoped>
.layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.layout .data-card {
  flex: 1;
}

.name-cell {
  font-weight: 600;
}

@media (max-width: 720px) {
  .layout {
    flex-direction: column;
  }
}
</style>
