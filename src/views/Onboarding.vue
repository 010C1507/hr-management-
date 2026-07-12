<script setup>
import { computed, ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import AppIcon from '../components/AppIcon.vue'
import StatIconCard from '../components/StatIconCard.vue'
import { onboardingEmployees, STAGES, STATUS_META } from '../data/onboarding'
import {
  buildTimelineWeeks,
  weekIndexForDate,
  todayMarkerOffset,
  monthGroups,
  layoutStages,
} from '../utils/timeline'

const WEEK_COL = 56
const LANE_HEIGHT = 24
const ROW_PADDING = 16
const MIN_ROW_HEIGHT = 56

const INFO_COLS = [
  { key: 'year', label: 'ปี', width: 52 },
  { key: 'name', label: 'พนักงาน / ตำแหน่ง', width: 220 },
  { key: 'remark', label: 'หมายเหตุ', width: 190 },
  { key: 'start', label: 'วันเริ่มงาน', width: 100 },
  { key: 'status', label: 'สถานะ', width: 118 },
  { key: 'mentor', label: 'พี่เลี้ยง', width: 96 },
]
const INFO_WIDTH = INFO_COLS.reduce((sum, c) => sum + c.width, 0)

const weeks = buildTimelineWeeks({ weeksBefore: 6, weeksAfter: 8 })
const groups = monthGroups(weeks)
const todayOffset = todayMarkerOffset(weeks)
const timelineWidth = weeks.length * WEEK_COL

const searchQuery = ref('')
const statusFilter = ref('all')
const departmentFilter = ref('all')

const departments = computed(() => Array.from(new Set(onboardingEmployees.map((e) => e.department))))

const statusTabs = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'active', label: 'ดำเนินการ' },
  { key: 'wait', label: 'รอเริ่มงาน' },
  { key: 'done', label: 'บรรจุแล้ว' },
  { key: 'cancelled', label: 'ยกเลิก' },
]

const filteredEmployees = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return onboardingEmployees.filter((emp) => {
    if (statusFilter.value !== 'all' && emp.status !== statusFilter.value) return false
    if (departmentFilter.value !== 'all' && emp.department !== departmentFilter.value) return false
    if (q && !(emp.name.toLowerCase().includes(q) || emp.position.toLowerCase().includes(q))) return false
    return true
  })
})

const currentWeekIndex = weeks.findIndex((w) => w.isCurrent)

const stats = computed(() => {
  const all = onboardingEmployees
  return {
    total: all.length,
    done: all.filter((e) => e.status === 'done').length,
    active: all.filter((e) => e.status === 'active').length,
    wait: all.filter((e) => e.status === 'wait').length,
    cancelled: all.filter((e) => e.status === 'cancelled').length,
    startingThisWeek: all.filter((e) => weekIndexForDate(weeks, e.hireDate) === currentWeekIndex).length,
  }
})

const rows = computed(() =>
  filteredEmployees.value.map((emp) => {
    const { items, laneCount } = layoutStages(emp.stages, weeks)
    const height = Math.max(MIN_ROW_HEIGHT, laneCount * LANE_HEIGHT + ROW_PADDING)
    const bars = items.map((item) => {
      const meta = STAGES.find((s) => s.key === item.key)
      return {
        key: emp.id + item.key,
        label: meta.label,
        color: meta.color,
        left: item.startIdx * WEEK_COL + 2,
        width: (item.endIdx - item.startIdx + 1) * WEEK_COL - 4,
        top: 8 + item.lane * LANE_HEIGHT,
      }
    })
    return { emp, height, bars }
  })
)

function infoLeft(index) {
  let left = 0
  for (let i = 0; i < index; i++) left += INFO_COLS[i].width
  return left
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' })
}

const markerLeftPx = todayOffset === null ? null : todayOffset * WEEK_COL
</script>

