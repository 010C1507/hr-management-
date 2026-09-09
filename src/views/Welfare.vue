<script setup>
import { computed, onMounted, ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import AppIcon from '../components/AppIcon.vue'
import StatProgressCard from '../components/StatProgressCard.vue'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { familyMembers as mockMembers, welfareBenefits as mockBenefits } from '../data/sample'

const members = ref([])
const benefits = ref([])
const loading = ref(false)
const errorMessage = ref('')
const showForm = ref(false)
const saving = ref(false)

const form = ref({
  member_id: '',
  benefit_name: '',
  provider: '',
  benefit_type: 'medical',
  amount: '',
  valid_until: '',
  status: 'active',
})

const usingMockData = computed(() => !isSupabaseConfigured)

const activeCount = computed(() => benefits.value.filter((b) => b.status === 'active').length)
const totalAmount = computed(() =>
  benefits.value.reduce((sum, b) => sum + Number(b.amount || 0), 0)
)
const expiringSoon = computed(() =>
  benefits.value.filter((b) => {
    if (!b.valid_until) return false
    const days = (new Date(b.valid_until) - new Date()) / (1000 * 60 * 60 * 24)
    return days >= 0 && days <= 60
  }).length
)

const benefitTypeLabels = {
  medical: 'ค่ารักษาพยาบาล',
  education: 'การศึกษา',
  allowance: 'เงินช่วยเหลือ',
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
    used: 'pill--blue',
    expired: 'pill--orange',
  }[status] || 'pill--blue'
}

async function loadData() {
  if (!isSupabaseConfigured) {
    members.value = mockMembers
    benefits.value = mockBenefits
    return
  }

  loading.value = true
  errorMessage.value = ''

  const [membersRes, benefitsRes] = await Promise.all([
    supabase.from('family_members').select('*'),
    supabase.from('welfare_benefits').select('*').order('valid_until', { ascending: true }),
  ])

  if (membersRes.error) errorMessage.value = 'โหลดข้อมูลสมาชิกไม่สำเร็จ: ' + membersRes.error.message
  else members.value = membersRes.data

  if (benefitsRes.error) errorMessage.value = 'โหลดข้อมูลสวัสดิการไม่สำเร็จ: ' + benefitsRes.error.message
  else benefits.value = benefitsRes.data

  loading.value = false
}

async function addBenefit() {
  if (!isSupabaseConfigured) {
    errorMessage.value = 'ยังไม่ได้ตั้งค่า Supabase — ดู .env.example'
    return
  }
  if (!form.value.member_id || !form.value.benefit_name) {
    errorMessage.value = 'กรุณากรอกข้อมูลให้ครบ'
    return
  }

  saving.value = true
  errorMessage.value = ''
  const { error } = await supabase.from('welfare_benefits').insert({
    ...form.value,
    amount: form.value.amount || null,
    valid_until: form.value.valid_until || null,
  })
  saving.value = false

  if (error) {
    errorMessage.value = 'เพิ่มสวัสดิการไม่สำเร็จ: ' + error.message
    return
  }

  form.value = {
    member_id: '',
    benefit_name: '',
    provider: '',
    benefit_type: 'medical',
    amount: '',
    valid_until: '',
    status: 'active',
  }
  showForm.value = false
  await loadData()
}

onMounted(loadData)
</script>

<template>
  <section>
    <PageHeader title="สวัสดิการ" subtitle="ติดตามสวัสดิการและสิทธิประโยชน์ของสมาชิกในครอบครัว">
      <template #actions>
        <button class="btn-ghost" type="button" @click="loadData"><AppIcon name="filter" :size="16" /> รีเฟรช</button>
        <button class="btn-primary" type="button" @click="showForm = !showForm">
          <AppIcon name="plus" :size="16" /> เพิ่มสวัสดิการ
        </button>
      </template>
    </PageHeader>

    <p v-if="usingMockData" class="notice">
      กำลังแสดงข้อมูลตัวอย่าง (mock) — ยังไม่ได้เชื่อมต่อ Supabase ดูวิธีตั้งค่าใน README
    </p>
    <p v-if="errorMessage" class="notice notice--error">{{ errorMessage }}</p>

    <form v-if="showForm" class="data-card add-form" @submit.prevent="addBenefit">
      <div class="field">
        <label>สมาชิก</label>
        <select v-model="form.member_id">
          <option value="" disabled>เลือกสมาชิก</option>
          <option v-for="m in members" :key="m.id" :value="m.id">{{ m.full_name }}</option>
        </select>
      </div>
      <div class="field">
        <label>ชื่อสวัสดิการ</label>
        <input v-model="form.benefit_name" type="text" placeholder="เช่น เงินสงเคราะห์บุตร" />
      </div>
      <div class="field">
        <label>หน่วยงาน/ผู้ให้สิทธิ</label>
        <input v-model="form.provider" type="text" placeholder="เช่น สำนักงานประกันสังคม" />
      </div>
      <div class="field">
        <label>ประเภท</label>
        <select v-model="form.benefit_type">
          <option v-for="(label, key) in benefitTypeLabels" :key="key" :value="key">{{ label }}</option>
        </select>
      </div>
      <div class="field">
        <label>จำนวนเงิน (บาท)</label>
        <input v-model="form.amount" type="number" placeholder="800" />
      </div>
      <div class="field">
        <label>ใช้ได้ถึงวันที่</label>
        <input v-model="form.valid_until" type="date" />
      </div>
      <button class="btn-primary" type="submit" :disabled="saving">
        {{ saving ? 'กำลังบันทึก...' : 'บันทึก' }}
      </button>
    </form>

    <div class="stat-grid">
      <StatProgressCard :value="benefits.length" label="สวัสดิการทั้งหมด" percent="70" color="var(--accent-green)" />
      <StatProgressCard :value="activeCount" label="ใช้งานอยู่" percent="65" color="var(--accent-blue)" />
      <StatProgressCard :value="expiringSoon" label="ใกล้หมดอายุ (60 วัน)" percent="30" color="var(--accent-orange)" />
      <StatProgressCard :value="`${formatMoney(totalAmount)} บาท`" label="มูลค่ารวม" percent="80" color="var(--accent-yellow)" />
    </div>

    <div class="data-card">
      <p v-if="loading" class="notice">กำลังโหลดข้อมูล...</p>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>สมาชิก</th>
            <th>สวัสดิการ</th>
            <th>หน่วยงาน</th>
            <th>ประเภท</th>
            <th>จำนวนเงิน</th>
            <th>ใช้ได้ถึง</th>
            <th>สถานะ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="benefit in benefits" :key="benefit.id">
            <td>{{ memberName(benefit.member_id) }}</td>
            <td>{{ benefit.benefit_name }}</td>
            <td>{{ benefit.provider || '-' }}</td>
            <td>{{ benefitTypeLabels[benefit.benefit_type] || benefit.benefit_type }}</td>
            <td>{{ formatMoney(benefit.amount) }} บาท</td>
            <td>{{ benefit.valid_until || '-' }}</td>
            <td><span class="pill" :class="statusPillClass(benefit.status)">{{ benefit.status }}</span></td>
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
