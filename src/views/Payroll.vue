<script setup>
import PageHeader from '../components/PageHeader.vue'
import AppIcon from '../components/AppIcon.vue'
import StatProgressCard from '../components/StatProgressCard.vue'
import { payroll } from '../data/sample'

function pillClass(status) {
  return status === 'จ่ายแล้ว' ? 'pill--green' : 'pill--yellow'
}
</script>

<template>
  <section>
    <PageHeader title="เงินเดือน" subtitle="สรุปรายจ่ายเงินเดือนและโบนัสประจำเดือน">
      <template #actions>
        <button class="btn-ghost" type="button"><AppIcon name="download" :size="16" /> ส่งออก</button>
        <button class="btn-primary" type="button"><AppIcon name="wallet" :size="16" /> รันเงินเดือน</button>
      </template>
    </PageHeader>

    <div class="stat-grid">
      <StatProgressCard value="฿2.4M" label="ยอดจ่ายเดือนนี้" percent="70" color="var(--accent-green)" />
      <StatProgressCard value="86" label="พนักงานที่จ่ายแล้ว" percent="82" color="var(--accent-blue)" />
      <StatProgressCard value="4" label="รอดำเนินการ" percent="18" color="var(--accent-orange)" />
    </div>

    <div class="data-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>พนักงาน</th>
            <th>ตำแหน่ง</th>
            <th>เงินเดือน (บาท)</th>
            <th>โบนัส (บาท)</th>
            <th>สถานะ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in payroll" :key="row.name">
            <td class="name-cell">{{ row.name }}</td>
            <td>{{ row.role }}</td>
            <td>{{ row.salary }}</td>
            <td>{{ row.bonus }}</td>
            <td><span class="pill" :class="pillClass(row.status)">{{ row.status }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.name-cell {
  font-weight: 600;
}
</style>
