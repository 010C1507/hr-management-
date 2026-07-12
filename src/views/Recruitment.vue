<script setup>
import { computed, onMounted, ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import AppIcon from '../components/AppIcon.vue'
import StatIconCard from '../components/StatIconCard.vue'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { PIPELINE, STATUS_META, mockCandidates } from '../data/recruitment'

const candidates = ref([])
const loading = ref(false)
const errorMessage = ref('')
const expandedId = ref(null)
const showForm = ref(false)
const saving = ref(false)

const searchQuery = ref('')
const statusFilter = ref('all')
const departmentFilter = ref('all')
const stageFilter = ref(null)

const form = ref({
  name: '',
  position: '',
  division: 'สายงานเทคโนโลยี',
  department: '',
  phone: '',
  email: '',
  expectedSalary: '',
})

const usingMockData = computed(() => !isSupabaseConfigured)

const statusTabs = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'in_progress', label: 'กำลังดำเนินการ' },
  { key: 'onboard', label: 'เข้างานแล้ว' },
  { key: 'failed', label: 'ไม่ผ่าน' },
  { key: 'withdrawn', label: 'ถอนตัว' },
]

function todayIso() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

function dayCount(start, end) {
  const s = new Date(start)
  s.setHours(0, 0, 0, 0)
  const e = end ? new Date(end) : new Date()
  e.setHours(0, 0, 0, 0)
  return Math.max(1, Math.round((e - s) / 86400000) + 1)
}

function stageMeta(key) {
  return PIPELINE.find((p) => p.key === key)
}

function pipelineIndex(key) {
  return PIPELINE.findIndex((p) => p.key === key)
}

function currentStageOf(c) {
  if (c.status === 'onboard') return null
  const last = c.stages[c.stages.length - 1]
  return last ? stageMeta(last.key) : PIPELINE[0]
}

function lastStageEntry(c) {
  return c.stages[c.stages.length - 1] || null
}

function totalDaysOf(c) {
  if (!c.stages.length) return 0
  const first = c.stages[0]
  const last = c.stages[c.stages.length - 1]
  return dayCount(first.start, last.end)
}

function isOverSla(c) {
  if (c.status !== 'in_progress') return false
  const last = lastStageEntry(c)
  if (!last || last.end) return false
  const meta = stageMeta(last.key)
  return dayCount(last.start, null) > meta.sla
}

function stageDays(stage) {
  return dayCount(stage.start, stage.end)
}

function stageOverSla(stage) {
  return stageDays(stage) > stageMeta(stage.key).sla
}

// จุดแสดงความคืบหน้าของแต่ละขั้นในแถวตาราง
function stageDotState(c, key) {
  const entry = c.stages.find((s) => s.key === key)
  if (entry && entry.result === 'ผ่าน') return 'done'
  if (entry && !entry.end && c.status === 'in_progress') return 'current'
  if (entry && (entry.result === 'ไม่ผ่าน' || entry.result === 'ถอนตัว')) return 'stopped'
  return 'pending'
}

const departments = computed(() => Array.from(new Set(candidates.value.map((c) => c.department))))

const filteredCandidates = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return candidates.value.filter((c) => {
    if (statusFilter.value !== 'all' && c.status !== statusFilter.value) return false
    if (departmentFilter.value !== 'all' && c.department !== departmentFilter.value) return false
    if (stageFilter.value) {
      const cur = currentStageOf(c)
      if (c.status !== 'in_progress' || !cur || cur.key !== stageFilter.value) return false
    }
    if (q && !(c.name.toLowerCase().includes(q) || c.position.toLowerCase().includes(q))) return false
    return true
  })
})

