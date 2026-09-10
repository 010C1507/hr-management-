<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import GrowthTrendChart from '../components/GrowthTrendChart.vue'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import {
  familyMembers as mockMembers,
  growthRecords as mockRecords,
  insurancePolicies as mockPolicies,
  welfareBenefits as mockBenefits,
  educationHistory as mockEducation,
  medicalRecords as mockMedical,
  relationLabels,
} from '../data/sample'

const route = useRoute()
const router = useRouter()

const member = ref(null)
const growthRecords = ref([])
const insurancePolicies = ref([])
const welfareBenefits = ref([])
const educationHistory = ref([])
const medicalRecords = ref([])
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const activeTab = ref('overview')

const showEditForm = ref(false)
const showEducationForm = ref(false)
const showMedicalForm = ref(false)
const saving = ref(false)

const editForm = ref({})
const educationForm = ref(blankEducation())
const medicalForm = ref(blankMedical())

const tabs = [
  { key: 'overview', label: 'ภาพรวม', icon: 'grid' },
  { key: 'personal', label: 'ข้อมูลส่วนตัว', icon: 'users' },
  { key: 'growth', label: 'พัฒนาการ', icon: 'heart' },
  { key: 'education', label: 'การศึกษา', icon: 'briefcase' },
  { key: 'medical', label: 'การรักษา', icon: 'plus' },
  { key: 'insurance', label: 'ประกัน', icon: 'shield' },
  { key: 'welfare', label: 'สวัสดิการ', icon: 'gift' },
]

const policyTypeLabels = { life: 'ประกันชีวิต', health: 'ประกันสุขภาพ', accident: 'ประกันอุบัติเหตุ', car: 'ประกันรถยนต์', other: 'อื่น ๆ' }
const benefitTypeLabels = { medical: 'ค่ารักษาพยาบาล', education: 'การศึกษา', allowance: 'เงินช่วยเหลือ', other: 'อื่น ๆ' }
const educationStatusLabels = { studying: 'กำลังศึกษา', completed: 'สำเร็จการศึกษา' }
const bloodTypes = ['A', 'B', 'AB', 'O']

function blankEducation() {
  return { level: '', institution: '', field: '', start_year: '', end_year: '', status: 'completed', note: '' }
}

function blankMedical() {
  return { record_date: new Date().toISOString().slice(0, 10), hospital: '', doctor: '', diagnosis: '', treatment: '', cost: '', note: '' }
}

function initials(name) {
  return name ? name.trim().split(' ').map((p) => p[0]).slice(0, 2).join('') : '-'
}

function genderLabel(gender) {
  return gender === 'male' ? 'ชาย' : gender === 'female' ? 'หญิง' : 'อื่น ๆ'
}

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

function formatMoney(value) {
  if (!value) return '-'
  return Number(value).toLocaleString('th-TH')
}

function valueOrDash(value) {
  return value && value !== '-' ? value : '-'
}

function statusPillClass(status) {
  return { active: 'pill--green', used: 'pill--blue', expired: 'pill--orange', cancelled: 'pill--red', studying: 'pill--blue', completed: 'pill--green' }[status] || 'pill--blue'
}

const activePolicies = computed(() => insurancePolicies.value.filter((p) => p.status === 'active'))
const activeBenefits = computed(() => welfareBenefits.value.filter((b) => b.status === 'active'))
const sortedGrowth = computed(() => [...growthRecords.value].sort((a, b) => new Date(b.record_date) - new Date(a.record_date)))
const latestGrowth = computed(() => sortedGrowth.value[0] || null)
const sortedEducation = computed(() => [...educationHistory.value].sort((a, b) => (b.start_year || 0) - (a.start_year || 0)))
const currentEducation = computed(() => educationHistory.value.find((e) => e.status === 'studying') || sortedEducation.value[0] || null)
const sortedMedical = computed(() => [...medicalRecords.value].sort((a, b) => new Date(b.record_date) - new Date(a.record_date)))
const latestMedical = computed(() => sortedMedical.value[0] || null)
const hasHealthAlert = computed(() => {
  if (!member.value) return false
  return [member.value.allergies, member.value.chronic_conditions].some((v) => v && v !== '-')
})

function flash(message) {
  successMessage.value = message
  setTimeout(() => (successMessage.value = ''), 3000)
}

function requireSupabase() {
  if (isSupabaseConfigured) return true
  errorMessage.value = 'ยังไม่ได้ตั้งค่า Supabase — โหมดข้อมูลตัวอย่างบันทึกไม่ได้'
  return false
}

