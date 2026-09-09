<script setup>
import { computed, onMounted, ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import AppIcon from '../components/AppIcon.vue'
import StatProgressCard from '../components/StatProgressCard.vue'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { familyMembers as mockMembers, insurancePolicies as mockPolicies } from '../data/sample'

const members = ref([])
const policies = ref([])
const loading = ref(false)
const errorMessage = ref('')
const showForm = ref(false)
const saving = ref(false)

const form = ref({
  member_id: '',
  provider: '',
  policy_type: 'health',
  policy_number: '',
  coverage_amount: '',
  premium: '',
  start_date: '',
  end_date: '',
  status: 'active',
})

const usingMockData = computed(() => !isSupabaseConfigured)

const activeCount = computed(() => policies.value.filter((p) => p.status === 'active').length)
const totalCoverage = computed(() =>
  policies.value.reduce((sum, p) => sum + Number(p.coverage_amount || 0), 0)
)
const expiringSoon = computed(() =>
  policies.value.filter((p) => {
    if (!p.end_date) return false
    const days = (new Date(p.end_date) - new Date()) / (1000 * 60 * 60 * 24)
    return days >= 0 && days <= 60
  }).length
)

const policyTypeLabels = {
  life: 'ประกันชีวิต',
  health: 'ประกันสุขภาพ',
  accident: 'ประกันอุบัติเหตุ',
  car: 'ประกันรถยนต์',
  other: 'อื่น ๆ',
}

function memberName(id) {
  return members.value.find((m) => m.id === id)?.full_name || '-'
}

function formatMoney(value) {
  if (!value) return '-'
  return Number(value).toLocaleString('th-TH')
}

function statusPillClass(status) {
  return {
    active: 'pill--green',
    expired: 'pill--orange',
    cancelled: 'pill--red',
  }[status] || 'pill--blue'
}

async function loadData() {
  if (!isSupabaseConfigured) {
    members.value = mockMembers
    policies.value = mockPolicies
    return
  }

  loading.value = true
  errorMessage.value = ''

  const [membersRes, policiesRes] = await Promise.all([
    supabase.from('family_members').select('*'),
    supabase.from('insurance_policies').select('*').order('end_date', { ascending: true }),
  ])

  if (membersRes.error) errorMessage.value = 'โหลดข้อมูลสมาชิกไม่สำเร็จ: ' + membersRes.error.message
  else members.value = membersRes.data

  if (policiesRes.error) errorMessage.value = 'โหลดข้อมูลประกันไม่สำเร็จ: ' + policiesRes.error.message
  else policies.value = policiesRes.data

  loading.value = false
}

async function addPolicy() {
  if (!isSupabaseConfigured) {
    errorMessage.value = 'ยังไม่ได้ตั้งค่า Supabase — ดู .env.example'
    return
  }
  if (!form.value.member_id || !form.value.provider || !form.value.policy_type) {
    errorMessage.value = 'กรุณากรอกข้อมูลให้ครบ'
    return
  }

  saving.value = true
  errorMessage.value = ''
  const { error } = await supabase.from('insurance_policies').insert({
    ...form.value,
    coverage_amount: form.value.coverage_amount || null,
    premium: form.value.premium || null,
    start_date: form.value.start_date || null,
    end_date: form.value.end_date || null,
  })
  saving.value = false

  if (error) {
    errorMessage.value = 'เพิ่มกรมธรรม์ไม่สำเร็จ: ' + error.message
    return
  }

  form.value = {
    member_id: '',
    provider: '',
    policy_type: 'health',
    policy_number: '',
    coverage_amount: '',
    premium: '',
    start_date: '',
    end_date: '',
    status: 'active',
  }
  showForm.value = false
  await loadData()
}

onMounted(loadData)
</script>

<template>
  <section>
    <PageHeader title="ประกัน" subtitle="จัดการกรมธรรม์ประกันของสมาชิกในครอบครัว">
      <template #actions>
        <button class="btn-ghost" type="button" @click="loadData"><AppIcon name="filter" :size="16" /> รีเฟรช</button>
        <button class="btn-primary" type="button" @click="showForm = !showForm">
          <AppIcon name="plus" :size="16" /> เพิ่มกรมธรรม์
        </button>
      </template>
    </PageHeader>

    <p v-if="usingMockData" class="notice">
      กำลังแสดงข้อมูลตัวอย่าง (mock) — ยังไม่ได้เชื่อมต่อ Supabase ดูวิธีตั้งค่าใน README
    </p>
    <p v-if="errorMessage" class="notice notice--error">{{ errorMessage }}</p>

    <form v-if="showForm" class="data-card add-form" @submit.prevent="addPolicy">
      <div class="field">
        <label>สมาชิก</label>
        <select v-model="form.member_id">
          <option value="" disabled>เลือกสมาชิก</option>
          <option v-for="m in members" :key="m.id" :value="m.id">{{ m.full_name }}</option>
        </select>
      </div>
      <div class="field">
        <label>บริษัทประกัน</label>
        <input v-model="form.provider" type="text" placeholder="เช่น AIA" />
      </div>
      <div class="field">
        <label>ประเภท</label>
        <select v-model="form.policy_type">
          <option v-for="(label, key) in policyTypeLabels" :key="key" :value="key">{{ label }}</option>
        </select>
      </div>
      <div class="field">
        <label>เลขกรมธรรม์</label>
        <input v-model="form.policy_number" type="text" placeholder="HL-000000" />
      </div>
      <div class="field">
        <label>วงเงินคุ้มครอง (บาท)</label>
        <input v-model="form.coverage_amount" type="number" placeholder="300000" />
      </div>
      <div class="field">
        <label>เบี้ยประกัน/ปี (บาท)</label>
        <input v-model="form.premium" type="number" placeholder="9500" />
      </div>
      <div class="field">
        <label>วันเริ่มคุ้มครอง</label>
        <input v-model="form.start_date" type="date" />
      </div>
      <div class="field">
        <label>วันหมดอายุ</label>
        <input v-model="form.end_date" type="date" />
      </div>
      <button class="btn-primary" type="submit" :disabled="saving">
        {{ saving ? 'กำลังบันทึก...' : 'บันทึก' }}
      </button>
    </form>

    <div class="stat-grid">
      <StatProgressCard :value="policies.length" label="กรมธรรม์ทั้งหมด" percent="70" color="var(--accent-green)" />
      <StatProgressCard :value="activeCount" label="กำลังคุ้มครอง" percent="65" color="var(--accent-blue)" />
      <StatProgressCard :value="expiringSoon" label="ใกล้หมดอายุ (60 วัน)" percent="30" color="var(--accent-orange)" />
      <StatProgressCard :value="`${formatMoney(totalCoverage)} บาท`" label="วงเงินคุ้มครองรวม" percent="80" color="var(--accent-yellow)" />
    </div>

    <div class="data-card">
      <p v-if="loading" class="notice">กำลังโหลดข้อมูล...</p>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>สมาชิก</th>
            <th>บริษัทประกัน</th>
            <th>ประเภท</th>
            <th>เลขกรมธรรม์</th>
            <th>วงเงินคุ้มครอง</th>
            <th>วันหมดอายุ</th>
            <th>สถานะ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="policy in policies" :key="policy.id">
            <td>{{ memberName(policy.member_id) }}</td>
            <td>{{ policy.provider }}</td>
            <td>{{ policyTypeLabels[policy.policy_type] || policy.policy_type }}</td>
            <td>{{ policy.policy_number || '-' }}</td>
            <td>{{ formatMoney(policy.coverage_amount) }} บาท</td>
            <td>{{ policy.end_date || '-' }}</td>
            <td><span class="pill" :class="statusPillClass(policy.status)">{{ policy.status }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.notice {
  margin: 0 0 16px;
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  background: #eff6ff;
  color: var(--text-secondary);
  font-size: 13px;
  border: 1px solid #bfdbfe;
}

.notice--error {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
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
  color: var(--text-secondary);
  font-weight: 600;
}

.field input,
.field select {
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  background: var(--surface-bg);
  color: var(--text-primary);
  font-size: 13.5px;
}

.field input:focus,
.field select:focus {
  outline: none;
  border-color: #1a3f7a;
  background: #fff;
}

.field input::placeholder {
  color: var(--text-muted);
}
</style>