const stats = computed(() => {
  const all = candidates.value
  const onboarded = all.filter((c) => c.status === 'onboard')
  const avgDays = onboarded.length
    ? Math.round(onboarded.reduce((sum, c) => sum + totalDaysOf(c), 0) / onboarded.length)
    : 0
  return {
    total: all.length,
    inProgress: all.filter((c) => c.status === 'in_progress').length,
    onboard: onboarded.length,
    dropped: all.filter((c) => c.status === 'failed' || c.status === 'withdrawn').length,
    overSla: all.filter(isOverSla).length,
    avgDays,
  }
})

const funnel = computed(() =>
  PIPELINE.map((p) => ({
    ...p,
    count:
      p.key === 'onboard'
        ? candidates.value.filter((c) => c.status === 'onboard').length
        : candidates.value.filter((c) => {
            if (c.status !== 'in_progress') return false
            const cur = currentStageOf(c)
            return cur && cur.key === p.key
          }).length,
  }))
)

function toggleStageFilter(key) {
  stageFilter.value = stageFilter.value === key ? null : key
}

function toggleExpand(id) {
  expandedId.value = expandedId.value === id ? null : id
}

function formatDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' })
}

function formatSalary(n) {
  return n ? Number(n).toLocaleString('th-TH') : '-'
}

// ---------- โหลดข้อมูล ----------

function normalizeRow(row) {
  const stages = (row.candidate_stages || [])
    .map((s) => ({ key: s.stage_key, start: s.start_date, end: s.end_date, result: s.result }))
    .sort((a, b) => pipelineIndex(a.key) - pipelineIndex(b.key))
  return {
    id: row.id,
    name: row.full_name,
    phone: row.phone,
    email: row.email,
    position: row.position,
    division: row.division,
    department: row.department,
    status: row.status,
    expectedSalary: row.expected_salary,
    offeredSalary: row.offered_salary,
    remark: row.remark,
    stages,
  }
}

async function loadCandidates() {
  if (!isSupabaseConfigured) {
    candidates.value = JSON.parse(JSON.stringify(mockCandidates))
    return
  }
  loading.value = true
  errorMessage.value = ''
  const { data, error } = await supabase
    .from('candidates')
    .select('*, candidate_stages(*)')
    .order('created_at', { ascending: false })
  if (error) {
    errorMessage.value = 'โหลดข้อมูลผู้สมัครไม่สำเร็จ: ' + error.message
  } else {
    candidates.value = data.map(normalizeRow)
  }
  loading.value = false
}

// ---------- เพิ่มผู้สมัครใหม่ ----------

async function addCandidate() {
  if (!form.value.name || !form.value.position || !form.value.department) {
    errorMessage.value = 'กรุณากรอกชื่อ ตำแหน่ง และฝ่ายให้ครบ'
    return
  }
  errorMessage.value = ''

  if (!isSupabaseConfigured) {
    candidates.value.unshift({
      id: 'CAND-' + String(Date.now()).slice(-5),
      name: form.value.name,
      phone: form.value.phone,
      email: form.value.email,
      position: form.value.position,
      division: form.value.division,
      department: form.value.department,
      status: 'in_progress',
      expectedSalary: form.value.expectedSalary || null,
      offeredSalary: null,
      remark: '',
      stages: [{ key: 'request', start: todayIso(), end: null, result: 'รอดำเนินการ' }],
    })
    resetForm()
    return
  }

  saving.value = true
  const { data, error } = await supabase
    .from('candidates')
    .insert({
      full_name: form.value.name,
      phone: form.value.phone || null,
      email: form.value.email || null,
      position: form.value.position,
      division: form.value.division,
      department: form.value.department,
      expected_salary: form.value.expectedSalary || null,
    })
    .select()
    .single()

  if (error) {
    saving.value = false
    errorMessage.value = 'เพิ่มผู้สมัครไม่สำเร็จ: ' + error.message
    return
  }

  const { error: stageError } = await supabase.from('candidate_stages').insert({
    candidate_id: data.id,
    stage_key: 'request',
    start_date: todayIso(),
    result: 'รอดำเนินการ',
  })
  saving.value = false
  if (stageError) {
    errorMessage.value = 'สร้างขั้นตอนแรกไม่สำเร็จ: ' + stageError.message
    return
  }
  resetForm()
  await loadCandidates()
}