<template>
  <section>
    <PageHeader title="ไทม์ไลน์การรับพนักงานใหม่" subtitle="ติดตามว่าพนักงานเข้าใหม่แต่ละคนอยู่ขั้นตอนไหน ในช่วงเวลาใด" />

    <div class="stat-row">
      <StatIconCard icon="briefcase" :value="stats.total" label="ทั้งหมด" color="var(--accent-blue)" />
      <StatIconCard icon="check" :value="stats.done" label="บรรจุแล้ว" color="var(--accent-green)" />
      <StatIconCard icon="hourglass" :value="stats.active" label="กำลังดำเนินการ" color="var(--accent-yellow)" />
      <StatIconCard icon="calendar" :value="stats.wait" label="รอเริ่มงาน" color="var(--accent-purple)" />
      <StatIconCard icon="plus" :value="stats.startingThisWeek" label="เริ่มงานสัปดาห์นี้" color="var(--accent-blue)" />
      <StatIconCard icon="close" :value="stats.cancelled" label="ยกเลิก" color="var(--accent-orange)" />
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
        <option value="all">ทุกแผนก</option>
        <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
      </select>
    </div>

    <div class="legend-row">
      <span v-for="stage in STAGES" :key="stage.key" class="legend-item">
        <span class="swatch" :style="{ background: stage.color }" />
        {{ stage.label }}
      </span>
    </div>

    <div class="data-card timeline-scroll">
      <div class="timeline-table" :style="{ width: INFO_WIDTH + timelineWidth + 'px' }">
        <!-- header -->
        <div class="header-block">
          <div class="header-info">
            <div v-for="col in INFO_COLS" :key="col.key" class="info-cell header-cell" :style="{ width: col.width + 'px' }">
              {{ col.label }}
            </div>
          </div>
          <div class="header-timeline" :style="{ width: timelineWidth + 'px' }">
            <div class="month-row">
              <div v-for="g in groups" :key="'m' + g.startIndex" class="month-cell" :style="{ width: g.span * WEEK_COL + 'px' }">
                {{ g.label }}
              </div>
            </div>
            <div class="week-row">
              <div
                v-for="w in weeks"
                :key="'w' + w.index"
                class="week-cell"
                :class="{ current: w.isCurrent }"
                :style="{ width: WEEK_COL + 'px' }"
              >
                {{ w.label }}
              </div>
            </div>
          </div>
        </div>

        <!-- rows -->
        <div v-for="row in rows" :key="row.emp.id" class="body-row" :style="{ height: row.height + 'px' }">
          <div class="row-info">
            <div class="info-cell" :style="{ width: INFO_COLS[0].width + 'px' }">
              {{ new Date(row.emp.hireDate).getFullYear() + 543 }}
            </div>
            <div class="info-cell name-cell" :style="{ width: INFO_COLS[1].width + 'px' }">
              <div class="emp-name">{{ row.emp.name }}</div>
              <div class="emp-role">{{ row.emp.position }} · {{ row.emp.department }}</div>
            </div>
            <div class="info-cell remark-cell" :style="{ width: INFO_COLS[2].width + 'px' }">
              {{ row.emp.remark }}
            </div>
            <div class="info-cell" :style="{ width: INFO_COLS[3].width + 'px' }">
              {{ formatDate(row.emp.hireDate) }}
            </div>
            <div class="info-cell" :style="{ width: INFO_COLS[4].width + 'px' }">
              <span class="pill" :class="STATUS_META[row.emp.status].pillClass">{{ STATUS_META[row.emp.status].label }}</span>
            </div>
            <div class="info-cell" :style="{ width: INFO_COLS[5].width + 'px' }">
              {{ row.emp.mentor }}
            </div>
          </div>

          <div class="row-timeline" :style="{ width: timelineWidth + 'px' }">
            <div
              v-for="bar in row.bars"
              :key="bar.key"
              class="stage-bar"
              :style="{ left: bar.left + 'px', width: bar.width + 'px', top: bar.top + 'px', background: bar.color }"
              :title="bar.label"
            >
              {{ bar.label }}
            </div>
          </div>
        </div>

        <p v-if="!rows.length" class="empty">ไม่พบพนักงานที่ตรงกับเงื่อนไข</p>

        <div v-if="markerLeftPx !== null" class="today-marker" :style="{ left: INFO_WIDTH + markerLeftPx + 'px' }" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.stat-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 18px;
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
  background: var(--surface-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 9px 14px;
  color: var(--text-secondary);
  flex: 1;
  min-width: 200px;
}

