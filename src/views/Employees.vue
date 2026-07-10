<script setup>
import PageHeader from '../components/PageHeader.vue'
import AppIcon from '../components/AppIcon.vue'
import StatProgressCard from '../components/StatProgressCard.vue'
import { employees } from '../data/sample'

function initials(name) {
  return name.trim().split(' ').map((p) => p[0]).slice(0, 2).join('')
}

function statusPillClass(status) {
  return {
    Active: 'pill--green',
    'On Leave': 'pill--yellow',
    Inactive: 'pill--orange',
  }[status] || 'pill--blue'
}
</script>

<template>
  <section>
    <PageHeader title="พนักงานทั้งหมด" subtitle="จัดการข้อมูลพนักงานและตำแหน่งงานในองค์กร">
      <template #actions>
        <button class="btn-ghost" type="button"><AppIcon name="filter" :size="16" /> กรอง</button>
        <button class="btn-primary" type="button"><AppIcon name="plus" :size="16" /> เพิ่มพนักงาน</button>
      </template>
    </PageHeader>

    <div class="stat-grid">
      <StatProgressCard value="86" label="พนักงานทั้งหมด" percent="80" color="var(--accent-green)" />
      <StatProgressCard value="72" label="กำลังปฏิบัติงาน" percent="65" color="var(--accent-blue)" />
      <StatProgressCard value="9" label="ลาวันนี้" percent="20" color="var(--accent-yellow)" />
      <StatProgressCard value="5" label="ตำแหน่งว่าง" percent="15" color="var(--accent-orange)" />
    </div>

    <div class="data-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>พนักงาน</th>
            <th>รหัส</th>
            <th>ตำแหน่ง</th>
            <th>แผนก</th>
            <th>สถานะ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="emp in employees" :key="emp.id">
            <td>
              <div class="emp-cell">
                <span class="avatar-chip" :style="{ background: emp.avatarColor }">{{ initials(emp.name) }}</span>
                {{ emp.name }}
              </div>
            </td>
            <td>{{ emp.id }}</td>
            <td>{{ emp.role }}</td>
            <td>{{ emp.dept }}</td>
            <td><span class="pill" :class="statusPillClass(emp.status)">{{ emp.status }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.emp-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}
</style>