function resetForm() {
  form.value = {
    name: '',
    position: '',
    division: 'สายงานเทคโนโลยี',
    department: '',
    phone: '',
    email: '',
    expectedSalary: '',
  }
  showForm.value = false
}

// ---------- เลื่อนขั้นตอน / ยุติ ----------

async function advanceStage(c) {
  const last = lastStageEntry(c)
  if (!last || c.status !== 'in_progress') return
  const idx = pipelineIndex(last.key)
  const isLast = idx === PIPELINE.length - 1
  const today = todayIso()

  if (!isSupabaseConfigured) {
    last.end = today
    last.result = 'ผ่าน'
    if (isLast) {
      c.status = 'onboard'
    } else {
      c.stages.push({ key: PIPELINE[idx + 1].key, start: today, end: null, result: 'รอดำเนินการ' })
    }
    return
  }

  errorMessage.value = ''
  const { error: updError } = await supabase
    .from('candidate_stages')
    .update({ end_date: today, result: 'ผ่าน' })
    .eq('candidate_id', c.id)
    .eq('stage_key', last.key)
  if (updError) {
    errorMessage.value = 'บันทึกขั้นตอนไม่สำเร็จ: ' + updError.message
    return
  }
  if (isLast) {
    await supabase.from('candidates').update({ status: 'onboard' }).eq('id', c.id)
  } else {
    await supabase.from('candidate_stages').insert({
      candidate_id: c.id,
      stage_key: PIPELINE[idx + 1].key,
      start_date: today,
      result: 'รอดำเนินการ',
    })
  }
  await loadCandidates()
}

async function stopCandidate(c, result) {
  const last = lastStageEntry(c)
  if (!last || c.status !== 'in_progress') return
  const today = todayIso()
  const status = result === 'ถอนตัว' ? 'withdrawn' : 'failed'

  if (!isSupabaseConfigured) {
    last.end = today
    last.result = result
    c.status = status
    return
  }

  errorMessage.value = ''
  const { error: updError } = await supabase
    .from('candidate_stages')
    .update({ end_date: today, result })
    .eq('candidate_id', c.id)
    .eq('stage_key', last.key)
  if (updError) {
    errorMessage.value = 'บันทึกไม่สำเร็จ: ' + updError.message
    return
  }
  await supabase.from('candidates').update({ status }).eq('id', c.id)
  await loadCandidates()
}

onMounted(loadCandidates)
</script>

