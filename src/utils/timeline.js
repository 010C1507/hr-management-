const MONTH_LABELS = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
]

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function mondayOfWeek(date) {
  const d = startOfDay(date)
  const diffToMonday = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - diffToMonday)
  return d
}

export function buildTimelineWeeks({ weeksBefore = 6, weeksAfter = 8, today = new Date() } = {}) {
  const todayStart = startOfDay(today)
  const firstMonday = mondayOfWeek(todayStart)
  firstMonday.setDate(firstMonday.getDate() - weeksBefore * 7)

  const totalWeeks = weeksBefore + weeksAfter + 1
  const weeks = []

  for (let i = 0; i < totalWeeks; i++) {
    const start = new Date(firstMonday)
    start.setDate(firstMonday.getDate() + i * 7)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)

    weeks.push({
      index: i,
      start,
      end,
      month: start.getMonth(),
      monthLabel: MONTH_LABELS[start.getMonth()],
      label: 'W' + Math.ceil(start.getDate() / 7),
      isCurrent: todayStart >= start && todayStart <= end,
    })
  }

  return weeks
}

export function weekIndexForDate(weeks, date) {
  const target = startOfDay(date)
  const found = weeks.findIndex((w) => target >= w.start && target <= w.end)
  if (found !== -1) return found
  return target < weeks[0].start ? 0 : weeks.length - 1
}

export function todayMarkerOffset(weeks, today = new Date()) {
  const todayStart = startOfDay(today)
  const idx = weeks.findIndex((w) => todayStart >= w.start && todayStart <= w.end)
  if (idx === -1) return null
  const dayOffset = Math.round((todayStart - weeks[idx].start) / 86400000)
  return idx + dayOffset / 7
}

export function layoutStages(stages, weeks) {
  const items = stages
    .map((s) => ({
      ...s,
      startIdx: weekIndexForDate(weeks, s.start),
      endIdx: weekIndexForDate(weeks, s.end),
    }))
    .sort((a, b) => a.startIdx - b.startIdx)

  const laneEnds = []
  items.forEach((item) => {
    let lane = laneEnds.findIndex((end) => end < item.startIdx)
    if (lane === -1) {
      lane = laneEnds.length
      laneEnds.push(item.endIdx)
    } else {
      laneEnds[lane] = item.endIdx
    }
    item.lane = lane
  })

  return { items, laneCount: laneEnds.length || 1 }
}

export function monthGroups(weeks) {
  const groups = []
  weeks.forEach((w) => {
    const last = groups[groups.length - 1]
    if (last && last.month === w.month) {
      last.span += 1
    } else {
      groups.push({ month: w.month, label: w.monthLabel, span: 1, startIndex: w.index })
    }
  })
  return groups
}
