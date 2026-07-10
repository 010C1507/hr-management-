<script setup>
import { computed, onMounted, ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import AppIcon from '../components/AppIcon.vue'
import StatProgressCard from '../components/StatProgressCard.vue'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { employees as mockEmployees } from '../data/sample'

const employees = ref([])
const loading = ref(false)
const errorMessage = ref('')
const showForm = ref(false)
const saving = ref(false)

const form = ref({
  employee_code: '',
  full_name: '',
  role: '',
  department: '',
  status: 'Active',
})

const usingMockData = computed(() => !isSupabaseConfigured)

const activeCount = computed(() => employees.value.filter((e) => e.status === 'Active').length)
const onLeaveCount = computed(() => employees.value.filter((e) => e.status === 'On Leave').length)
const inactiveCount = computed(() => employees.value.filter((e) => e.status === 'Inactive').length)

async function loadEmployees() {
  if (!isSupabaseConfigured) {
    employees.value = mockEmployees.map((e) => ({
      id: e.id,
      employee_code: e.id,
      full_name: e.name,
      role: e.role,
      department: e.dept,
      status: e.status,
    }))
    return
  }

  loading.value = true
  errorMessage.value = ''
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    errorMessage.value = 'โหลดข้อมูลพนักงานไม่สำเร็จ: ' + error.message
  } else {
    employees.value = data
  }
  loading.value = false
}

async function addEmployee() {
  if (!isSupabaseConfigured) {
    errorMessage.value = 'ยังไม่ได้ตั้งค่า Supabase — ดู .env.example'
    return
  }
  if (!form.value.employee_code || !form.value.full_name || !form.value.role || !form.value.department) {
    errorMessage.value = 'กรุณากรอกข้อมูลให้ครบ'
    return
  }

  saving.value = true
  errorMessage.value = ''
  const { error } = await supabase.from('employees').insert({ ...form.value })
  saving.value = false

  if (error) {
    errorMessage.value = 'เพิ่มพนักงานไม่สำเร็จ: ' + error.message
    return
  }

  form.value = { employee_code: '', full_name: '', role: '', department: '', status: 'Active' }
  showForm.value = false
  await loadEmployees()
}

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

onMounted(loadEmployees)
</script>

<template>
  <section>
    <PageHeader title="พนักงานทั้งหมด" subtitle="จัดการข้อมูลพนักงานและตำแหน่งงานในองค์กร">
      <template #actions>
        <button class="btn-ghost" type="button" @click="loadEmployees"><AppIcon name="filter" :size="16" /> รีเฟรช</button>
        <button class="btn-primary" type="button" @click="showForm = !showForm">
          <AppIcon name="plus" :size="16" /> เพิ่มพนักงาน
        </button>
      </template>
    </PageHeader>

    <p v-if="usingMockData" class="notice">
      กำลังแสดงข้อมูลตัวอย่าง (mock) — ยังไม่ได้เชื่อมต่อ Supabase ดูวิธีตั้งค่าใน README
    </p>
    <p v-if="errorMessage" class="notice notice--error">{{ errorMessage }}</p>

    <form v-if="showForm" class="data-card add-form" @submit.prevent="addEmployee">
      <div class="field">
        <label>รหัสพนักงาน</label>
        <input v-model="form.employee_code" type="text" placeholder="EMP-007" />
      </div>
      <div class="field">
        <label>ชื่อ-นามสกุล</label>
        <input v-model="form.full_name" type="text" placeholder="ชื่อ นามสกุล" />
      </div>
      <div class="field">
        <label>ตำแหน่ง</label>
        <input v-model="form.role" type="text" placeholder="Frontend Engineer" />
      </div>
      <div class="field">
        <label>แผนก</label>
        <input v-model="form.department" type="text" placeholder="Engineering" />
      </div>
      <div class="field">
        <label>สถานะ</label>
        <select v-model="form.status">
          <option value="Active">Active</option>
          <option value="On Leave">On Leave</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>
      <button class="btn-primary" type="submit" :disabled="saving">
        {{ saving ? 'กำลังบันทึก...' : 'บันทึก' }}
      </button>
    </form>

    <div class="stat-grid">
      <StatProgressCard :value="employees.length" label="พนักงานทั้งหมด" percent="80" color="var(--accent-green)" />
      <StatProgressCard :value="activeCount" label="กำลังปฏิบัติงาน" percent="65" color="var(--accent-blue)" />
      <StatProgressCard :value="onLeaveCount" label="ลาวันนี้" percent="20" color="var(--accent-yellow)" />
      <StatProgressCard :value="inactiveCount" label="ไม่ได้ปฏิบัติงาน" percent="15" color="var(--accent-orange)" />
    </div>

    <div class="data-card">
      <p v-if="loading" class="notice">กำลังโหลดข้อมูล...</p>
      <table v-else class="data-table">
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
                <span class="avatar-chip" :style="{ background: 'var(--accent-blue)' }">{{ initials(emp.full_name) }}</span>
                {{ emp.full_name }}
              </div>
            </td>
            <td>{{ emp.employee_code }}</td>
            <td>{{ emp.role }}</td>
            <td>{{ emp.department }}</td>
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

.notice {
  margin: 0 0 16px;
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.16);
  color: var(--text-on-dark-soft);
  font-size: 13px;
}

.notice--error {
  background: rgba(244, 151, 122, 0.25);
  color: #fff;
}

.add-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 14px;
  align-items: end;
  padding: 20px;
  margin-bottom: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 12.5px;
  color: var(--text-on-dark-soft);
  font-weight: 600;
}

.field input,
.field select {
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.16);
  color: var(--text-on-dark);
  font-size: 13.5px;
}

.field input::placeholder {
  color: var(--text-on-dark-faint);
}

.field select option {
  color: #2c2a4a;
}
</style>