<template>
  <section>
    <PageHeader title="ติดตามการสรรหาบุคลากร" subtitle="Tracking ผู้สมัครแต่ละคนตามขั้นตอนการสรรหา พร้อมระยะเวลาและ SLA">
      <template #actions>
        <button class="btn-ghost" type="button" @click="loadCandidates">รีเฟรช</button>
        <button class="btn-primary" type="button" @click="showForm = !showForm">
          <AppIcon name="plus" :size="16" /> เพิ่มผู้สมัคร
        </button>
      </template>
    </PageHeader>

    <p v-if="usingMockData" class="notice">
      โหมดตัวอย่าง (mock data) — การเพิ่ม/เลื่อนขั้นตอนทำได้จริงแต่จะไม่ถูกบันทึกถาวรจนกว่าจะเชื่อมต่อ Supabase (ดู README)
    </p>
    <p v-if="errorMessage" class="notice notice--error">{{ errorMessage }}</p>

    <form v-if="showForm" class="data-card add-form" @submit.prevent="addCandidate">
      <div class="field">
        <label>ชื่อ-นามสกุลผู้สมัคร *</label>
        <input v-model="form.name" type="text" placeholder="ชื่อ นามสกุล" />
      </div>
      <div class="field">
        <label>ตำแหน่ง *</label>
        <input v-model="form.position" type="text" placeholder="Data Engineer" />
      </div>
      <div class="field">
        <label>สายงาน</label>
        <input v-model="form.division" type="text" />
      </div>
      <div class="field">
        <label>ฝ่าย *</label>
        <input v-model="form.department" type="text" placeholder="ฝ่าย..." />
      </div>
      <div class="field">
        <label>เบอร์โทร</label>
        <input v-model="form.phone" type="text" placeholder="08x-xxx-xxxx" />
      </div>
      <div class="field">
        <label>อีเมล</label>
        <input v-model="form.email" type="email" placeholder="name@example.com" />
      </div>
      <div class="field">
        <label>เงินเดือนที่คาดหวัง</label>
        <input v-model="form.expectedSalary" type="number" placeholder="50000" />
      </div>
      <button class="btn-primary" type="submit" :disabled="saving">
        {{ saving ? 'กำลังบันทึก...' : 'บันทึก' }}
      </button>
    </form>

    <div class="stat-row">
      <StatIconCard icon="users" :value="stats.total" label="ผู้สมัครทั้งหมด" color="var(--accent-blue)" />
      <StatIconCard icon="hourglass" :value="stats.inProgress" label="กำลังดำเนินการ" color="var(--accent-yellow)" />
      <StatIconCard icon="check" :value="stats.onboard" label="เข้างานแล้ว" color="var(--accent-green)" />
      <StatIconCard icon="close" :value="stats.dropped" label="ไม่ผ่าน/ถอนตัว" color="var(--accent-orange)" />
      <StatIconCard icon="clock" :value="stats.overSla + ' คน'" label="เกิน SLA ขณะนี้" color="#ff8f8f" />
      <StatIconCard icon="chart" :value="stats.avgDays + ' วัน'" label="เวลาสรรหาเฉลี่ย (Time to Hire)" color="var(--accent-purple)" />
    </div>

    <!-- Funnel รายขั้นตอน: กดเพื่อกรองผู้สมัครที่ค้างอยู่ขั้นนั้น -->
    <div class="funnel">
      <button
        v-for="(stage, i) in funnel"
        :key="stage.key"
        type="button"
        class="funnel-step"
        :class="{ active: stageFilter === stage.key }"
        @click="toggleStageFilter(stage.key)"
      >
        <span class="funnel-count" :style="{ background: stage.color }">{{ stage.count }}</span>
        <span class="funnel-label">{{ stage.label }}</span>
        <AppIcon v-if="i < funnel.length - 1" name="chevronRight" :size="14" class="funnel-arrow" />
      </button>
    </div>

    <div class="toolbar">
      <div class="search">
        <AppIcon name="search" :size="16" />
        <input v-model="searchQuery" type="text" placeholder="ค้นหาชื่อหรือตำแหน่ง..." />
      </div>
      <div class="status-tabs">
        <button
          v-for="tab in statusTabs"
          :key="tab.key"
          type="button"
          class="tab"
          :class="{ active: statusFilter === tab.key }"
          @click="statusFilter = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
      <select v-model="departmentFilter" class="dept-select">
        <option value="all">ทุกฝ่าย</option>
        <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
      </select>
    </div>

    <div class="data-card">
      <p v-if="loading" class="empty">กำลังโหลดข้อมูล...</p>
      <template v-else>
        <div v-for="c in filteredCandidates" :key="c.id" class="cand-row" :class="{ open: expandedId === c.id }">
          <button type="button" class="cand-summary" @click="toggleExpand(c.id)">
            <div class="cand-who">
              <div class="cand-name">{{ c.name }}</div>
              <div class="cand-role">{{ c.position }} · {{ c.department }}</div>
            </div>

            <div class="cand-progress">
              <span
                v-for="p in PIPELINE"
                :key="p.key"
                class="dot"
                :class="stageDotState(c, p.key)"
                :style="stageDotState(c, p.key) === 'done' ? { background: p.color } : {}"
                :title="p.label"
              />
            </div>

            <div class="cand-stage">
              <template v-if="c.status === 'in_progress'">
                {{ currentStageOf(c)?.label }}
                <span v-if="isOverSla(c)" class="sla-badge">เกิน SLA</span>
              </template>
              <template v-else>-</template>
            </div>

            <div class="cand-days">{{ totalDaysOf(c) }} วัน</div>

            <span class="pill" :class="STATUS_META[c.status].pillClass">{{ STATUS_META[c.status].label }}</span>

            <AppIcon name="chevronRight" :size="16" class="chevron" :class="{ down: expandedId === c.id }" />
          </button>

          <div v-if="expandedId === c.id" class="cand-detail">
            <div class="detail-meta">
              <span><AppIcon name="phone" :size="13" /> {{ c.phone || '-' }}</span>
              <span><AppIcon name="mail" :size="13" /> {{ c.email || '-' }}</span>
              <span>คาดหวัง: {{ formatSalary(c.expectedSalary) }} บ.</span>
              <span>เสนอ: {{ formatSalary(c.offeredSalary) }} บ.</span>
            </div>
            <p v-if="c.remark" class="detail-remark">หมายเหตุ: {{ c.remark }}</p>

            <!-- แถบสัดส่วนเวลาแต่ละขั้น -->
            <div class="duration-bar">
              <div
                v-for="stage in c.stages"
                :key="stage.key"
                class="duration-seg"
                :style="{ flex: stageDays(stage), background: stageMeta(stage.key).color }"
                :title="stageMeta(stage.key).label + ' ' + stageDays(stage) + ' วัน'"
              >
                {{ stageDays(stage) }}
              </div>
            </div>

            <table class="stage-table">
              <thead>
                <tr>
                  <th>ขั้นตอน</th>
                  <th>เริ่ม</th>
                  <th>เสร็จ</th>
                  <th>ใช้เวลา</th>
                  <th>SLA</th>
                  <th>ผล</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="stage in c.stages" :key="stage.key">
                  <td>
                    <span class="stage-chip" :style="{ background: stageMeta(stage.key).color }" />
                    {{ stageMeta(stage.key).label }}
                  </td>
                  <td>{{ formatDate(stage.start) }}</td>
                  <td>{{ formatDate(stage.end) }}</td>
                  <td :class="{ over: stageOverSla(stage) }">
                    {{ stageDays(stage) }} วัน
                    <span v-if="!stage.end">(กำลังนับ)</span>
                  </td>
                  <td>{{ stageMeta(stage.key).sla }} วัน</td>
                  <td>{{ stage.result }}</td>
                </tr>
              </tbody>
            </table>

            <div v-if="c.status === 'in_progress'" class="detail-actions">
              <button class="btn-primary" type="button" @click="advanceStage(c)">
                <AppIcon name="check" :size="15" />
                ผ่านขั้นตอนนี้{{ lastStageEntry(c) && pipelineIndex(lastStageEntry(c).key) < PIPELINE.length - 1 ? ' → ' + PIPELINE[pipelineIndex(lastStageEntry(c).key) + 1].label : ' (จบกระบวนการ)' }}
              </button>
              <button class="btn-ghost" type="button" @click="stopCandidate(c, 'ไม่ผ่าน')">ไม่ผ่าน</button>
              <button class="btn-ghost" type="button" @click="stopCandidate(c, 'ถอนตัว')">ผู้สมัครถอนตัว</button>
            </div>
          </div>
        </div>

        <p v-if="!filteredCandidates.length" class="empty">ไม่พบผู้สมัครที่ตรงกับเงื่อนไข</p>
      </template>
    </div>
  </section>