.search input {
  border: none;
  background: transparent;
  outline: none;
  color: var(--text-primary);
  font-size: 13.5px;
  width: 100%;
}

.search input::placeholder {
  color: var(--text-muted);
}

.status-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tab {
  border: 1px solid var(--border-color);
  background: var(--surface-bg);
  color: var(--text-secondary);
  font-size: 12.5px;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.tab:hover {
  background: #dde6f5;
  color: var(--text-primary);
}

.tab.active {
  background: var(--cta-bg);
  color: #fff;
  border-color: transparent;
}

.dept-select {
  background: var(--surface-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 9px 12px;
  color: var(--text-primary);
  font-size: 13px;
}

.dept-select option {
  color: var(--text-primary);
}

.legend-row {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: var(--text-on-dark-soft);
}

.swatch {
  width: 10px;
  height: 10px;
  border-radius: 3px;
}

.timeline-scroll {
  overflow-x: auto;
  padding: 0;
}

.timeline-table {
  position: relative;
}

.header-block {
  display: flex;
  border-bottom: 1px solid var(--border-color);
}

.header-info {
  display: flex;
  flex-shrink: 0;
  position: sticky;
  left: 0;
  z-index: 3;
  background: var(--surface-bg);
  border-right: 1px solid var(--border-color);
}

.header-timeline {
  position: relative;
  flex-shrink: 0;
}

.month-row,
.week-row {
  display: flex;
}

.month-row {
  height: 28px;
}

.week-row {
  height: 26px;
  border-top: 1px solid var(--border-color);
}

.month-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  border-left: 1px solid var(--border-color);
  flex-shrink: 0;
}

.week-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: var(--text-muted);
  border-left: 1px solid #eef2fb;
  flex-shrink: 0;
}

.week-cell.current {
  color: #1a3f7a;
  font-weight: 700;
  background: rgba(26, 63, 122, 0.06);
}

.info-cell {
  display: flex;
  align-items: center;
  padding: 0 12px;
  font-size: 13px;
  color: var(--text-on-dark);
  flex-shrink: 0;
  overflow: hidden;
}

.header-cell {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--text-on-dark-soft);
  font-weight: 700;
  align-items: center;
}

.name-cell {
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 2px;
  white-space: normal;
}

.emp-name {
  font-weight: 600;
}

.emp-role {
  font-size: 11px;
  color: var(--text-on-dark-soft);
}

.remark-cell {
  white-space: normal;
  font-size: 12px;
  color: var(--text-on-dark-soft);
  line-height: 1.3;
}

.body-row {
  display: flex;
  border-bottom: 1px solid var(--border-color);
}

.body-row:last-of-type {
  border-bottom: none;
}

.row-info {
  display: flex;
  flex-shrink: 0;
  position: sticky;
  left: 0;
  z-index: 2;
  background: #ffffff;
  border-right: 1px solid var(--border-color);
}

.row-timeline {
  position: relative;
  flex-shrink: 0;
  background-image: repeating-linear-gradient(
    to right,
    #dde6f5,
    #dde6f5 1px,
    transparent 1px,
    transparent v-bind('WEEK_COL + "px"')
  );
}

.stage-bar {
  position: absolute;
  height: 20px;
  border-radius: 7px;
  padding: 0 8px;
  font-size: 10.5px;
  font-weight: 700;
  color: #20233f;
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.today-marker {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #ff6b6b;
  z-index: 1;
  pointer-events: none;
}

.empty {
  padding: 24px;
  text-align: center;
  color: var(--text-on-dark-soft);
  font-size: 13px;
}
</style>