async function loadProfile() {
  const id = route.params.id
  errorMessage.value = ''

  if (!isSupabaseConfigured) {
    member.value = mockMembers.find((m) => m.id === id) || null
    growthRecords.value = mockRecords.filter((r) => r.member_id === id)
    insurancePolicies.value = mockPolicies.filter((p) => p.member_id === id)
    welfareBenefits.value = mockBenefits.filter((b) => b.member_id === id)
    educationHistory.value = mockEducation.filter((e) => e.member_id === id)
    medicalRecords.value = mockMedical.filter((m) => m.member_id === id)
    return
  }

  loading.value = true
  const [memberRes, growthRes, policiesRes, benefitsRes, educationRes, medicalRes] = await Promise.all([
    supabase.from('family_members').select('*').eq('id', id).single(),
    supabase.from('growth_records').select('*').eq('member_id', id),
    supabase.from('insurance_policies').select('*').eq('member_id', id),
    supabase.from('welfare_benefits').select('*').eq('member_id', id),
    supabase.from('education_history').select('*').eq('member_id', id),
    supabase.from('medical_records').select('*').eq('member_id', id),
  ])

  if (memberRes.error) errorMessage.value = 'โหลดข้อมูลสมาชิกไม่สำเร็จ: ' + memberRes.error.message
  else member.value = memberRes.data

  if (!growthRes.error) growthRecords.value = growthRes.data
  if (!policiesRes.error) insurancePolicies.value = policiesRes.data
  if (!benefitsRes.error) welfareBenefits.value = benefitsRes.data
  if (educationRes.error) errorMessage.value = 'โหลดประวัติการศึกษาไม่สำเร็จ (อาจยังไม่ได้รัน migration 002): ' + educationRes.error.message
  else educationHistory.value = educationRes.data
  if (medicalRes.error) errorMessage.value = 'โหลดประวัติการรักษาไม่สำเร็จ (อาจยังไม่ได้รัน migration 002): ' + medicalRes.error.message
  else medicalRecords.value = medicalRes.data

  loading.value = false
}

function openEditForm() {
  const m = member.value
  editForm.value = {
    full_name: m.full_name || '',
    nickname: m.nickname || '',
    relation: m.relation || 'other',
    gender: m.gender || 'male',
    birth_date: m.birth_date || '',
    blood_type: m.blood_type || '',
    phone: m.phone || '',
    email: m.email || '',
    address: m.address || '',
    occupation: m.occupation || '',
    allergies: m.allergies || '',
    chronic_conditions: m.chronic_conditions || '',
    hospital: m.hospital || '',
    hobbies: m.hobbies || '',
    note: m.note || '',
  }
  showEditForm.value = true
  activeTab.value = 'personal'
}

async function saveMember() {
  if (!requireSupabase()) return
  if (!editForm.value.full_name) {
    errorMessage.value = 'กรุณากรอกชื่อ-นามสกุล'
    return
  }
  saving.value = true
  errorMessage.value = ''
  const payload = { ...editForm.value, birth_date: editForm.value.birth_date || null }
  for (const key of Object.keys(payload)) {
    if (payload[key] === '') payload[key] = null
  }
  const { error } = await supabase.from('family_members').update(payload).eq('id', member.value.id)
  saving.value = false
  if (error) {
    errorMessage.value = 'บันทึกข้อมูลไม่สำเร็จ: ' + error.message
    return
  }
  showEditForm.value = false
  flash('บันทึกข้อมูลส่วนตัวแล้ว')
  await loadProfile()
}

async function addEducation() {
  if (!requireSupabase()) return
  if (!educationForm.value.level || !educationForm.value.institution) {
    errorMessage.value = 'กรุณากรอกระดับการศึกษาและสถาบัน'
    return
  }
  saving.value = true
  errorMessage.value = ''
  const f = educationForm.value
  const { error } = await supabase.from('education_history').insert({
    member_id: member.value.id,
    level: f.level,
    institution: f.institution,
    field: f.field || null,
    start_year: f.start_year ? Number(f.start_year) : null,
    end_year: f.end_year ? Number(f.end_year) : null,
    status: f.status,
    note: f.note || null,
  })
  saving.value = false
  if (error) {
    errorMessage.value = 'เพิ่มประวัติการศึกษาไม่สำเร็จ: ' + error.message
    return
  }
  educationForm.value = blankEducation()
  showEducationForm.value = false
  flash('เพิ่มประวัติการศึกษาแล้ว')
  await loadProfile()
}

async function addMedical() {
  if (!requireSupabase()) return
  if (!medicalForm.value.record_date || !medicalForm.value.diagnosis) {
    errorMessage.value = 'กรุณากรอกวันที่และอาการ/การวินิจฉัย'
    return
  }
  saving.value = true
  errorMessage.value = ''
  const f = medicalForm.value
  const { error } = await supabase.from('medical_records').insert({
    member_id: member.value.id,
    record_date: f.record_date,
    hospital: f.hospital || null,
    doctor: f.doctor || null,
    diagnosis: f.diagnosis,
    treatment: f.treatment || null,
    cost: f.cost ? Number(f.cost) : null,
    note: f.note || null,
  })
  saving.value = false
  if (error) {
    errorMessage.value = 'เพิ่มประวัติการรักษาไม่สำเร็จ: ' + error.message
    return
  }
  medicalForm.value = blankMedical()
  showMedicalForm.value = false
  flash('เพิ่มประวัติการรักษาแล้ว')
  await loadProfile()
}