</template>

<style scoped>
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
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
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
  color: var(--text-on-dark-soft);
  font-weight: 600;
}

.field input {
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

.stat-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.funnel {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 16px;
}

.funnel-step {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  color: var(--text-on-dark);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s ease;
}

.funnel-step:hover {
  background: rgba(255, 255, 255, 0.22);
}

.funnel-step.active {
  background: var(--cta-bg);
  border-color: transparent;
}

.funnel-count {
  min-width: 24px;
  height: 24px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #22264a;
  font-weight: 700;
  padding: 0 6px;
}

.funnel-arrow {
  opacity: 0.5;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  padding: 9px 14px;
  color: var(--text-on-dark-soft);
  flex: 1;
  min-width: 200px;
}

.search input {
  border: none;
  background: transparent;
  outline: none;
  color: var(--text-on-dark);
  font-size: 13.5px;
  width: 100%;
}

.search input::placeholder {
  color: var(--text-on-dark-faint);
}

.status-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tab {
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-on-dark-soft);
  font-size: 12.5px;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease;
}

.tab:hover {
  background: rgba(255, 255, 255, 0.2);
}

.tab.active {
  background: var(--cta-bg);
  color: #fff;
  border-color: transparent;
}

.dept-select {
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  padding: 9px 12px;
  color: var(--text-on-dark);
  font-size: 13px;
  max-width: 280px;
}

