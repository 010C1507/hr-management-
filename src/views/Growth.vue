<script setup>
import { computed, onMounted, ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import AppIcon from '../components/AppIcon.vue'
import StatProgressCard from '../components/StatProgressCard.vue'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { familyMembers as mockMembers, growthRecords as mockRecords } from '../data/sample'

const members = ref([])
const records = ref([])
const loading = ref(false)
const errorMessage = ref('')
const showForm = ref(false)
const saving = ref(false)
const selectedMemberId = ref('')

const form = ref({
  member_id: '',
  record_date: new Date().toISOString().slice(0, 10),
  weight_kg: '',
  height_cm: '',
  note: '',
})

const usingMockData = computed(() => !isSupabaseConfigured)

const memberOptions = computed(() =>
  members.value.length ? members.value : []
)

const filteredRecords = computed(() => {
  const list = selectedMemberId.value
    ? records.value.filter((r) => r.member_id === selectedMemberId.value)
    : records.value
  return [...list].sort((a, b) => new Date(b.record_date) - new Date(a.record_date))
})

const latestRecord = computed(() => filteredRecords.value[0] || null)
const previousRecord = computed(() => filteredRecords.value[1] || null)

const weightDelta = computed(() => {
  if (!latestRecord.value || !previousRecord.value) return null
  return (latestRecord.value.weight_kg - previousRecord.value.weight_kg).toFixed(1)
})

const heightDelta = computed(() => {
  if (!latestRecord.value || !previousRecord.value) return null
  return (latestRecord.value.height_cm - previousRecord.value.height_cm).toFixed(1)
})

function memberName(id) {
  return members.value.find((m) => m.id === id)?.full_name || '-'
}

async function loadData() {
  if (!isSupabaseConfigured) {
    members.value = mockMembers
    records.value = mockRecords
    if (!selectedMemberId.value) selectedMemberId.value = mockMembers.find((m) => m.relation === 'child')?.id || ''
    return
  }

  loading.value = true
  errorMessage.value = ''

  const [membersRes, recordsRes] = await Promise.all([
    supabase.from('family_members').select('*').order('created_at', { ascending: false }),
    supabase.from('growth_records').select('*').order('record_date', { ascending: false }),
  ])

  if (membersRes.error) {
    errorMessage.value = 'โหลดข้อมูลสมาชิกไม่สำเร็จ: ' + membersRes.error.message
  } else {
    members.value = membersRes.data
    if (!selectedMemberId.value) {
      selectedMemberId.value = membersRes.data.find((m) => m.relation === 'child')?.id || ''
    }
  }

  if (recordsRes.error) {
    errorMessage.value = 'โหลดข้อมูลการเติบโตไม่สำเร็จ: ' + recordsRes.error.message
  } else {
    records.value = recordsRes.data
  }

  loading.value = false
}

async function addRecord() {
  if (!isSupabaseConfigured) {
    errorMessage.value = 'ยังไม่ได้ตั้งค่า Supabase — ดู .env.example'
    return
  }
  if (!form.value.member_id || !form.value.record_date) {
    errorMessage.value = 'กรุณาเลือกสมาชิกและวันที่บันทึก'
    return
  }

  saving.value = true
  errorMessage.value = ''
  const { error } = await supabase.from('growth_records').insert({
    ...form.value,
    weight_kg: form.value.weight_kg || null,
    height_cm: form.value.height_cm || null,
  })
  saving.value = false

  if (error) {
    errorMessage.value = 'บันทึกข้อมูลไม่สำเร็จ: ' + error.message
    return
  }

  form.value = {
    member_id: selectedMemberId.value,
    record_date: new Date().toISOString().slice(0, 10),
    weight_kg: '',
    height_cm: '',
    note: '',
  }
  showForm.value = false
  await loadData()
}

function openForm() {
  form.value.member_id = selectedMemberId.value
  showForm.value = !showForm.value
}

onMounted(loadData)
</script>

<template>
  <section>
    <PageHeader title="พัฒนาการลูก" subtitle="ติดตามน้ำหนักและส่วนสูงของลูกตามช่วงเวลา">
      <template #actions>
        <button class="btn-ghost" type="button" @click="loadData"><AppIcon name="filter" :size="16" /> รีเฟรช</button>
        <button class="btn-primary" type="button" @click="openForm">
          <AppIcon name="plus" :size="16" /> บันทึกการเติบโต
        </button>
      </template>
    </PageHeader>

    <p v-if="usingMockData" class="notice">
      กำลังแสดงข้อมูลตัวอย่าง (mock) — ยังไม่ได้เชื่อมต่อ Supabase ดูวิธีตั้งค่าใน README
    </p>
    <p v-if="errorMessage" class="notice notice--error">{{ errorMessage }}</p>

    <div class="data-card member-select">
      <label>เลือกสมาชิก</label>
      <select v-model="selectedMemberId">
        <option value="">สมาชิกทั้งหมด</option>
        <option v-for="m in memberOptions" :key="m.id" :value="m.id">{{ m.full_name }}</option>
      </select>
    </div>

    <form v-if="showForm" class="data-card add-form" @submit.prevent="addRecord">
      <div class="field">
        <label>สมาชิก</label>
        <select v-model="form.member_id">
          <option v-for="m in memberOptions" :key="m.id" :value="m.id">{{ m.full_name }}</option>
        </select>
      </div>
      <div class="field">
        <label>วันที่บันทึก</label>
        <input v-model="form.record_date" type="date" />
      </div>
      <div class="field">
        <label>น้ำหนัก (กก.)</label>
        <input v-model="form.weight_kg" type="number" step="0.1" placeholder="13.0" />
      </div>
      <div class="field">
        <label>ส่วนสูง (ซม.)</label>
        <input v-model="form.height_cm" type="number" step="0.1" placeholder="88.0" />
      </div>
      <div class="field">
        <label>บันทึกเพิ่มเติม</label>
        <input v-model="form.note" type="text" placeholder="เช่น ตรวจสุขภาพประจำปี" />
      </div>
      <button class="btn-primary" type="submit" :disabled="saving">
        {{ saving ? 'กำลังบันทึก...' : 'บันทึก' }}
      </button>
    </form>

    <div class="stat-grid">
      <StatProgressCard :value="latestRecord ? `${latestRecord.weight_kg} กก.` : '-'" label="น้ำหนักล่าสุด" percent="60" color="var(--accent-green)" />
      <StatProgressCard :value="latestRecord ? `${latestRecord.height_cm} ซม.` : '-'" label="ส่วนสูงล่าสุด" percent="60" color="var(--accent-blue)" />
      <StatProgressCard :value="weightDelta !== null ? `${weightDelta > 0 ? '+' : ''}${weightDelta} กก.` : '-'" label="เปลี่ยนแปลงน้ำหนัก" percent="40" color="var(--accent-yellow)" />
      <StatProgressCard :value="heightDelta !== null ? `${heightDelta > 0 ? '+' : ''}${heightDelta} ซม.` : '-'" label="เปลี่ยนแปลงส่วนสูง" percent="40" color="var(--accent-orange)" />
    </div>

    <div class="data-card">
      <p v-if="loading" class="notice">กำลังโหลดข้อมูล...</p>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>วันที่</th>
            <th>สมาชิก</th>
            <th>น้ำหนัก (กก.)</th>
            <th>ส่วนสูง (ซม.)</th>
            <th>บันทึกเพิ่มเติม</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in filteredRecords" :key="record.id">
            <td>{{ record.record_date }}</td>
            <td>{{ memberName(record.member_id) }}</td>
            <td>{{ record.weight_kg ?? '-' }}</td>
            <td>{{ record.height_cm ?? '-' }}</td>
            <td>{{ record.note || '-' }}</td>
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

.member-select {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
}

.member-select label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.member-select select {
  flex: 1;
  max-width: 320px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  background: var(--surface-bg);
  color: var(--text-primary);
  font-size: 13.5px;
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