watch(() => route.params.id, loadProfile)
onMounted(loadProfile)
</script>

<template>
  <section class="profile-page">
    <div class="top-actions">
      <button class="btn-ghost" type="button" @click="router.push('/members')">
        <AppIcon name="chevronRight" :size="16" style="transform: rotate(180deg)" /> กลับไปหน้าสมาชิก
      </button>
      <button v-if="member" class="btn-primary" type="button" @click="openEditForm">
        <AppIcon name="settings" :size="16" /> แก้ไขข้อมูลส่วนตัว
      </button>
    </div>

    <p v-if="errorMessage" class="notice notice--error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="notice notice--success">{{ successMessage }}</p>
    <p v-if="loading" class="notice">กำลังโหลดข้อมูล...</p>

    <template v-if="member">
      <div class="data-card profile-header">
        <div class="avatar-xl" :style="{ background: member.avatarColor || 'var(--accent-blue)' }">
          {{ initials(member.full_name) }}
        </div>
        <div class="profile-main">
          <div class="name-row">
            <h2>{{ member.full_name }}</h2>
            <span v-if="member.nickname" class="nickname">({{ member.nickname }})</span>
            <span class="pill pill--blue">{{ relationLabels[member.relation] || member.relation }}</span>
          </div>
          <p v-if="member.occupation" class="occupation">{{ member.occupation }}</p>
          <div class="quick-facts">
            <span><AppIcon name="calendar" :size="14" /> {{ member.birth_date || '-' }}</span>
            <span><AppIcon name="clock" :size="14" /> อายุ {{ ageLabel(member.birth_date) }}</span>
            <span><AppIcon name="users" :size="14" /> {{ genderLabel(member.gender) }}</span>
            <span v-if="member.blood_type"><AppIcon name="heart" :size="14" /> กรุ๊ปเลือด {{ member.blood_type }}</span>
            <span v-if="member.phone"><AppIcon name="phone" :size="14" /> {{ member.phone }}</span>
            <span v-if="member.email"><AppIcon name="mail" :size="14" /> {{ member.email }}</span>
          </div>
        </div>
        <div class="header-side">
          <div v-if="latestGrowth" class="profile-quote">
            <AppIcon name="heart" :size="16" />
            บันทึกล่าสุด {{ latestGrowth.weight_kg }} กก. / {{ latestGrowth.height_cm }} ซม. ({{ latestGrowth.record_date }})
          </div>
          <div v-if="hasHealthAlert" class="profile-quote alert">
            <AppIcon name="bell" :size="16" />
            <span>
              <template v-if="member.allergies && member.allergies !== '-'">แพ้: {{ member.allergies }}</template>
              <template v-if="member.chronic_conditions && member.chronic_conditions !== '-'"><br v-if="member.allergies && member.allergies !== '-'" />โรคประจำตัว: {{ member.chronic_conditions }}</template>
            </span>
          </div>
        </div>
      </div>

      <div class="tab-bar">
        <button v-for="tab in tabs" :key="tab.key" class="tab-btn" :class="{ active: activeTab === tab.key }" type="button" @click="activeTab = tab.key">
          <AppIcon :name="tab.icon" :size="15" /> {{ tab.label }}
        </button>
      </div>

      <!-- ภาพรวม -->
      <div v-if="activeTab === 'overview'" class="overview-grid">
        <div class="data-card panel">
          <h3><AppIcon name="users" :size="16" /> ข้อมูลส่วนตัว <a class="panel-link" @click="activeTab = 'personal'">ดูทั้งหมด ›</a></h3>
          <dl class="info-list">
            <div><dt>ชื่อ-นามสกุล</dt><dd>{{ member.full_name }}</dd></div>
            <div><dt>ชื่อเล่น</dt><dd>{{ valueOrDash(member.nickname) }}</dd></div>
            <div><dt>ความสัมพันธ์</dt><dd>{{ relationLabels[member.relation] || member.relation }}</dd></div>
            <div><dt>เพศ</dt><dd>{{ genderLabel(member.gender) }}</dd></div>
            <div><dt>วันเกิด</dt><dd>{{ member.birth_date || '-' }}</dd></div>
            <div><dt>อายุ</dt><dd>{{ ageLabel(member.birth_date) }}</dd></div>
            <div><dt>กรุ๊ปเลือด</dt><dd>{{ valueOrDash(member.blood_type) }}</dd></div>
            <div><dt>อาชีพ / สถานศึกษา</dt><dd>{{ valueOrDash(member.occupation) }}</dd></div>
          </dl>
        </div>

        <div class="data-card panel">
          <h3><AppIcon name="plus" :size="16" /> ข้อมูลสุขภาพ <a class="panel-link" @click="activeTab = 'medical'">ดูประวัติ ›</a></h3>
          <dl class="info-list">
            <div><dt>โรงพยาบาลประจำ</dt><dd>{{ valueOrDash(member.hospital) }}</dd></div>
            <div><dt>ประวัติแพ้ยา/อาหาร</dt><dd :class="{ warn: member.allergies && member.allergies !== '-' }">{{ valueOrDash(member.allergies) }}</dd></div>
            <div><dt>โรคประจำตัว</dt><dd :class="{ warn: member.chronic_conditions && member.chronic_conditions !== '-' }">{{ valueOrDash(member.chronic_conditions) }}</dd></div>
            <div><dt>พบแพทย์ล่าสุด</dt><dd>{{ latestMedical ? `${latestMedical.record_date} — ${latestMedical.diagnosis}` : '-' }}</dd></div>
          </dl>
        </div>

        <div class="data-card panel">
          <h3><AppIcon name="heart" :size="16" /> พัฒนาการล่าสุด <a class="panel-link" @click="activeTab = 'growth'">ดูทั้งหมด ›</a></h3>
          <GrowthTrendChart v-if="growthRecords.length" :records="growthRecords" field="weight_kg" color="var(--accent-green)" unit="กก." />
          <p v-else class="no-data">ยังไม่มีข้อมูลพัฒนาการ</p>
        </div>

        <div class="data-card panel">
          <h3><AppIcon name="briefcase" :size="16" /> การศึกษา <a class="panel-link" @click="activeTab = 'education'">ดูทั้งหมด ›</a></h3>
          <ul v-if="sortedEducation.length" class="mini-list">
            <li v-for="e in sortedEducation.slice(0, 3)" :key="e.id">
              <span class="mini-title">{{ e.level }}<template v-if="e.field"> · {{ e.field }}</template></span>
              <span class="mini-sub">{{ e.institution }} · {{ e.start_year || '?' }}–{{ e.end_year || 'ปัจจุบัน' }}</span>
            </li>
          </ul>
          <p v-else class="no-data">ยังไม่มีประวัติการศึกษา</p>
        </div>

        <div class="data-card panel">
          <h3><AppIcon name="shield" :size="16" /> ประกันที่คุ้มครองอยู่ <a class="panel-link" @click="activeTab = 'insurance'">ดูทั้งหมด ›</a></h3>
          <ul v-if="activePolicies.length" class="mini-list">
            <li v-for="p in activePolicies" :key="p.id">
              <span class="mini-title">{{ p.provider }}</span>
              <span class="mini-sub">{{ policyTypeLabels[p.policy_type] || p.policy_type }} · {{ formatMoney(p.coverage_amount) }} บาท · ถึง {{ p.end_date || '-' }}</span>
            </li>
          </ul>
          <p v-else class="no-data">ไม่มีกรมธรรม์ที่ใช้งานอยู่</p>
        </div>

        <div class="data-card panel">
          <h3><AppIcon name="gift" :size="16" /> สวัสดิการที่ใช้งานอยู่ <a class="panel-link" @click="activeTab = 'welfare'">ดูทั้งหมด ›</a></h3>
          <ul v-if="activeBenefits.length" class="mini-list">
            <li v-for="b in activeBenefits" :key="b.id">
              <span class="mini-title">{{ b.benefit_name }}</span>
              <span class="mini-sub">{{ b.provider || '-' }} · {{ formatMoney(b.amount) }} บาท</span>
            </li>
          </ul>
          <p v-else class="no-data">ไม่มีสวัสดิการที่ใช้งานอยู่</p>
        </div>

        <div class="data-card panel span-2">
          <h3><AppIcon name="grid" :size="16" /> ข้อมูลเพิ่มเติม</h3>
          <dl class="info-list two-col">
            <div><dt>ที่อยู่</dt><dd>{{ valueOrDash(member.address) }}</dd></div>
            <div><dt>งานอดิเรก / ความสนใจ</dt><dd>{{ valueOrDash(member.hobbies) }}</dd></div>
            <div><dt>โทรศัพท์</dt><dd>{{ valueOrDash(member.phone) }}</dd></div>
            <div><dt>อีเมล</dt><dd>{{ valueOrDash(member.email) }}</dd></div>
            <div v-if="member.note"><dt>บันทึกเพิ่มเติม</dt><dd>{{ member.note }}</dd></div>
          </dl>
        </div>
      </div>

      <!-- ข้อมูลส่วนตัว -->
      <div v-else-if="activeTab === 'personal'" class="tab-panel">
        <form v-if="showEditForm" class="data-card add-form" @submit.prevent="saveMember">
          <div class="field"><label>ชื่อ-นามสกุล *</label><input v-model="editForm.full_name" type="text" /></div>
          <div class="field"><label>ชื่อเล่น</label><input v-model="editForm.nickname" type="text" /></div>
          <div class="field"><label>ความสัมพันธ์</label>
            <select v-model="editForm.relation"><option v-for="(label, key) in relationLabels" :key="key" :value="key">{{ label }}</option></select>
          </div>
          <div class="field"><label>เพศ</label>
            <select v-model="editForm.gender"><option value="male">ชาย</option><option value="female">หญิง</option><option value="other">อื่น ๆ</option></select>
          </div>
          <div class="field"><label>วันเกิด</label><input v-model="editForm.birth_date" type="date" /></div>
          <div class="field"><label>กรุ๊ปเลือด</label>
            <select v-model="editForm.blood_type"><option value="">ไม่ระบุ</option><option v-for="b in bloodTypes" :key="b" :value="b">{{ b }}</option></select>
          </div>
          <div class="field"><label>โทรศัพท์</label><input v-model="editForm.phone" type="text" placeholder="08x-xxx-xxxx" /></div>
          <div class="field"><label>อีเมล</label><input v-model="editForm.email" type="email" /></div>
          <div class="field span-2"><label>ที่อยู่</label><input v-model="editForm.address" type="text" /></div>
          <div class="field span-2"><label>อาชีพ / สถานศึกษา</label><input v-model="editForm.occupation" type="text" /></div>
          <div class="field"><label>ประวัติแพ้ยา/อาหาร</label><input v-model="editForm.allergies" type="text" placeholder="เช่น แพ้เพนิซิลลิน" /></div>
          <div class="field"><label>โรคประจำตัว</label><input v-model="editForm.chronic_conditions" type="text" placeholder="เช่น ความดันโลหิตสูง" /></div>
          <div class="field"><label>โรงพยาบาลประจำ</label><input v-model="editForm.hospital" type="text" /></div>
          <div class="field"><label>งานอดิเรก / ความสนใจ</label><input v-model="editForm.hobbies" type="text" /></div>
          <div class="field span-2"><label>บันทึกเพิ่มเติม</label><input v-model="editForm.note" type="text" /></div>
          <div class="form-actions span-2">
            <button class="btn-ghost" type="button" @click="showEditForm = false">ยกเลิก</button>
            <button class="btn-primary" type="submit" :disabled="saving">{{ saving ? 'กำลังบันทึก...' : 'บันทึก' }}</button>
          </div>
        </form>

        <div class="overview-grid">
          <div class="data-card panel">
            <h3><AppIcon name="users" :size="16" /> ข้อมูลทั่วไป</h3>
            <dl class="info-list">
              <div><dt>ชื่อ-นามสกุล</dt><dd>{{ member.full_name }}</dd></div>
              <div><dt>ชื่อเล่น</dt><dd>{{ valueOrDash(member.nickname) }}</dd></div>
              <div><dt>ความสัมพันธ์</dt><dd>{{ relationLabels[member.relation] || member.relation }}</dd></div>
              <div><dt>เพศ</dt><dd>{{ genderLabel(member.gender) }}</dd></div>
              <div><dt>วันเกิด</dt><dd>{{ member.birth_date || '-' }}</dd></div>
              <div><dt>อายุ</dt><dd>{{ ageLabel(member.birth_date) }}</dd></div>
              <div><dt>กรุ๊ปเลือด</dt><dd>{{ valueOrDash(member.blood_type) }}</dd></div>
            </dl>
          </div>
          <div class="data-card panel">
            <h3><AppIcon name="phone" :size="16" /> ติดต่อ</h3>
            <dl class="info-list">
              <div><dt>โทรศัพท์</dt><dd>{{ valueOrDash(member.phone) }}</dd></div>
              <div><dt>อีเมล</dt><dd>{{ valueOrDash(member.email) }}</dd></div>
              <div><dt>ที่อยู่</dt><dd>{{ valueOrDash(member.address) }}</dd></div>
            </dl>
          </div>
          <div class="data-card panel">
            <h3><AppIcon name="plus" :size="16" /> สุขภาพ</h3>
            <dl class="info-list">
              <div><dt>โรงพยาบาลประจำ</dt><dd>{{ valueOrDash(member.hospital) }}</dd></div>
              <div><dt>ประวัติแพ้ยา/อาหาร</dt><dd :class="{ warn: member.allergies && member.allergies !== '-' }">{{ valueOrDash(member.allergies) }}</dd></div>
              <div><dt>โรคประจำตัว</dt><dd :class="{ warn: member.chronic_conditions && member.chronic_conditions !== '-' }">{{ valueOrDash(member.chronic_conditions) }}</dd></div>
            </dl>
          </div>
          <div class="data-card panel">
            <h3><AppIcon name="briefcase" :size="16" /> อาชีพและความสนใจ</h3>
            <dl class="info-list">
              <div><dt>อาชีพ / สถานศึกษา</dt><dd>{{ valueOrDash(member.occupation) }}</dd></div>
              <div><dt>กำลังศึกษา</dt><dd>{{ currentEducation && currentEducation.status === 'studying' ? `${currentEducation.level} ${currentEducation.institution}` : '-' }}</dd></div>
              <div><dt>งานอดิเรก / ความสนใจ</dt><dd>{{ valueOrDash(member.hobbies) }}</dd></div>
              <div v-if="member.note"><dt>บันทึกเพิ่มเติม</dt><dd>{{ member.note }}</dd></div>
            </dl>
          </div>
        </div>
      </div>

      <!-- พัฒนาการ -->
      <div v-else-if="activeTab === 'growth'" class="tab-panel">
        <div v-if="growthRecords.length" class="chart-row">
          <div class="data-card panel">
            <h3>น้ำหนัก (กก.)</h3>
            <GrowthTrendChart :records="growthRecords" field="weight_kg" color="var(--accent-green)" unit="กก." />
          </div>
          <div class="data-card panel">
            <h3>ส่วนสูง (ซม.)</h3>
            <GrowthTrendChart :records="growthRecords" field="height_cm" color="var(--accent-blue)" unit="ซม." />
          </div>
        </div>
        <div class="data-card">
          <table v-if="growthRecords.length" class="data-table">
            <thead><tr><th>วันที่</th><th>น้ำหนัก (กก.)</th><th>ส่วนสูง (ซม.)</th><th>บันทึกเพิ่มเติม</th></tr></thead>
            <tbody>
              <tr v-for="r in sortedGrowth" :key="r.id">
                <td>{{ r.record_date }}</td><td>{{ r.weight_kg ?? '-' }}</td><td>{{ r.height_cm ?? '-' }}</td><td>{{ r.note || '-' }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="notice">ยังไม่มีบันทึกพัฒนาการสำหรับสมาชิกคนนี้ — เพิ่มได้ที่เมนู "พัฒนาการลูก"</p>
        </div>
      </div>

      <!-- การศึกษา -->
      <div v-else-if="activeTab === 'education'" class="tab-panel">
        <div class="panel-actions">
          <button class="btn-primary" type="button" @click="showEducationForm = !showEducationForm">
            <AppIcon name="plus" :size="16" /> เพิ่มประวัติการศึกษา
          </button>
        </div>
        <form v-if="showEducationForm" class="data-card add-form" @submit.prevent="addEducation">
          <div class="field"><label>ระดับการศึกษา *</label><input v-model="educationForm.level" type="text" placeholder="เช่น ปริญญาตรี, อนุบาล" /></div>
          <div class="field"><label>สถาบัน *</label><input v-model="educationForm.institution" type="text" /></div>
          <div class="field"><label>สาขา / แผนการเรียน</label><input v-model="educationForm.field" type="text" /></div>
          <div class="field"><label>ปีที่เริ่ม (ค.ศ.)</label><input v-model="educationForm.start_year" type="number" placeholder="2020" /></div>
          <div class="field"><label>ปีที่จบ (ค.ศ.)</label><input v-model="educationForm.end_year" type="number" placeholder="เว้นว่างถ้ายังเรียนอยู่" /></div>
          <div class="field"><label>สถานะ</label>
            <select v-model="educationForm.status"><option value="studying">กำลังศึกษา</option><option value="completed">สำเร็จการศึกษา</option></select>
          </div>
          <div class="field span-2"><label>หมายเหตุ</label><input v-model="educationForm.note" type="text" /></div>
          <div class="form-actions span-2">
            <button class="btn-ghost" type="button" @click="showEducationForm = false">ยกเลิก</button>
            <button class="btn-primary" type="submit" :disabled="saving">{{ saving ? 'กำลังบันทึก...' : 'บันทึก' }}</button>
          </div>
        </form>
        <div class="data-card">
          <table v-if="sortedEducation.length" class="data-table">
            <thead><tr><th>ระดับ</th><th>สถาบัน</th><th>สาขา</th><th>ช่วงปี</th><th>สถานะ</th><th>หมายเหตุ</th></tr></thead>
            <tbody>
              <tr v-for="e in sortedEducation" :key="e.id">
                <td>{{ e.level }}</td>
                <td>{{ e.institution }}</td>
                <td>{{ e.field || '-' }}</td>
                <td>{{ e.start_year || '?' }} – {{ e.end_year || 'ปัจจุบัน' }}</td>
                <td><span class="pill" :class="statusPillClass(e.status)">{{ educationStatusLabels[e.status] || e.status }}</span></td>
                <td>{{ e.note || '-' }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="notice">ยังไม่มีประวัติการศึกษาสำหรับสมาชิกคนนี้</p>
        </div>
      </div>

      <!-- การรักษา -->
      <div v-else-if="activeTab === 'medical'" class="tab-panel">
        <div class="overview-grid compact">
          <div class="data-card panel">
            <h3><AppIcon name="plus" :size="16" /> ข้อมูลสุขภาพ</h3>
            <dl class="info-list">
              <div><dt>กรุ๊ปเลือด</dt><dd>{{ valueOrDash(member.blood_type) }}</dd></div>
              <div><dt>โรงพยาบาลประจำ</dt><dd>{{ valueOrDash(member.hospital) }}</dd></div>
              <div><dt>ประวัติแพ้ยา/อาหาร</dt><dd :class="{ warn: member.allergies && member.allergies !== '-' }">{{ valueOrDash(member.allergies) }}</dd></div>
              <div><dt>โรคประจำตัว</dt><dd :class="{ warn: member.chronic_conditions && member.chronic_conditions !== '-' }">{{ valueOrDash(member.chronic_conditions) }}</dd></div>
            </dl>
          </div>
          <div class="data-card panel">
            <h3><AppIcon name="wallet" :size="16" /> สรุปค่ารักษา</h3>
            <dl class="info-list">
              <div><dt>จำนวนครั้งที่พบแพทย์</dt><dd>{{ medicalRecords.length }} ครั้ง</dd></div>
              <div><dt>ค่ารักษารวม</dt><dd>{{ formatMoney(medicalRecords.reduce((s, m) => s + Number(m.cost || 0), 0)) }} บาท</dd></div>
              <div><dt>พบแพทย์ล่าสุด</dt><dd>{{ latestMedical ? latestMedical.record_date : '-' }}</dd></div>
            </dl>
          </div>
        </div>
        <div class="panel-actions">
          <button class="btn-primary" type="button" @click="showMedicalForm = !showMedicalForm">
            <AppIcon name="plus" :size="16" /> เพิ่มประวัติการรักษา
          </button>
        </div>
        <form v-if="showMedicalForm" class="data-card add-form" @submit.prevent="addMedical">
          <div class="field"><label>วันที่ *</label><input v-model="medicalForm.record_date" type="date" /></div>
          <div class="field"><label>โรงพยาบาล / คลินิก</label><input v-model="medicalForm.hospital" type="text" /></div>
          <div class="field"><label>แพทย์ผู้รักษา</label><input v-model="medicalForm.doctor" type="text" /></div>
          <div class="field"><label>ค่าใช้จ่าย (บาท)</label><input v-model="medicalForm.cost" type="number" /></div>
          <div class="field span-2"><label>อาการ / การวินิจฉัย *</label><input v-model="medicalForm.diagnosis" type="text" placeholder="เช่น ไข้หวัดใหญ่, ฉีดวัคซีน" /></div>
          <div class="field span-2"><label>การรักษา / ยาที่ได้รับ</label><input v-model="medicalForm.treatment" type="text" /></div>
          <div class="field span-2"><label>หมายเหตุ</label><input v-model="medicalForm.note" type="text" /></div>
          <div class="form-actions span-2">
            <button class="btn-ghost" type="button" @click="showMedicalForm = false">ยกเลิก</button>
            <button class="btn-primary" type="submit" :disabled="saving">{{ saving ? 'กำลังบันทึก...' : 'บันทึก' }}</button>
          </div>
        </form>
        <div class="data-card">
          <table v-if="sortedMedical.length" class="data-table">
            <thead><tr><th>วันที่</th><th>โรงพยาบาล</th><th>แพทย์</th><th>อาการ / การวินิจฉัย</th><th>การรักษา</th><th>ค่าใช้จ่าย</th></tr></thead>
            <tbody>
              <tr v-for="m in sortedMedical" :key="m.id">
                <td>{{ m.record_date }}</td>
                <td>{{ m.hospital || '-' }}</td>
                <td>{{ m.doctor || '-' }}</td>
                <td>{{ m.diagnosis }}</td>
                <td>{{ m.treatment || '-' }}</td>
                <td>{{ formatMoney(m.cost) }} บาท</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="notice">ยังไม่มีประวัติการรักษาสำหรับสมาชิกคนนี้</p>
        </div>
      </div>

      <!-- ประกัน -->
      <div v-else-if="activeTab === 'insurance'" class="tab-panel">
        <div class="data-card">
          <table v-if="insurancePolicies.length" class="data-table">
            <thead><tr><th>บริษัทประกัน</th><th>ประเภท</th><th>เลขกรมธรรม์</th><th>วงเงินคุ้มครอง</th><th>เบี้ย/ปี</th><th>วันหมดอายุ</th><th>สถานะ</th></tr></thead>
            <tbody>
              <tr v-for="p in insurancePolicies" :key="p.id">
                <td>{{ p.provider }}</td>
                <td>{{ policyTypeLabels[p.policy_type] || p.policy_type }}</td>
                <td>{{ p.policy_number || '-' }}</td>
                <td>{{ formatMoney(p.coverage_amount) }} บาท</td>
                <td>{{ formatMoney(p.premium) }} บาท</td>
                <td>{{ p.end_date || '-' }}</td>
                <td><span class="pill" :class="statusPillClass(p.status)">{{ p.status }}</span></td>
              </tr>
            </tbody>
          </table>
          <p v-else class="notice">ยังไม่มีกรมธรรม์ประกันสำหรับสมาชิกคนนี้ — เพิ่มได้ที่เมนู "ประกัน"</p>
        </div>
      </div>

      <!-- สวัสดิการ -->
      <div v-else-if="activeTab === 'welfare'" class="tab-panel">
        <div class="data-card">
          <table v-if="welfareBenefits.length" class="data-table">
            <thead><tr><th>สวัสดิการ</th><th>หน่วยงาน</th><th>ประเภท</th><th>จำนวนเงิน</th><th>ใช้ได้ถึง</th><th>สถานะ</th></tr></thead>
            <tbody>
              <tr v-for="b in welfareBenefits" :key="b.id">
                <td>{{ b.benefit_name }}</td>
                <td>{{ b.provider || '-' }}</td>
                <td>{{ benefitTypeLabels[b.benefit_type] || b.benefit_type }}</td>
                <td>{{ formatMoney(b.amount) }} บาท</td>
                <td>{{ b.valid_until || '-' }}</td>
                <td><span class="pill" :class="statusPillClass(b.status)">{{ b.status }}</span></td>
              </tr>
            </tbody>
          </table>
          <p v-else class="notice">ยังไม่มีสวัสดิการสำหรับสมาชิกคนนี้ — เพิ่มได้ที่เมนู "สวัสดิการ"</p>
        </div>
      </div>
    </template>

    <p v-else-if="!loading" class="notice notice--error">ไม่พบข้อมูลสมาชิกคนนี้</p>
  </section>
</template>

<style scoped>
.top-actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;
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

.notice--success {
  background: #f0fdf4;
  color: #15803d;
  border-color: #bbf7d0;
}

.profile-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  padding: 24px;
  margin-bottom: 18px;
}

.avatar-xl {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: 700;
  color: #1e3a5f;
  flex-shrink: 0;
}

.profile-main {
  flex: 1;
  min-width: 240px;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.name-row h2 {
  margin: 0;
  color: var(--text-on-dark);
  font-size: 21px;
  font-weight: 700;
}

.nickname {
  color: var(--text-on-dark-soft);
  font-size: 15px;
}

.occupation {
  margin: 4px 0 0;
  color: var(--text-on-dark-soft);
  font-size: 13.5px;
  font-weight: 500;
}

.quick-facts {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 10px;
  color: var(--text-on-dark-soft);
  font-size: 13px;
}

.quick-facts span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.header-side {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 300px;
}

.profile-quote {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: var(--glass-bg-strong);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  color: var(--text-on-dark-soft);
  font-size: 12.5px;
  line-height: 1.45;
}

.profile-quote.alert {
  background: #fff7ed;
  border-color: #fed7aa;
  color: #c2410c;
}

.tab-bar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 15px;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  background: var(--surface-bg);
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.tab-btn:hover {
  background: #e8effa;
}

.tab-btn.active {
  background: var(--cta-bg);
  border-color: transparent;
  color: #fff;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.overview-grid.compact {
  margin-bottom: 16px;
}

.span-2 {
  grid-column: span 2;
}

@media (max-width: 700px) {
  .span-2 {
    grid-column: span 1;
  }
}

.panel {
  padding: 18px 20px;
}

.panel h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 14px;
  font-size: 14px;
  color: var(--text-on-dark);
}

.panel-link {
  margin-left: auto;
  font-size: 12px;
  font-weight: 600;
  color: #1a3f7a;
  cursor: pointer;
}

.panel-link:hover {
  text-decoration: underline;
}

.panel-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 14px;
}

.info-list {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-list.two-col {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 10px 24px;
}

.info-list > div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
}

.info-list dt {
  color: var(--text-on-dark-faint);
  flex-shrink: 0;
}

.info-list dd {
  margin: 0;
  color: var(--text-on-dark-soft);
  font-weight: 600;
  text-align: right;
}

.info-list dd.warn {
  color: #c2410c;
}

.mini-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mini-list li {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mini-title {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text-on-dark);
}

.mini-sub {
  font-size: 12px;
  color: var(--text-on-dark-faint);
}

.no-data {
  margin: 0;
  font-size: 12.5px;
  color: var(--text-on-dark-faint);
}

.chart-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.add-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
  align-items: end;
  padding: 20px;
  margin-bottom: 18px;
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
