<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import AppIcon from '../components/AppIcon.vue'
import TreeNode from '../components/TreeNode.vue'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { familyMembers as mockMembers, relationLabels } from '../data/sample'

const router = useRouter()
const members = ref([])
const loading = ref(false)
const errorMessage = ref('')
const usingMockData = computed(() => !isSupabaseConfigured)

const treeRef = ref(null)
const nodeEls = new Map()
const paths = ref([])
const svgSize = ref({ w: 0, h: 0 })

function registerNode(id, el) {
  if (el) nodeEls.set(id, el)
  else nodeEls.delete(id)
}

const byBirth = (a, b) => new Date(a.birth_date || '2100-01-01') - new Date(b.birth_date || '2100-01-01')
const pick = (...rels) => members.value.filter((m) => rels.includes(m.relation)).sort(byBirth)

const self = computed(() => pick('self')[0] || null)
const spouse = computed(() => pick('spouse')[0] || null)
const father = computed(() => pick('father')[0] || null)
const mother = computed(() => pick('mother')[0] || null)
const paternalGrandparents = computed(() => pick('grandfather_paternal', 'grandmother_paternal'))
const maternalGrandparents = computed(() => pick('grandfather_maternal', 'grandmother_maternal'))
const siblings = computed(() => pick('sibling'))
const children = computed(() => pick('child'))
const others = computed(() => pick('other'))

const parents = computed(() => [father.value, mother.value].filter(Boolean))
const selfRow = computed(() => [...siblings.value, self.value, spouse.value].filter(Boolean))

const generations = computed(() => [
  { key: 'grand', label: 'รุ่นปู่ย่าตายาย', count: paternalGrandparents.value.length + maternalGrandparents.value.length, color: 'var(--accent-purple)' },
  { key: 'parents', label: 'รุ่นพ่อแม่', count: parents.value.length, color: 'var(--accent-yellow)' },
  { key: 'self', label: 'รุ่นของคุณ', count: selfRow.value.length, color: 'var(--accent-blue)' },
  { key: 'children', label: 'รุ่นลูก', count: children.value.length, color: 'var(--accent-green)' },
])
const maxGeneration = computed(() => Math.max(1, ...generations.value.map((g) => g.count)))
const generationCount = computed(() => generations.value.filter((g) => g.count > 0).length)

function rect(member) {
  const el = member && nodeEls.get(member.id)
  if (!el || !treeRef.value) return null
  const r = el.getBoundingClientRect()
  const c = treeRef.value.getBoundingClientRect()
  return {
    left: r.left - c.left + treeRef.value.scrollLeft,
    right: r.right - c.left + treeRef.value.scrollLeft,
    top: r.top - c.top + treeRef.value.scrollTop,
    bottom: r.bottom - c.top + treeRef.value.scrollTop,
    cx: r.left - c.left + treeRef.value.scrollLeft + r.width / 2,
    cy: r.top - c.top + treeRef.value.scrollTop + r.height / 2,
  }
}

// วาดเส้นเชื่อมคู่สมรส แล้วคืนจุดที่เส้นลงไปหาลูกจะเริ่ม
function coupleAnchor(couple, out) {
  const rects = couple.map(rect).filter(Boolean).sort((a, b) => a.cx - b.cx)
  if (!rects.length) return null
  if (rects.length === 1) return { x: rects[0].cx, y: rects[0].bottom }
  const [a, b] = rects
  out.push(`M${a.right} ${a.cy} H${b.left}`)
  const x = (a.right + b.left) / 2
  out.push(`M${x} ${a.cy} V${Math.max(a.bottom, b.bottom)}`)
  return { x, y: Math.max(a.bottom, b.bottom) }
}

function connect(couple, kids, out) {
  const anchor = coupleAnchor(couple, out)
  const kidRects = kids.map(rect).filter(Boolean)
  if (!anchor || !kidRects.length) return
  const topMost = Math.min(...kidRects.map((k) => k.top))
  const busY = anchor.y + (topMost - anchor.y) / 2
  out.push(`M${anchor.x} ${anchor.y} V${busY}`)
  const xs = [anchor.x, ...kidRects.map((k) => k.cx)]
  out.push(`M${Math.min(...xs)} ${busY} H${Math.max(...xs)}`)
  for (const k of kidRects) out.push(`M${k.cx} ${busY} V${k.top}`)
}

function drawLines() {
  if (!treeRef.value) return
  const out = []
  connect(paternalGrandparents.value, [father.value].filter(Boolean), out)
  connect(maternalGrandparents.value, [mother.value].filter(Boolean), out)
  connect(parents.value, [...siblings.value, self.value].filter(Boolean), out)
  connect([self.value, spouse.value].filter(Boolean), children.value, out)
  paths.value = out
  svgSize.value = { w: treeRef.value.scrollWidth, h: treeRef.value.scrollHeight }
}

let resizeObserver = null

async function loadMembers() {
  errorMessage.value = ''
  if (!isSupabaseConfigured) {
    members.value = mockMembers
    return
  }
  loading.value = true
  const { data, error } = await supabase.from('family_members').select('*')
  if (error) errorMessage.value = 'โหลดข้อมูลสมาชิกไม่สำเร็จ: ' + error.message
  else members.value = data
  loading.value = false
}

