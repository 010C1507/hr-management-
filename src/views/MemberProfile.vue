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
  relationLabels,
} from '../data/sample'

const route = useRoute()
const router = useRouter()

const member = ref(null)
const growthRecords = ref([])
const insurancePolicies = ref([])
const welfareBenefits = ref([])
const loading = ref(false)
const errorMessage = ref('')
const activeTab = ref('overview')

const tabs = [
  { key: 'overview', label: 'ภาพรวม', icon: 'grid' },
  { key: 'growth', label: 'พัฒนาการ', icon: 'heart' },
  { key: 'insurance', label: 'ประกัน', icon: 'shield' },
  { key: 'welfare', label: 'สวัสดิการ', icon: 'gift' },
]

const policyTypeLabels = {
  life: 'ประกันชีวิต',
  health: 'ประกันสุขภาพ',
  accident: 'ประกันอุบัติเหตุ',
  car: 'ประกันรถยนต์',
  other: 'อื่น ๆ',
}

const benefitTypeLabels = {
  medical: 'ค่ารักษาพยาบาล',
  education: 'การศึกษา',
  allowance: 'เงินช่วยเหลือ',
  other: 'อื่น ๆ',
}

function initials(name) {
  return name ? name.trim().split(' ').map((p) => p[0]).slice(0, 2).join('') : '-'
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

function statusPillClass(status) {
  return {
    active: 'pill--green',
    used: 'pill--blue',
    expired: 'pill--orange',
    cancelled: 'pill--red',
  }[status] || 'pill--blue'
}

const activePolicies = computed(() => insurancePolicies.value.filter((p) => p.status === 'active'))
const activeBenefits = computed(() => welfareBenefits.value.filter((b) => b.status === 'active'))
const sortedGrowth = computed(() =>
  [...growthRecords.value].sort((a, b) => new Date(b.record_date) - new Date(a.record_date))
)
const latestGrowth = computed(() => sortedGrowth.value[0] || null)

async function loadProfile() {
  const id = route.params.id
  errorMessage.value = ''

  if (!isSupabaseConfigured) {
    member.value = mockMembers.find((m) => m.id === id) || null
    growthRecords.value = mockRecords.filter((r) => r.member_id === id)
    insurancePolicies.value = mockPolicies.filter((p) => p.member_id === id)
    welfareBenefits.value = mockBenefits.filter((b) => b.member_id === id)
    return
  }

  loading.value = true
  const [memberRes, growthRes, policiesRes, benefitsRes] = await Promise.all([
    supabase.from('family_members').select('*').eq('id', id).single(),
    supabase.from('growth_records').select('*').eq('member_id', id),
    supabase.from('insurance_policies').select('*').eq('member_id', id),
    supabase.from('welfare_benefits').select('*').eq('member_id', id),
  ])

  if (memberRes.error) errorMessage.value = 'โหลดข้อมูลสมาชิกไม่สำเร็จ: ' + memberRes.error.message
  else member.value = memberRes.data

  if (!growthRes.error) growthRecords.value = growthRes.data
  if (!policiesRes.error) insurancePolicies.value = policiesRes.data
  if (!benefitsRes.error) welfareBenefits.value = benefitsRes.data

  loading.value = false
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
    </div>

    <p v-if="errorMessage" class="notice notice--error">{{ errorMessage }}</p>
    <p v-else-if="loading" class="notice">กำลังโหลดข้อมูล...</p>

    <template v-if="member">
      <div class="data-card profile-header">
        <div class="avatar-xl" :style="{ background: member.avatarColor || 'var(--accent-blue)' }">
          {{ initials(member.full_name) }}
        </div>
        <div class="profile-main">
          <div class="name-row">
            <h2>{{ member.full_name }}</h2>
            <span class="pill pill--blue">{{ relationLabels[member.relation] || member.relation }}</span>
          </div>
          <div class="quick-facts">
            <span><AppIcon name="calendar" :size="14" /> {{ member.birth_date || '-' }}</span>
            <span><AppIcon name="clock" :size="14" /> อายุ {{ ageLabel(member.birth_date) }}</span>
            <span><AppIcon name="users" :size="14" /> {{ member.gender === 'male' ? 'ชาย' : member.gender === 'female' ? 'หญิง' : 'อื่น ๆ' }}</span>
          </div>
        </div>
        <div class="profile-quote" v-if="latestGrowth">
          <AppIcon name="heart" :size="16" />
          บันทึกล่าสุด {{ latestGrowth.weight_kg }} กก. / {{ latestGrowth.height_cm }} ซม. ({{ latestGrowth.record_date }})
        </div>
      </div>

      <div class="tab-bar">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          type="button"
          @click="activeTab = tab.key"
        >
          <AppIcon :name="tab.icon" :size="15" /> {{ tab.label }}
        </button>
      </div>

      <div v-if="activeTab === 'overview'" class="overview-grid">
        <div class="data-card panel">
          <h3><AppIcon name="users" :size="16" /> ข้อมูลส่วนตัว</h3>
          <dl class="info-list">
            <div><dt>ชื่อ-นามสกุล</dt><dd>{{ member.full_name }}</dd></div>
            <div><dt>ความสัมพันธ์</dt><dd>{{ relationLabels[member.relation] || member.relation }}</dd></div>
            <div><dt>เพศ</dt><dd>{{ member.gender === 'male' ? 'ชาย' : member.gender === 'female' ? 'หญิง' : 'อื่น ๆ' }}</dd></div>
            <div><dt>วันเกิด</dt><dd>{{ member.birth_date || '-' }}</dd></div>
            <div><dt>อายุ</dt><dd>{{ ageLabel(member.birth_date) }}</dd></div>
            <div v-if="member.note"><dt>บันทึกเพิ่มเติม</dt><dd>{{ member.note }}</dd></div>
          </dl>
        </div>

        <div class="data-card panel">
          <h3><AppIcon name="heart" :size="16" /> พัฒนาการล่าสุด</h3>
          <GrowthTrendChart v-if="growthRecords.length" :records="growthRecords" field="weight_kg" color="var(--accent-green)" unit="กก." />
          <p v-else class="no-data">ยังไม่มีข้อมูลพัฒนาการ</p>
        </div>

        <div class="data-card panel">
          <h3><AppIcon name="shield" :size="16" /> ประกันที่คุ้มครองอยู่</h3>
          <ul v-if="activePolicies.length" class="mini-list">
            <li v-for="p in activePolicies" :key="p.id">
              <span class="mini-title">{{ p.provider }}</span>
              <span class="mini-sub">{{ policyTypeLabels[p.policy_type] || p.policy_type }} · {{ formatMoney(p.coverage_amount) }} บาท</span>
            </li>
          </ul>
          <p v-else class="no-data">ไม่มีกรมธรรม์ที่ใช้งานอยู่</p>
        </div>

        <div class="data-card panel">
          <h3><AppIcon name="gift" :size="16" /> สวัสดิการที่ใช้งานอยู่</h3>
          <ul v-if="activeBenefits.length" class="mini-list">
            <li v-for="b in activeBenefits" :key="b.id">
              <span class="mini-title">{{ b.benefit_name }}</span>
              <span class="mini-sub">{{ b.provider || '-' }} · {{ formatMoney(b.amount) }} บาท</span>
            </li>
          </ul>
          <p v-else class="no-data">ไม่มีสวัสดิการที่ใช้งานอยู่</p>
        </div>
      </div>

      <div v-else-if="activeTab === 'growth'" class="tab-panel">
        <div class="chart-row" v-if="growthRecords.length">
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
            <thead>
              <tr>
                <th>วันที่</th>
                <th>น้ำหนัก (กก.)</th>
                <th>ส่วนสูง (ซม.)</th>
                <th>บันทึกเพิ่มเติม</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in sortedGrowth" :key="r.id">
                <td>{{ r.record_date }}</td>
                <td>{{ r.weight_kg ?? '-' }}</td>
                <td>{{ r.height_cm ?? '-' }}</td>
                <td>{{ r.note || '-' }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="notice">ยังไม่มีบันทึกพัฒนาการสำหรับสมาชิกคนนี้</p>
        </div>
      </div>

      <div v-else-if="activeTab === 'insurance'" class="tab-panel">
        <div class="data-card">
          <table v-if="insurancePolicies.length" class="data-table">
            <thead>
              <tr>
                <th>บริษัทประกัน</th>
                <th>ประเภท</th>
                <th>เลขกรมธรรม์</th>
                <th>วงเงินคุ้มครอง</th>
                <th>วันหมดอายุ</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in insurancePolicies" :key="p.id">
                <td>{{ p.provider }}</td>
                <td>{{ policyTypeLabels[p.policy_type] || p.policy_type }}</td>
                <td>{{ p.policy_number || '-' }}</td>
                <td>{{ formatMoney(p.coverage_amount) }} บาท</td>
                <td>{{ p.end_date || '-' }}</td>
                <td><span class="pill" :class="statusPillClass(p.status)">{{ p.status }}</span></td>
              </tr>
            </tbody>
          </table>
          <p v-else class="notice">ยังไม่มีกรมธรรม์ประกันสำหรับสมาชิกคนนี้</p>
        </div>
      </div>

      <div v-else-if="activeTab === 'welfare'" class="tab-panel">
        <div class="data-card">
          <table v-if="welfareBenefits.length" class="data-table">
            <thead>
              <tr>
                <th>สวัสดิการ</th>
                <th>หน่วยงาน</th>
                <th>ประเภท</th>
                <th>จำนวนเงิน</th>
                <th>ใช้ได้ถึง</th>
                <th>สถานะ</th>
              </tr>
            </thead>
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
          <p v-else class="notice">ยังไม่มีสวัสดิการสำหรับสมาชิกคนนี้</p>
        </div>
      </div>
    </template>

    <p v-else-if="!loading" class="notice notice--error">ไม่พบข้อมูลสมาชิกคนนี้</p>
  </section>
</template>

<style scoped>
.top-actions {
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

.profile-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  padding: 24px;
  margin-bottom: 18px;
}

.avatar-xl {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: #1e3a5f;
  flex-shrink: 0;
}

.profile-main {
  flex: 1;
  min-width: 220px;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.name-row h2 {
  margin: 0;
  color: var(--text-on-dark);
  font-size: 20px;
  font-weight: 700;
}

.quick-facts {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  margin-top: 8px;
  color: var(--text-on-dark-soft);
  font-size: 13px;
}

.quick-facts span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.profile-quote {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--glass-bg-strong);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  color: var(--text-on-dark-soft);
  font-size: 12.5px;
  max-width: 280px;
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
  padding: 9px 16px;
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
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
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

.info-list {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-list > div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
}

.info-list dt {
  color: var(--text-on-dark-faint);
}

.info-list dd {
  margin: 0;
  color: var(--text-on-dark-soft);
  font-weight: 600;
  text-align: right;
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
</style>
