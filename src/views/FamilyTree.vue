<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import AppIcon from '../components/AppIcon.vue'
import TreeNode from '../components/TreeNode.vue'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { familyMembers as mockMembers } from '../data/sample'
import { buildFamilyGraph, generationName, orderRow, relationFrom } from '../utils/kinship'

const router = useRouter()
const members = ref([])
const loading = ref(false)
const errorMessage = ref('')
const viewpointId = ref('')
const usingMockData = computed(() => !isSupabaseConfigured)

const treeRef = ref(null)
const nodeEls = new Map()
const paths = ref([])
const svgSize = ref({ w: 0, h: 0 })

function registerNode(id, el) {
  if (el) nodeEls.set(id, el)
  else nodeEls.delete(id)
}

const graph = computed(() => buildFamilyGraph(members.value))
const placedMembers = computed(() => members.value.filter((m) => graph.value.generation.has(m.id)))
const unplacedMembers = computed(() => members.value.filter((m) => !graph.value.generation.has(m.id)))

const viewpoint = computed(
  () => members.value.find((m) => m.id === viewpointId.value) || placedMembers.value[0] || null
)
const viewpointGeneration = computed(() =>
  viewpoint.value ? graph.value.generation.get(viewpoint.value.id) ?? 0 : 0
)

const rows = computed(() => {
  const buckets = new Map()
  for (const member of placedMembers.value) {
    const gen = graph.value.generation.get(member.id)
    if (!buckets.has(gen)) buckets.set(gen, [])
    buckets.get(gen).push(member)
  }
  return [...buckets.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([gen, list]) => ({
      generation: gen,
      offset: gen - viewpointGeneration.value,
      label: generationName(gen - viewpointGeneration.value),
      members: orderRow(graph.value, list),
    }))
})

const maxRowCount = computed(() => Math.max(1, ...rows.value.map((r) => r.members.length)))

const relationOf = (member) =>
  viewpoint.value ? relationFrom(graph.value, viewpoint.value.id, member.id) : ''

const siblingCount = computed(() => {
  if (!viewpoint.value) return 0
  return placedMembers.value.filter((m) => {
    const label = relationOf(m)
    return ['พี่ชาย', 'พี่สาว', 'น้องชาย', 'น้องสาว', 'พี่', 'น้อง', 'พี่น้อง'].includes(label)
  }).length
})

const childCount = computed(() => {
  if (!viewpoint.value) return 0
  return (graph.value.children.get(viewpoint.value.id) || new Set()).size
})

function rect(id) {
  const el = nodeEls.get(id)
  if (!el || !treeRef.value) return null
  const r = el.getBoundingClientRect()
  const c = treeRef.value.getBoundingClientRect()
  const left = r.left - c.left + treeRef.value.scrollLeft
  const top = r.top - c.top + treeRef.value.scrollTop
  return { left, right: left + r.width, top, bottom: top + r.height, cx: left + r.width / 2, cy: top + r.height / 2 }
}

function drawLines() {
  if (!treeRef.value) return
  const out = []
  const g = graph.value

  // เส้นคู่สมรส + จุดยึดสำหรับลากลงไปหาลูก
  const coupleAnchors = new Map()
  const seenPairs = new Set()
  for (const member of placedMembers.value) {
    const partnerId = g.spouse.get(member.id)
    if (!partnerId) continue
    const key = [member.id, partnerId].sort().join('|')
    if (seenPairs.has(key)) continue
    seenPairs.add(key)
    const a = rect(member.id)
    const b = rect(partnerId)
    if (!a || !b) continue
    const [left, right] = a.cx <= b.cx ? [a, b] : [b, a]
    out.push(`M${left.right} ${left.cy} H${right.left}`)
    coupleAnchors.set(key, { x: (left.right + right.left) / 2, y: Math.max(left.bottom, right.bottom) })
  }

  // จัดกลุ่มลูกตามคู่พ่อแม่ แล้วลากเส้นลงมา
  const childGroups = new Map()
  for (const member of placedMembers.value) {
    const parentIds = [...(g.parents.get(member.id) || [])].sort()
    if (!parentIds.length) continue
    const key = parentIds.join('|')
    if (!childGroups.has(key)) childGroups.set(key, { parentIds, kids: [] })
    childGroups.get(key).kids.push(member.id)
  }

  for (const { parentIds, kids } of childGroups.values()) {
    const parentRects = parentIds.map(rect).filter(Boolean)
    const kidRects = kids.map(rect).filter(Boolean)
    if (!parentRects.length || !kidRects.length) continue

    const anchor =
      coupleAnchors.get(parentIds.join('|')) ||
      (parentRects.length > 1
        ? {
            x: (Math.min(...parentRects.map((p) => p.cx)) + Math.max(...parentRects.map((p) => p.cx))) / 2,
            y: Math.max(...parentRects.map((p) => p.bottom)),
          }
        : { x: parentRects[0].cx, y: parentRects[0].bottom })

    const topMost = Math.min(...kidRects.map((k) => k.top))
    if (topMost <= anchor.y) continue
    const busY = anchor.y + (topMost - anchor.y) / 2
    out.push(`M${anchor.x} ${anchor.y} V${busY}`)
    const xs = [anchor.x, ...kidRects.map((k) => k.cx)]
    out.push(`M${Math.min(...xs)} ${busY} H${Math.max(...xs)}`)
    for (const k of kidRects) out.push(`M${k.cx} ${busY} V${k.top}`)
  }

  paths.value = out
  svgSize.value = { w: treeRef.value.scrollWidth, h: treeRef.value.scrollHeight }
}