watch(members, async () => {
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

function open(member) {
  router.push(`/members/${member.id}`)
}
</script>

<template>
  <section>
    <PageHeader title="ผังครอบครัว" subtitle="ความเชื่อมโยงของสมาชิกในครอบครัวเมื่อมองจากตัวคุณ">
      <template #actions>
        <button class="btn-ghost" type="button" @click="loadMembers"><AppIcon name="filter" :size="16" /> รีเฟรช</button>
        <router-link to="/members" class="btn-primary"><AppIcon name="plus" :size="16" /> เพิ่มสมาชิก</router-link>
      </template>
    </PageHeader>

    <p v-if="usingMockData" class="notice">กำลังแสดงข้อมูลตัวอย่าง (mock) — ยังไม่ได้เชื่อมต่อ Supabase ดูวิธีตั้งค่าใน README</p>
    <p v-if="errorMessage" class="notice notice--error">{{ errorMessage }}</p>
    <p v-if="!loading && members.length && !self" class="notice">
      ยังไม่มีสมาชิกที่ระบุความสัมพันธ์เป็น "ตัวเอง" — เพิ่มตัวคุณในหน้าสมาชิกครอบครัวเพื่อให้ผังสมบูรณ์
    </p>

    <div class="tree-layout">
      <div class="data-card tree-card">
        <p v-if="loading" class="notice">กำลังโหลดข้อมูล...</p>
        <div v-else ref="treeRef" class="tree">
          <svg class="tree-lines" :width="svgSize.w" :height="svgSize.h" aria-hidden="true">
            <path v-for="(d, i) in paths" :key="i" :d="d" />
          </svg>

          <div v-if="paternalGrandparents.length || maternalGrandparents.length" class="gen-row">
            <span class="gen-label">รุ่นปู่ย่าตายาย</span>
            <div class="gen-nodes gen-nodes--split">
              <div class="couple">
                <div v-for="m in paternalGrandparents" :key="m.id" :ref="(el) => registerNode(m.id, el)">
                  <TreeNode :member="m" @click="open(m)" />
                </div>
              </div>
              <div class="couple">
                <div v-for="m in maternalGrandparents" :key="m.id" :ref="(el) => registerNode(m.id, el)">
                  <TreeNode :member="m" @click="open(m)" />
                </div>
              </div>
            </div>
          </div>

          <div v-if="parents.length" class="gen-row">
            <span class="gen-label">รุ่นพ่อแม่</span>
            <div class="gen-nodes">
              <div class="couple">
                <div v-for="m in parents" :key="m.id" :ref="(el) => registerNode(m.id, el)">
                  <TreeNode :member="m" @click="open(m)" />
                </div>
              </div>
            </div>
          </div>

          <div v-if="selfRow.length" class="gen-row">
            <span class="gen-label">รุ่นของคุณ</span>
            <div class="gen-nodes">
              <div v-for="m in selfRow" :key="m.id" :ref="(el) => registerNode(m.id, el)">
                <TreeNode :member="m" :highlight="m.relation === 'self'" @click="open(m)" />
              </div>
            </div>
          </div>

          <div v-if="children.length" class="gen-row">
            <span class="gen-label">รุ่นลูก</span>
            <div class="gen-nodes">
              <div v-for="m in children" :key="m.id" :ref="(el) => registerNode(m.id, el)">
                <TreeNode :member="m" @click="open(m)" />
              </div>
            </div>
          </div>

          <p v-if="!members.length" class="no-data">ยังไม่มีสมาชิกในครอบครัว</p>
        </div>
      </div>

      <aside class="side-col">
        <div class="data-card panel">
          <h3>จำนวนสมาชิกตามรุ่น</h3>
          <div v-for="g in generations" :key="g.key" class="gen-stat">
            <span class="gen-stat-label">{{ g.label }}</span>
            <span class="gen-bar"><span class="gen-bar-fill" :style="{ width: (g.count / maxGeneration) * 100 + '%', background: g.color }" /></span>
            <span class="gen-stat-count">{{ g.count }}</span>
          </div>
        </div>

        <div class="data-card panel">
          <h3>สรุปภาพรวมครอบครัว</h3>
          <div class="summary-grid">
            <div class="summary-tile"><strong>{{ members.length }}</strong><span>สมาชิกทั้งหมด</span></div>
            <div class="summary-tile"><strong>{{ generationCount }}</strong><span>รุ่น</span></div>
            <div class="summary-tile"><strong>{{ siblings.length }}</strong><span>พี่น้อง</span></div>
            <div class="summary-tile"><strong>{{ children.length }}</strong><span>ลูก</span></div>
          </div>
        </div>

        <div class="data-card panel">
          <h3>คำอธิบาย</h3>
          <ul class="legend">
            <li><span class="legend-swatch legend-swatch--self" /> ตัวคุณ (จุดศูนย์กลางของผัง)</li>
            <li><span class="legend-line" /> เส้นเชื่อมพ่อแม่ – ลูก และคู่สมรส</li>
            <li><AppIcon name="chevronRight" :size="13" /> คลิกการ์ดเพื่อเปิดโปรไฟล์</li>
          </ul>
        </div>
      </aside>
    </div>

    <div v-if="others.length" class="data-card panel others">
      <h3>สมาชิกอื่น ๆ ที่ยังไม่อยู่ในผัง</h3>
      <div class="others-list">
        <div v-for="m in others" :key="m.id">
          <TreeNode :member="m" @click="open(m)" />
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
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.gen-nodes {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
}

.gen-nodes--split {
  gap: 56px;
}

.couple {
  display: flex;
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

.legend {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 12.5px;
  color: var(--text-on-dark-soft);
}

.legend li {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-swatch {
  width: 14px;
  height: 14px;
  border-radius: 4px;
}

.legend-swatch--self {
  background: linear-gradient(135deg, #1a3f7a, #2d6bd6);
}

.legend-line {
  width: 18px;
  height: 2px;
  background: #9db4d8;
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
