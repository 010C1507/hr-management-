<script setup>
import { computed, onMounted, ref } from 'vue'
import MascotCharacter from '../components/MascotCharacter.vue'
import StatProgressCard from '../components/StatProgressCard.vue'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import {
  familyMembers as mockMembers,
  growthRecords as mockRecords,
  insurancePolicies as mockPolicies,
  welfareBenefits as mockBenefits,
} from '../data/sample'

const members = ref([])
const records = ref([])
const policies = ref([])
const benefits = ref([])

const childCount = computed(() => members.value.filter((m) => m.relation === 'child').length)

const latestChildGrowth = computed(() => {
  const childIds = members.value.filter((m) => m.relation === 'child').map((m) => m.id)
  const childRecords = records.value.filter((r) => childIds.includes(r.member_id))
  return [...childRecords].sort((a, b) => new Date(b.record_date) - new Date(a.record_date))[0] || null
})

const latestChildName = computed(() => {
  if (!latestChildGrowth.value) return ''
  return members.value.find((m) => m.id === latestChildGrowth.value.member_id)?.full_name || ''
})

const activePolicies = computed(() => policies.value.filter((p) => p.status === 'active').length)
const activeBenefits = computed(() => benefits.value.filter((b) => b.status === 'active').length)

async function loadDashboard() {
  if (!isSupabaseConfigured) {
    members.value = mockMembers
    records.value = mockRecords
    policies.value = mockPolicies
    benefits.value = mockBenefits
    return
  }

  const [membersRes, recordsRes, policiesRes, benefitsRes] = await Promise.all([
    supabase.from('family_members').select('*'),
    supabase.from('growth_records').select('*'),
    supabase.from('insurance_policies').select('*'),
    supabase.from('welfare_benefits').select('*'),
  ])

  if (!membersRes.error) members.value = membersRes.data
  if (!recordsRes.error) records.value = recordsRes.data
  if (!policiesRes.error) policies.value = policiesRes.data
  if (!benefitsRes.error) benefits.value = benefitsRes.data
}

onMounted(loadDashboard)
</script>

<template>
  <section class="dashboard">
    <div class="grid">
      <div class="hero">
        <MascotCharacter />
        <h2>ยินดีต้อนรับสู่ Household Registry!</h2>
        <p>ติดตามสมาชิกครอบครัว พัฒนาการของลูก ประกัน และสวัสดิการทั้งหมดไว้ที่เดียว</p>
      </div>

      <div class="side">
        <StatProgressCard :value="members.length" label="สมาชิกในครอบครัว" percent="80" color="var(--accent-blue)" />
        <StatProgressCard :value="childCount" label="ลูกที่ติดตามพัฒนาการ" percent="60" color="var(--accent-green)" />
        <StatProgressCard :value="activePolicies" label="กรมธรรม์ที่คุ้มครองอยู่" percent="65" color="var(--accent-yellow)" />
        <StatProgressCard :value="activeBenefits" label="สวัสดิการที่ใช้งานอยู่" percent="55" color="var(--accent-orange)" />

        <p v-if="latestChildGrowth" class="latest-note">
          บันทึกล่าสุด: {{ latestChildName }} — {{ latestChildGrowth.weight_kg }} กก. / {{ latestChildGrowth.height_cm }} ซม. ({{ latestChildGrowth.record_date }})
        </p>

        <router-link to="/growth" class="cta">บันทึกพัฒนาการลูก</router-link>
      </div>
    </div>
  </section>
</template>

<style scoped>
.dashboard {
  height: 100%;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  align-items: center;
  min-height: 560px;
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 6px;
  padding: 20px;
}

.hero h2 {
  margin: 12px 0 0;
  color: var(--text-on-dark);
  font-size: 19px;
  font-weight: 600;
  max-width: 360px;
}

.hero p {
  margin: 0;
  color: var(--text-on-dark-soft);
  font-size: 13.5px;
  max-width: 320px;
}

.side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.latest-note {
  margin: 0;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--text-on-dark-soft);
  font-size: 12.5px;
}

.cta {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cta-bg);
  color: #fff;
  font-weight: 600;
  font-size: 15px;
  padding: 15px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
  transition: background 0.18s ease, transform 0.18s ease;
}

.cta:hover {
  background: var(--cta-bg-hover);
  transform: translateY(-1px);
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>