let resizeObserver = null

async function loadMembers() {
  errorMessage.value = ''
  if (!isSupabaseConfigured) {
    members.value = mockMembers
  } else {
    loading.value = true
    const { data, error } = await supabase.from('family_members').select('*')
    if (error) errorMessage.value = 'โหลดข้อมูลสมาชิกไม่สำเร็จ: ' + error.message
    else members.value = data
    loading.value = false
  }
  if (!members.value.some((m) => m.id === viewpointId.value)) {
    viewpointId.value = (members.value.find((m) => m.relation === 'self') || members.value[0])?.id || ''
  }
}

watch([members, viewpointId], async () => {
  await nextTick()
  drawLines()
})

onMounted(async () => {
  await loadMembers()
  await nextTick()
  drawLines()
  resizeObserver = new ResizeObserver(() => drawLines())
  if (treeRef.value) resizeObserver.observe(treeRef.value)
  window.addEventListener('resize', drawLines)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('resize', drawLines)
})

function focusOn(member) {
  viewpointId.value = member.id
}

function openProfile(member) {
  router.push(`/members/${member.id}`)
}

function resetViewpoint() {
  const self = members.value.find((m) => m.relation === 'self')
  if (self) viewpointId.value = self.id
}
</script>

<template>
  <section>
    <PageHeader title="ผังครอบครัว" subtitle="ความเชื่อมโยงของสมาชิก — เลือกได้ว่าจะมองจากมุมมองของใคร">
      <template #actions>
        <button class="btn-ghost" type="button" @click="loadMembers"><AppIcon name="filter" :size="16" /> รีเฟรช</button>
        <router-link to="/members" class="btn-primary"><AppIcon name="plus" :size="16" /> เพิ่มสมาชิก</router-link>
      </template>
    </PageHeader>

    <p v-if="usingMockData" class="notice">กำลังแสดงข้อมูลตัวอย่าง (mock) — ยังไม่ได้เชื่อมต่อ Supabase ดูวิธีตั้งค่าใน README</p>
    <p v-if="errorMessage" class="notice notice--error">{{ errorMessage }}</p>

    <div v-if="viewpoint" class="data-card viewpoint-bar">
      <div class="viewpoint-label">
        <AppIcon name="search" :size="16" />
        <span>มองจากมุมมองของ</span>
      </div>
      <select v-model="viewpointId" class="viewpoint-select">
        <option v-for="m in placedMembers" :key="m.id" :value="m.id">{{ m.full_name }}</option>
      </select>
      <p class="viewpoint-hint">
        คำเรียกญาติทั้งผังจะเปลี่ยนตามคนที่เลือก — คลิกการ์ดใบไหนก็ได้เพื่อสลับไปมองจากคนนั้น
      </p>
      <button
        v-if="viewpoint.relation !== 'self'"
        class="btn-ghost"
        type="button"
        @click="resetViewpoint"
      >
        <AppIcon name="close" :size="15" /> กลับมามองจากตัวคุณ
      </button>
    </div>

    <div class="tree-layout">
      <div class="data-card tree-card">
        <p v-if="loading" class="notice">กำลังโหลดข้อมูล...</p>
        <div v-else ref="treeRef" class="tree">
          <svg class="tree-lines" :width="svgSize.w" :height="svgSize.h" aria-hidden="true">
            <path v-for="(d, i) in paths" :key="i" :d="d" />
          </svg>

          <div v-for="row in rows" :key="row.generation" class="gen-row">
            <span class="gen-label">{{ row.label }}</span>
            <div class="gen-nodes">
              <div v-for="m in row.members" :key="m.id" :ref="(el) => registerNode(m.id, el)">
                <TreeNode
                  :member="m"
                  :relation-label="relationOf(m)"
                  :highlight="m.id === viewpoint.id"
                  @focus="focusOn(m)"
                  @view="openProfile(m)"
                />
              </div>
            </div>
          </div>

          <p v-if="!rows.length" class="no-data">ยังไม่มีสมาชิกที่ระบุความสัมพันธ์ไว้</p>
        </div>
      </div>

      <aside class="side-col">
        <div v-if="viewpoint" class="data-card panel viewpoint-card">
          <h3>มุมมองปัจจุบัน</h3>
          <div class="viewpoint-person">
            <img v-if="viewpoint.photo_url" :src="viewpoint.photo_url" :alt="viewpoint.full_name" />
            <div>
              <strong>{{ viewpoint.full_name }}</strong>
              <span>{{ viewpoint.relation === 'self' ? 'ตัวคุณ' : 'ผังนี้แสดงคำเรียกญาติจากมุมมองของคนนี้' }}</span>
            </div>
          </div>
          <button class="btn-ghost full" type="button" @click="openProfile(viewpoint)">
            <AppIcon name="chevronRight" :size="15" /> เปิดโปรไฟล์
          </button>
        </div>

        <div class="data-card panel">
          <h3>จำนวนสมาชิกตามรุ่น</h3>
          <div v-for="row in rows" :key="row.generation" class="gen-stat">
            <span class="gen-stat-label">{{ row.label }}</span>
            <span class="gen-bar">
              <span
                class="gen-bar-fill"
                :style="{ width: (row.members.length / maxRowCount) * 100 + '%', background: row.offset === 0 ? 'var(--accent-blue)' : row.offset < 0 ? 'var(--accent-purple)' : 'var(--accent-green)' }"
              />
            </span>
            <span class="gen-stat-count">{{ row.members.length }}</span>
          </div>
        </div>

        <div class="data-card panel">
          <h3>สรุปจากมุมมองนี้</h3>
          <div class="summary-grid">
            <div class="summary-tile"><strong>{{ members.length }}</strong><span>สมาชิกทั้งหมด</span></div>
            <div class="summary-tile"><strong>{{ rows.length }}</strong><span>รุ่น</span></div>
            <div class="summary-tile"><strong>{{ siblingCount }}</strong><span>พี่น้อง</span></div>
            <div class="summary-tile"><strong>{{ childCount }}</strong><span>ลูก</span></div>
          </div>
        </div>
      </aside>
    </div>

    <div v-if="unplacedMembers.length" class="data-card panel others">
      <h3>สมาชิกที่ยังไม่อยู่ในผัง</h3>
      <div class="others-list">
        <div v-for="m in unplacedMembers" :key="m.id">
          <TreeNode :member="m" relation-label="ยังไม่ระบุ" @focus="openProfile(m)" @view="openProfile(m)" />
        </div>
      </div>
      <p class="hint">เปลี่ยนความสัมพันธ์ในหน้าโปรไฟล์ (เช่น พี่น้อง, ลูก) เพื่อให้แสดงในผัง</p>
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

