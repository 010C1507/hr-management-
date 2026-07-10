<script setup>
import PageHeader from '../components/PageHeader.vue'
import AppIcon from '../components/AppIcon.vue'
import { leaveRequests } from '../data/sample'

function pillClass(status) {
  return {
    อนุมัติ: 'pill--green',
    รออนุมัติ: 'pill--yellow',
    ปฏิเสธ: 'pill--orange',
  }[status] || 'pill--blue'
}
</script>

<template>
  <section>
    <PageHeader title="คำขอลา" subtitle="ติดตามและอนุมัติคำขอลาของพนักงาน">
      <template #actions>
        <button class="btn-primary" type="button"><AppIcon name="plus" :size="16" /> สร้างคำขอลา</button>
      </template>
    </PageHeader>

    <div class="data-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>พนักงาน</th>
            <th>ประเภทการลา</th>
            <th>วันที่</th>
            <th>สถานะ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="req in leaveRequests" :key="req.name + req.range">
            <td class="name-cell">{{ req.name }}</td>
            <td>{{ req.type }}</td>
            <td>{{ req.range }}</td>
            <td><span class="pill" :class="pillClass(req.status)">{{ req.status }}</span></td>
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
