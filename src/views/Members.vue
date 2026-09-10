<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import AppIcon from '../components/AppIcon.vue'
import StatProgressCard from '../components/StatProgressCard.vue'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { familyMembers as mockMembers, relationLabels } from '../data/sample'
import { builtInAvatars } from '../data/avatars'

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
  photo_url: '',
})

const usingMockData = computed(() => !isSupabaseConfigured)

const MEMBER_EXPORT_FIELDS = [
  'id', 'full_name', 'nickname', 'relation', 'gender', 'birth_date', 'photo_url',
  'blood_type', 'phone', 'email', 'address', 'occupation', 'allergies',
  'chronic_conditions', 'hospital', 'hobbies', 'note',
]

const importInput = ref(null)
const importPreview = ref(null)
const importing = ref(false)

function exportMembers() {
  const payload = {
    format: 'household-registry-members',
    version: 1,
    exported_at: new Date().toISOString(),
    members: members.value.map((m) =>
      Object.fromEntries(MEMBER_EXPORT_FIELDS.map((field) => [field, m[field] ?? null]))
    ),
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `family-members-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function validateImportRow(row, index) {
  const errors = []
  if (!row || typeof row !== 'object') return [`แถวที่ ${index + 1}: ไม่ใช่ข้อมูลที่ถูกต้อง`]
  if (!row.full_name || !String(row.full_name).trim()) errors.push(`แถวที่ ${index + 1}: ไม่มีชื่อ-นามสกุล`)
  if (!row.relation) errors.push(`แถวที่ ${index + 1}: ไม่มีความสัมพันธ์`)
  else if (!(row.relation in relationLabels)) errors.push(`แถวที่ ${index + 1}: ความสัมพันธ์ "${row.relation}" ไม่ถูกต้อง`)
  if (row.gender && !['male', 'female', 'other'].includes(row.gender)) {
    errors.push(`แถวที่ ${index + 1}: เพศ "${row.gender}" ไม่ถูกต้อง`)
  }
  return errors
}

function onImportFileChange(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    errorMessage.value = ''
    let parsed
    try {
      parsed = JSON.parse(reader.result)
    } catch {
      errorMessage.value = 'ไฟล์นี้ไม่ใช่ JSON ที่ถูกต้อง'
      return
    }

    const rows = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.members) ? parsed.members : null
    if (!rows) {
      errorMessage.value = 'รูปแบบไฟล์ไม่ถูกต้อง — ต้องเป็น array หรือ { "members": [...] }'
      return
    }

    const errors = rows.flatMap((row, i) => validateImportRow(row, i))
    const cleanRows = rows.map((row) =>
      Object.fromEntries(
        MEMBER_EXPORT_FIELDS.map((field) => [field, row[field] === '' ? null : row[field] ?? null]).filter(
          ([field, value]) => !(field === 'id' && !value)
        )
      )
    )

    importPreview.value = { rows: cleanRows, errors, fileName: file.name }
  }
  reader.readAsText(file)
}

function cancelImport() {
  importPreview.value = null
}

async function confirmImport() {
  if (!importPreview.value || importPreview.value.errors.length) return

  if (!isSupabaseConfigured) {
    members.value = importPreview.value.rows.map((row, i) => ({ ...row, id: row.id || `imported-${i}` }))
    importPreview.value = null
    errorMessage.value = ''
    return
  }

  importing.value = true
  errorMessage.value = ''
  const { error } = await supabase
    .from('family_members')
    .upsert(importPreview.value.rows, { onConflict: 'id' })
  importing.value = false

  if (error) {
    errorMessage.value = 'นำเข้าข้อมูลไม่สำเร็จ: ' + error.message
    return
  }

  importPreview.value = null
  await loadMembers()
}

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
    photo_url: form.value.photo_url || null,
  })
  saving.value = false

  if (error) {
    errorMessage.value = 'เพิ่มสมาชิกไม่สำเร็จ: ' + error.message
    return
  }

  form.value = { full_name: '', relation: 'child', gender: 'male', birth_date: '', photo_url: '' }
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
        <button class="btn-ghost" type="button" @click="exportMembers"><AppIcon name="download" :size="16" /> ส่งออก JSON</button>
        <button class="btn-ghost" type="button" @click="importInput.click()"><AppIcon name="upload" :size="16" /> นำเข้า JSON</button>
        <input ref="importInput" type="file" accept="application/json,.json" hidden @change="onImportFileChange" />
        <button class="btn-primary" type="button" @click="showForm = !showForm">
          <AppIcon name="plus" :size="16" /> เพิ่มสมาชิก
        </button>
      </template>
    </PageHeader>

    <p v-if="usingMockData" class="notice">
      กำลังแสดงข้อมูลตัวอย่าง (mock) — ยังไม่ได้เชื่อมต่อ Supabase ดูวิธีตั้งค่าใน README
    </p>
    <p v-if="errorMessage" class="notice notice--error">{{ errorMessage }}</p>

    <div v-if="importPreview" class="data-card import-preview">
      <h3>ตรวจสอบข้อมูลก่อนนำเข้า — {{ importPreview.fileName }}</h3>
      <p v-if="importPreview.errors.length" class="notice notice--error">
        พบข้อผิดพลาด {{ importPreview.errors.length }} รายการ กรุณาแก้ไขไฟล์แล้วนำเข้าใหม่:
      </p>
      <ul v-if="importPreview.errors.length" class="import-errors">
        <li v-for="(err, i) in importPreview.errors" :key="i">{{ err }}</li>
      </ul>
      <p v-else class="notice">
        พบสมาชิก {{ importPreview.rows.length }} รายการ — แถวที่มี <code>id</code> ตรงกับสมาชิกเดิมจะถูกอัปเดต
        ส่วนแถวที่ไม่มี <code>id</code> จะถูกเพิ่มเป็นสมาชิกใหม่
        <span v-if="usingMockData">(โหมดข้อมูลตัวอย่าง — จะแทนที่รายการที่แสดงอยู่ชั่วคราว ไม่ถูกบันทึกถาวร)</span>
      </p>
      <div class="import-actions">
        <button class="btn-ghost" type="button" @click="cancelImport">ยกเลิก</button>
        <button
          class="btn-primary"
          type="button"
          :disabled="importPreview.errors.length > 0 || importing"
          @click="confirmImport"
        >
          {{ importing ? 'กำลังนำเข้า...' : `ยืนยันนำเข้า ${importPreview.rows.length} รายการ` }}
        </button>
      </div>
    </div>

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
      <div class="field avatar-field">
        <label>รูปโปรไฟล์ (เลือกได้ หรือเปลี่ยน/อัปโหลดภายหลังในหน้าโปรไฟล์)</label>
        <div class="avatar-picker">
          <button
            v-for="a in builtInAvatars"
            :key="a.id"
            type="button"
            class="avatar-option"
            :class="{ selected: form.photo_url === a.url }"
            :title="a.label"
            @click="form.photo_url = form.photo_url === a.url ? '' : a.url"
          >
            <img :src="a.url" :alt="a.label" />
          </button>
        </div>
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
                <img v-if="member.photo_url" class="avatar-chip" :src="member.photo_url" :alt="member.full_name" />
                <span v-else class="avatar-chip" :style="{ background: 'var(--accent-blue)' }">{{ initials(member.full_name) }}</span>
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

img.avatar-chip {
  object-fit: cover;
  background: var(--surface-bg);
}

.avatar-field {
  grid-column: 1 / -1;
}

.avatar-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.avatar-option {
  width: 42px;
  height: 42px;
  padding: 0;
  border-radius: 50%;
  border: 2px solid transparent;
  background: var(--surface-bg);
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.15s ease, transform 0.15s ease;
}

.avatar-option img {
  width: 100%;
  height: 100%;
  display: block;
}

.avatar-option:hover {
  transform: translateY(-2px);
}

.avatar-option.selected {
  border-color: #1a3f7a;
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

.import-preview {
  padding: 18px 20px;
  margin-bottom: 20px;
}

.import-preview h3 {
  margin: 0 0 12px;
  font-size: 14px;
  color: var(--text-on-dark);
}

.import-errors {
  margin: 0 0 12px;
  padding-left: 20px;
  font-size: 13px;
  color: #dc2626;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.import-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
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