.viewpoint-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  padding: 14px 18px;
  margin-bottom: 16px;
}

.viewpoint-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-on-dark);
}

.viewpoint-select {
  padding: 9px 12px;
  min-width: 220px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  background: var(--surface-bg);
  color: var(--text-primary);
  font-size: 13.5px;
  font-weight: 600;
  font-family: inherit;
}

.viewpoint-hint {
  flex: 1;
  min-width: 200px;
  margin: 0;
  font-size: 12.5px;
  color: var(--text-on-dark-faint);
}

.tree-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 16px;
  align-items: start;
}

@media (max-width: 1100px) {
  .tree-layout {
    grid-template-columns: 1fr;
  }
}

.tree-card {
  padding: 20px 20px 28px;
  overflow-x: auto;
}

.tree {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 56px;
  min-width: max-content;
}

.tree-lines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: visible;
}

.tree-lines path {
  fill: none;
  stroke: #9db4d8;
  stroke-width: 2;
  stroke-linecap: round;
}

.gen-row {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
}

.gen-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-on-dark-faint);
  letter-spacing: 0.02em;
}

.gen-nodes {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
}

.side-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.panel {
  padding: 18px 20px;
}

.panel h3 {
  margin: 0 0 14px;
  font-size: 14px;
  color: var(--text-on-dark);
}

.viewpoint-person {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.viewpoint-person img {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--surface-bg);
}

.viewpoint-person strong {
  display: block;
  font-size: 14px;
  color: var(--text-on-dark);
}

.viewpoint-person span {
  font-size: 11.5px;
  color: var(--text-on-dark-faint);
  line-height: 1.4;
}

.btn-ghost.full {
  width: 100%;
  justify-content: center;
}

.gen-stat {
  display: grid;
  grid-template-columns: 96px 1fr 28px;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  font-size: 12.5px;
}

.gen-stat-label {
  color: var(--text-on-dark-soft);
}

.gen-bar {
  height: 8px;
  border-radius: 999px;
  background: #e6edf8;
  overflow: hidden;
}

.gen-bar-fill {
  display: block;
  height: 100%;
  border-radius: 999px;
}

.gen-stat-count {
  font-weight: 700;
  color: var(--text-on-dark);
  text-align: right;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.summary-tile {
  background: var(--surface-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.summary-tile strong {
  font-size: 22px;
  color: #1a3f7a;
}

.summary-tile span {
  font-size: 11.5px;
  color: var(--text-on-dark-faint);
}

.others {
  margin-top: 16px;
}

.others-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.hint {
  margin: 12px 0 0;
  font-size: 12px;
  color: var(--text-on-dark-faint);
}

.no-data {
  margin: 0;
  color: var(--text-on-dark-faint);
  font-size: 13px;
}
</style>
