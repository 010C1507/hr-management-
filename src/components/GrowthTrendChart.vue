<script setup>
import { computed } from 'vue'

const props = defineProps({
  records: { type: Array, required: true },
  field: { type: String, required: true },
  color: { type: String, default: 'var(--accent-blue)' },
  unit: { type: String, default: '' },
})

const width = 320
const height = 120
const padX = 8
const padY = 14

const sorted = computed(() =>
  [...props.records]
    .filter((r) => r[props.field] !== null && r[props.field] !== undefined)
    .sort((a, b) => new Date(a.record_date) - new Date(b.record_date))
)

const values = computed(() => sorted.value.map((r) => Number(r[props.field])))
const minVal = computed(() => Math.min(...values.value))
const maxVal = computed(() => Math.max(...values.value))

const points = computed(() => {
  const n = sorted.value.length
  if (n === 0) return []
  const range = maxVal.value - minVal.value || 1
  return sorted.value.map((r, i) => {
    const x = n === 1 ? width / 2 : padX + (i / (n - 1)) * (width - padX * 2)
    const y = height - padY - ((Number(r[props.field]) - minVal.value) / range) * (height - padY * 2)
    return { x, y, value: r[props.field], date: r.record_date }
  })
})

const linePath = computed(() =>
  points.value.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
)

const latest = computed(() => sorted.value[sorted.value.length - 1] || null)
const first = computed(() => sorted.value[0] || null)
const delta = computed(() => {
  if (!latest.value || !first.value || latest.value === first.value) return null
  return (Number(latest.value[props.field]) - Number(first.value[props.field])).toFixed(1)
})
</script>

<template>
  <div class="trend-chart">
    <div class="trend-head">
      <span class="trend-value">{{ latest ? latest[field] : '-' }} {{ unit }}</span>
      <span v-if="delta !== null" class="trend-delta" :class="{ up: delta > 0, down: delta < 0 }">
        {{ delta > 0 ? '+' : '' }}{{ delta }} {{ unit }} จากครั้งแรก
      </span>
    </div>
    <svg v-if="points.length" :viewBox="`0 0 ${width} ${height}`" class="chart-svg" preserveAspectRatio="none">
      <path :d="linePath" fill="none" :stroke="color" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      <circle v-for="(p, i) in points" :key="i" :cx="p.x" :cy="p.y" r="3" :fill="color" />
    </svg>
    <p v-else class="no-data">ยังไม่มีข้อมูล</p>
  </div>
</template>

<style scoped>
.trend-chart {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.trend-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.trend-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-on-dark);
}

.trend-delta {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-on-dark-soft);
}

.trend-delta.up {
  color: #16a34a;
}

.trend-delta.down {
  color: #dc2626;
}

.chart-svg {
  width: 100%;
  height: 90px;
  display: block;
}

.no-data {
  margin: 0;
  font-size: 12.5px;
  color: var(--text-on-dark-faint);
}
</style>
