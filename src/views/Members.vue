<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import AppIcon from '../components/AppIcon.vue'
import StatProgressCard from '../components/StatProgressCard.vue'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { familyMembers as mockMembers, relationLabels } from '../data/sample'

const router = useRouter()

const members = ref([])
const loading = ref(false)
const errorMessage = ref('')
const showForm = ref(false)
const saving = ref(false)

const form = ref({
  full_name: '',
  relation: 'child',
  gender: 'male',
  birth_date: '',
})

const usingMockData = computed(() => !isSupabaseConfigured)

const childCount = computed(() => members.value.filter((m) => m.relation === 'child').length)
const parentCount = computed(() =>
  members.value.filter((m) => ['father', 'mother'].includes(m.relation)).length
)
const grandparentCount = computed(() =>
  members.value.filter((m) =>
    ['grandfather_paternal', 'grandmother_paternal', 'grandfather_maternal', 'grandmother_maternal'].includes(
      m.relation
    )
  ).length
)

function ageLabel(birthDate) {
  if (!birthDate) return '-'
  const birth = new Date(birthDate)
  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()
  if (months < 0) {
    years -= 1
    months += 12
  }
  if (years < 1) return `${months} เดือน`
  return `${years} ปี ${months} เดือน`
}

async function loadMembers() {
  if (!isSupabaseConfigured) {
    members.value = mockMembers
    return
  }

  loading.value = true
  errorMessage.value = ''
  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    errorMessage.value = 'โหลดข้อมูลสมาชิกไม่สำเร็จ: ' + error.message
  } else {
    members.value = data
  }
  loading.value = false
}

async function addMember() {
  if (!isSupabaseConfigured) {
    errorMessage.value = 'ยังไม่ได้ตั้งค่า Supabase — ดู .env.example'
    return
  }
  if (!form.value.full_name || !form.value.relation) {
    errorMessage.value = 'กรุณากรอกข้อมูลให้ครบ'
    return
  }

  saving.value = true
  errorMessage.value = ''
  const { error } = await supabase.from('family_members').insert({
    ...form.value,
    birth_date: form.value.birth_date || null,
  })
  saving.value = false

  if (error) {
    errorMessage.value = 'เพิ่มสมาชิกไม่สำเร็จ: ' + error.message
    return
  }

  form.value = { full_name: '', relation: 'child', gender: 'male', birth_date: '' }
  showForm.value = false
  await loadMembers()
}

function initials(name) {
  return name.trim().split(' ').map((p) => p[0]).slice(0, 2).join('')
}

function relationPillClass(relation) {
  return {
    self: 'pill--blue',
    spouse: 'pill--purple',
    child: 'pill--green',
    father: 'pill--yellow',
    mother: 'pill--yellow',
  }[relation] || 'pill--orange'
}

onMounted(loadMembers)
</script>

<template>
  <section>
    <PageHeader title="สมาชิกครอบครัว" subtitle="จัดการข้อมูลสมาชิกในครอบครัวของคุณ">
      <template #actions>
        <button class="btn-ghost" type="button" @click="loadMembers"><AppIcon name="filter" :size="16" /> รีเฟรช</button>
        <button class="btn-primary" type="button" @click="showForm = !showForm">
          <AppIcon name="plus" :size="16" /> เพิ่มสมาชิก
        </button>
      </template>
    </PageHeader>

    <p v-if="usingMockData" class="notice">
      กำลังแสดงข้อมูลตัวอย่าง (mock) — ยังไม่ได้เชื่อมต่อ Supabase ดูวิธีตั้งค่าใน README
    </p>
    <p v-if="errorMessage" class="notice notice--error">{{ errorMessage }}</p>

    <form v-if="showForm" class="data-card add-form" @submit.prevent="addMember">
      <div class="field">
        <label>ชื่อ-นามสกุล</label>
        <input v-model="form.full_name" type="text" placeholder="ชื่อ นามสกุล" />
      </div>
      <div class="field">
        <label>ความสัมพันธ์</label>
        <select v-model="form.relation">
          <option v-for="(label, key) in relationLabels" :key="key" :value="key">{{ label }}</option>
        </select>
      </div>
      <div class="field">
        <label>เพศ</label>
        <select v-model="form.gender">
          <option value="male">ชาย</option>
          <option value="female">หญิง</option>
          <option value="other">อื่น ๆ</option>
        </select>
      </div>
      <div class="field">
        <label>วันเกิด</label>
        <input v-model="form.birth_date" type="date" />
      </div>
      <button class="btn-primary" type="submit" :disabled="saving">
        {{ saving ? 'กำลังบันทึก...' : 'บันทึก' }}
      </button>
    </form>

    <div class="stat-grid">
      <StatProgressCard :value="members.length" label="สมาชิกทั้งหมด" percent="80" color="var(--accent-green)" />
      <StatProgressCard :value="childCount" label="ลูก" percent="65" color="var(--accent-blue)" />
      <StatProgressCard :value="parentCount" label="พ่อแม่" percent="40" color="var(--accent-yellow)" />
      <StatProgressCard :value="grandparentCount" label="ปู่ย่าตายาย" percent="30" color="var(--accent-orange)" />
    </div>

    <div class="data-card">
      <p v-if="loading" class="notice">กำลังโหลดข้อมูล...</p>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>สมาชิก</th>
            <th>ความสัมพันธ์</th>
            <th>เพศ</th>
            <th>วันเกิด</th>
            <th>อายุ</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member in members" :key="member.id" class="row-link" @click="router.push(`/members/${member.id}`)">
            <td>
              <div class="emp-cell">
                <span class="avatar-chip" :style="{ background: 'var(--accent-blue)' }">{{ initials(member.full_name) }}</span>
                {{ member.full_name }}
              </div>
            </td>
            <td><span class="pill" :class="relationPillClass(member.relation)">{{ relationLabels[member.relation] || member.relation }}</span></td>
            <td>{{ member.gender === 'male' ? 'ชาย' : member.gender === 'female' ? 'หญิง' : '-' }}</td>
            <td>{{ member.birth_date || '-' }}</td>
            <td>{{ ageLabel(member.birth_date) }}</td>
            <td class="view-cell"><AppIcon name="chevronRight" :size="16" /></td>
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

.row-link {
  cursor: pointer;
}

.view-cell {
  color: var(--text-muted);
  text-align: right;
}

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

.field select option {
  color: var(--text-primary);
}
</style>