.dept-select option {
  color: #2c2a4a;
}

/* ---------- แถวผู้สมัคร ---------- */

.cand-row {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.cand-row:last-child {
  border-bottom: none;
}

.cand-summary {
  display: grid;
  grid-template-columns: minmax(220px, 1.4fr) auto minmax(150px, 1fr) 80px auto 24px;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 14px 18px;
  background: transparent;
  border: none;
  color: var(--text-on-dark);
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease;
}

.cand-summary:hover {
  background: rgba(255, 255, 255, 0.07);
}

.cand-name {
  font-weight: 600;
  font-size: 14px;
}

.cand-role {
  font-size: 11.5px;
  color: var(--text-on-dark-soft);
  margin-top: 2px;
}

.cand-progress {
  display: flex;
  gap: 5px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
}

.dot.current {
  background: #fff;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.25);
}

.dot.stopped {
  background: var(--accent-orange);
}

.cand-stage {
  font-size: 12.5px;
  color: var(--text-on-dark-soft);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.sla-badge {
  background: rgba(255, 107, 107, 0.9);
  color: #fff;
  font-size: 10.5px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
}

.cand-days {
  font-size: 12.5px;
  color: var(--text-on-dark-soft);
  white-space: nowrap;
}

.chevron {
  transition: transform 0.18s ease;
  color: var(--text-on-dark-soft);
}

.chevron.down {
  transform: rotate(90deg);
}

/* ---------- รายละเอียด ---------- */

.cand-detail {
  padding: 4px 18px 18px;
  background: rgba(255, 255, 255, 0.05);
}

.detail-meta {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  font-size: 12.5px;
  color: var(--text-on-dark-soft);
  margin-bottom: 8px;
}

.detail-meta span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.detail-remark {
  margin: 0 0 12px;
  font-size: 12.5px;
  color: var(--text-on-dark-soft);
}

.duration-bar {
  display: flex;
  height: 22px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
  gap: 2px;
}

.duration-seg {
  min-width: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10.5px;
  font-weight: 700;
  color: #22264a;
}

.stage-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 14px;
}

.stage-table th {
  text-align: left;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-on-dark-soft);
  font-weight: 700;
  padding: 8px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.16);
}

.stage-table td {
  padding: 8px 10px;
  font-size: 12.5px;
  color: var(--text-on-dark);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.stage-table td.over {
  color: #ffb3b3;
  font-weight: 700;
}

.stage-chip {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 3px;
  margin-right: 7px;
}

.detail-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.empty {
  padding: 24px;
  text-align: center;
  color: var(--text-on-dark-soft);
  font-size: 13px;
}

@media (max-width: 900px) {
  .cand-summary {
    grid-template-columns: 1fr auto 24px;
  }
  .cand-progress,
  .cand-days {
    display: none;
  }
  .cand-stage {
    display: none;
  }
}
</style>
