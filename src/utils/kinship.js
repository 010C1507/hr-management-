// สร้างกราฟความสัมพันธ์ของครอบครัวจากเส้นเชื่อมจริง (father_id / mother_id / spouse_id)
// แล้วใช้กราฟนี้คำนวณคำเรียกญาติเมื่อมองจากสมาชิกคนใดก็ได้
//
// ถ้าฐานข้อมูลยังไม่มีเส้นเชื่อม (ยังไม่ได้รัน migration 008) จะถอยไปเดาจากคอลัมน์
// relation แบบเดิมให้อัตโนมัติ เพื่อให้ผังยังแสดงได้

export function buildFamilyGraph(members) {
  const byId = new Map(members.map((m) => [m.id, m]))
  const parents = new Map()
  const children = new Map()
  const spouse = new Map()

  function addParent(childId, parentId) {
    if (!childId || !parentId || childId === parentId) return
    if (!byId.has(childId) || !byId.has(parentId)) return
    if (!parents.has(childId)) parents.set(childId, new Set())
    if (!children.has(parentId)) children.set(parentId, new Set())
    parents.get(childId).add(parentId)
    children.get(parentId).add(childId)
  }

  function addSpouse(aId, bId) {
    if (!aId || !bId || aId === bId) return
    if (!byId.has(aId) || !byId.has(bId)) return
    spouse.set(aId, bId)
    spouse.set(bId, aId)
  }

  const hasEdges = members.some((m) => m.father_id || m.mother_id || m.spouse_id)

  if (hasEdges) {
    for (const m of members) {
      addParent(m.id, m.father_id)
      addParent(m.id, m.mother_id)
      addSpouse(m.id, m.spouse_id)
    }
  } else {
    const one = (relation) => members.find((m) => m.relation === relation) || null
    const all = (relation) => members.filter((m) => m.relation === relation)

    const self = one('self')
    const partner = one('spouse')
    const father = one('father')
    const mother = one('mother')
    const gfPaternal = one('grandfather_paternal')
    const gmPaternal = one('grandmother_paternal')
    const gfMaternal = one('grandfather_maternal')
    const gmMaternal = one('grandmother_maternal')

    for (const child of [self, ...all('sibling')]) {
      addParent(child?.id, father?.id)
      addParent(child?.id, mother?.id)
    }
    for (const kid of all('child')) {
      addParent(kid.id, self?.id)
      addParent(kid.id, partner?.id)
    }
    addParent(father?.id, gfPaternal?.id)
    addParent(father?.id, gmPaternal?.id)
    addParent(mother?.id, gfMaternal?.id)
    addParent(mother?.id, gmMaternal?.id)

    addSpouse(self?.id, partner?.id)
    addSpouse(father?.id, mother?.id)
    addSpouse(gfPaternal?.id, gmPaternal?.id)
    addSpouse(gfMaternal?.id, gmMaternal?.id)
  }

  const anchor = members.find((m) => m.relation === 'self') || members[0] || null
  const generation = computeGenerations({ parents, children, spouse }, anchor?.id)

  return { byId, parents, children, spouse, generation, members }
}

// ไล่ระดับรุ่นจากจุดตั้งต้น: พ่อแม่ = -1, ลูก = +1, คู่สมรส = รุ่นเดียวกัน
// รองรับความลึกเท่าไรก็ได้ (หลาน เหลน ลูกพี่ลูกน้อง ฯลฯ)
function computeGenerations({ parents, children, spouse }, anchorId) {
  const generation = new Map()
  if (!anchorId) return generation

  generation.set(anchorId, 0)
  const queue = [anchorId]

  while (queue.length) {
    const current = queue.shift()
    const level = generation.get(current)

    for (const parentId of parents.get(current) || []) {
      if (!generation.has(parentId)) {
        generation.set(parentId, level - 1)
        queue.push(parentId)
      }
    }
    for (const childId of children.get(current) || []) {
      if (!generation.has(childId)) {
        generation.set(childId, level + 1)
        queue.push(childId)
      }
    }
    const partnerId = spouse.get(current)
    if (partnerId && !generation.has(partnerId)) {
      generation.set(partnerId, level)
      queue.push(partnerId)
    }
  }

  return generation
}

// รายชื่อลูกหลานทั้งหมดของคนนี้ (ใช้กันการตั้งความสัมพันธ์ที่วนเป็นวงกลม)
export function descendantIds(graph, memberId) {
  const found = new Set()
  const queue = [memberId]
  while (queue.length) {
    const current = queue.shift()
    for (const childId of graph.children.get(current) || []) {
      if (!found.has(childId)) {
        found.add(childId)
        queue.push(childId)
      }
    }
  }
  return found
}

// รายชื่อบรรพบุรุษทั้งหมดของคนนี้
export function ancestorIds(graph, memberId) {
  const found = new Set()
  const queue = [memberId]
  while (queue.length) {
    const current = queue.shift()
    for (const parentId of graph.parents.get(current) || []) {
      if (!found.has(parentId)) {
        found.add(parentId)
        queue.push(parentId)
      }
    }
  }
  return found
}

// พี่น้อง = คนที่มีพ่อหรือแม่ร่วมกันอย่างน้อยหนึ่งคน
export function siblingIds(graph, memberId) {
  const own = [...(graph.parents.get(memberId) || [])]
  if (!own.length) return new Set()
  const found = new Set()
  for (const parentId of own) {
    for (const childId of graph.children.get(parentId) || []) {
      if (childId !== memberId) found.add(childId)
    }
  }
  return found
}

const parentsOf = (graph, id) => [...(graph.parents.get(id) || [])]
const childrenOf = (graph, id) => [...(graph.children.get(id) || [])]

function isSibling(graph, a, b) {
  if (!a || !b || a === b) return false
  const parentsA = parentsOf(graph, a)
  if (!parentsA.length) return false
  return parentsOf(graph, b).some((p) => parentsA.includes(p))
}

// true = a เกิดก่อน b, false = เกิดหลัง, null = เทียบไม่ได้
function bornEarlier(a, b) {
  if (!a?.birth_date || !b?.birth_date) return null
  return new Date(a.birth_date) < new Date(b.birth_date)
}

function stepsUp(graph, fromId, targetId, maxDepth = 4) {
  let frontier = [fromId]
  const seen = new Set([fromId])
  for (let depth = 1; depth <= maxDepth; depth++) {
    const next = []
    for (const current of frontier) {
      for (const parent of parentsOf(graph, current)) {
        if (parent === targetId) return depth
        if (!seen.has(parent)) {
          seen.add(parent)
          next.push(parent)
        }
      }
    }
    if (!next.length) break
    frontier = next
  }
  return 0
}

function stepsDown(graph, fromId, targetId, maxDepth = 4) {
  let frontier = [fromId]
  const seen = new Set([fromId])
  for (let depth = 1; depth <= maxDepth; depth++) {
    const next = []
    for (const current of frontier) {
      for (const child of childrenOf(graph, current)) {
        if (child === targetId) return depth
        if (!seen.has(child)) {
          seen.add(child)
          next.push(child)
        }
      }
    }
    if (!next.length) break
    frontier = next
  }
  return 0
}

const byGender = (member, male, female, fallback) =>
  member.gender === 'male' ? male : member.gender === 'female' ? female : fallback

// คำเรียกของ memberId เมื่อมองจาก viewpointId (ภาษาไทย)
// viaSpouse ใช้ภายในเท่านั้น: กันการวนซ้ำตอนเทียบผ่านฝั่งคู่สมรส
export function relationFrom(graph, viewpointId, memberId, viaSpouse = false) {
  const viewer = graph.byId.get(viewpointId)
  const target = graph.byId.get(memberId)
  if (!viewer || !target) return 'ญาติ'
  if (viewpointId === memberId) return 'มุมมองปัจจุบัน'

  const viewerSpouseId = graph.spouse.get(viewpointId)
  const viewerParents = parentsOf(graph, viewpointId)

  if (viewerSpouseId === memberId) return byGender(target, 'สามี', 'ภรรยา', 'คู่สมรส')
  if (viewerParents.includes(memberId)) return byGender(target, 'พ่อ', 'แม่', 'ผู้ปกครอง')
  if (childrenOf(graph, viewpointId).includes(memberId)) return byGender(target, 'ลูกชาย', 'ลูกสาว', 'ลูก')

  if (isSibling(graph, viewpointId, memberId)) {
    const older = bornEarlier(target, viewer)
    if (older === null) return 'พี่น้อง'
    return older
      ? byGender(target, 'พี่ชาย', 'พี่สาว', 'พี่')
      : byGender(target, 'น้องชาย', 'น้องสาว', 'น้อง')
  }

  const up = stepsUp(graph, viewpointId, memberId)
  if (up === 2) {
    const throughFather = viewerParents.some(
      (p) => graph.byId.get(p)?.gender === 'male' && parentsOf(graph, p).includes(memberId)
    )
    if (throughFather) return byGender(target, 'ปู่', 'ย่า', 'ปู่ย่า')
    return byGender(target, 'ตา', 'ยาย', 'ตายาย')
  }
  if (up === 3) return 'ทวด'
  if (up >= 4) return 'บรรพบุรุษ'

  const down = stepsDown(graph, viewpointId, memberId)
  if (down === 2) return 'หลาน'
  if (down === 3) return 'เหลน'
  if (down >= 4) return 'ลูกหลาน'

  // พี่น้องของพ่อแม่ → ลุง / ป้า / น้า / อา
  for (const parentId of viewerParents) {
    const parent = graph.byId.get(parentId)
    const bloodSiblingId = isSibling(graph, parentId, memberId)
      ? memberId
      : [graph.spouse.get(memberId)].find((s) => s && isSibling(graph, parentId, s))
    if (!bloodSiblingId) continue
    const bloodSibling = graph.byId.get(bloodSiblingId)
    const older = bornEarlier(bloodSibling, parent)
    if (older === false) return parent?.gender === 'male' ? 'อา' : 'น้า'
    return byGender(target, 'ลุง', 'ป้า', 'ญาติผู้ใหญ่')
  }

  // ลูกของพี่น้อง → หลาน
  if (parentsOf(graph, memberId).some((p) => isSibling(graph, viewpointId, p))) return 'หลาน'

  // คู่สมรสของพี่น้อง
  const targetSpouseId = graph.spouse.get(memberId)
  if (targetSpouseId && isSibling(graph, viewpointId, targetSpouseId)) {
    const older = bornEarlier(graph.byId.get(targetSpouseId), viewer)
    const prefix = older === false ? 'น้อง' : 'พี่'
    return byGender(target, `${prefix}เขย`, `${prefix}สะใภ้`, 'เขย/สะใภ้')
  }

  if (viewerSpouseId) {
    // พ่อแม่ของคู่สมรส
    if (parentsOf(graph, viewerSpouseId).includes(memberId)) {
      return viewer.gender === 'male'
        ? byGender(target, 'พ่อตา', 'แม่ยาย', 'พ่อแม่ของคู่สมรส')
        : byGender(target, 'พ่อสามี', 'แม่สามี', 'พ่อแม่ของคู่สมรส')
    }
    // พี่น้องของคู่สมรส
    if (isSibling(graph, viewerSpouseId, memberId)) {
      const older = bornEarlier(target, graph.byId.get(viewerSpouseId))
      const prefix = older === false ? 'น้อง' : 'พี่'
      return byGender(target, `${prefix}เขย`, `${prefix}สะใภ้`, 'เขย/สะใภ้')
    }
  }

  // คู่สมรสของลูก
  if (childrenOf(graph, viewpointId).some((c) => graph.spouse.get(c) === memberId)) {
    return byGender(target, 'ลูกเขย', 'ลูกสะใภ้', 'ลูกเขย/สะใภ้')
  }

  // ญาติฝั่งคู่สมรส — ไทยนิยมเรียกตามที่คู่สมรสเรียก (เช่น ปู่ ย่า ลุง ป้า)
  if (!viaSpouse && viewerSpouseId) {
    const viaPartner = relationFrom(graph, viewerSpouseId, memberId, true)
    if (viaPartner !== 'ญาติ') return viaPartner
  }

  return 'ญาติ'
}

const GENERATION_NAMES = {
  '-3': 'รุ่นทวด',
  '-2': 'รุ่นปู่ย่าตายาย',
  '-1': 'รุ่นพ่อแม่',
  0: 'รุ่นเดียวกัน',
  1: 'รุ่นลูก',
  2: 'รุ่นหลาน',
  3: 'รุ่นเหลน',
}

export function generationName(offset) {
  return GENERATION_NAMES[String(offset)] || (offset < 0 ? 'รุ่นก่อนหน้า' : 'รุ่นถัดไป')
}

// เรียงสมาชิกในแต่ละรุ่น:
// - พี่น้องพ่อแม่เดียวกันอยู่ติดกันเป็นกลุ่ม และกลุ่มเรียงตามตำแหน่งพ่อแม่ในแถวบน (prevOrder)
// - คู่สมรสอยู่ติดกัน โดยคนที่แต่งงานกับคนจากอีกครอบครัวจะอยู่ขอบกลุ่มฝั่งที่หันไปหาคู่
// เพื่อไม่ให้เส้นจากพ่อแม่ของสองครอบครัวทับกัน
export function orderRow(graph, rowMembers, prevOrder = []) {
  const byBirth = [...rowMembers].sort(
    (a, b) => new Date(a.birth_date || '2100-01-01') - new Date(b.birth_date || '2100-01-01')
  )
  const inRow = new Set(byBirth.map((m) => m.id))
  const parentKey = (id) => [...(graph.parents.get(id) || [])].sort().join('|')
  const partnerOf = (id) => {
    const s = graph.spouse.get(id)
    return s && inRow.has(s) ? s : null
  }

  // จัดกลุ่ม: คนที่มีพ่อแม่ในผัง → กลุ่มตามคู่พ่อแม่, คนที่ไม่มี → ตามคู่สมรสหรืออยู่เดี่ยว
  const groups = new Map()
  const attached = new Map() // memberId -> in-law partner ที่ไม่มีพ่อแม่ในผัง
  const groupOf = new Map()
  for (const m of byBirth) {
    const key = parentKey(m.id)
    if (!key) continue
    if (!groups.has(key)) groups.set(key, { key, members: [] })
    groups.get(key).members.push(m)
    groupOf.set(m.id, key)
  }
  for (const m of byBirth) {
    if (groupOf.has(m.id) || attached.has(m.id) || [...attached.values()].includes(m)) continue
    const partnerId = partnerOf(m.id)
    if (partnerId && groupOf.has(partnerId)) {
      attached.set(partnerId, m)
      continue
    }
    const key = `solo:${m.id}`
    groups.set(key, { key, members: [m] })
    groupOf.set(m.id, key)
    const partner = partnerId && byBirth.find((x) => x.id === partnerId)
    if (partner && !groupOf.has(partner.id) && !parentKey(partner.id)) attached.set(m.id, partner)
  }

  // เรียงกลุ่มตามตำแหน่งเฉลี่ยของพ่อแม่ในแถวบน
  const prevIndex = new Map(prevOrder.map((id, i) => [id, i]))
  const position = (group) => {
    const idx = [...(graph.parents.get(group.members[0].id) || [])]
      .map((p) => prevIndex.get(p))
      .filter((i) => i !== undefined)
    return idx.length ? idx.reduce((a, b) => a + b, 0) / idx.length : Infinity
  }
  const firstBirth = (group) => byBirth.indexOf(group.members[0])
  const ordered = [...groups.values()].sort(
    (a, b) => position(a) - position(b) || firstBirth(a) - firstBirth(b)
  )
  const rank = new Map(ordered.map((g, i) => [g.key, i]))

  // ในกลุ่ม: คนที่แต่งงานกับคนจากกลุ่มอื่นไปอยู่ขอบฝั่งที่ใกล้กลุ่มนั้น
  const placed = []
  for (const group of ordered) {
    const myRank = rank.get(group.key)
    const side = (m) => {
      const partnerId = partnerOf(m.id)
      const other = partnerId && groupOf.get(partnerId)
      if (!other || other === group.key) return 0
      return rank.get(other) < myRank ? -1 : 1
    }
    const members = [...group.members].sort((a, b) => side(a) - side(b))
    for (const m of members) {
      const inLaw = attached.get(m.id)
      // in-law อยู่ฝั่งนอกของกลุ่ม: ถ้าคนนี้อยู่ต้นกลุ่ม (และไม่ใช่คนเดียว) ให้ in-law อยู่ซ้าย
      if (inLaw && members.length > 1 && m === members[0]) placed.push(inLaw, m)
      else if (inLaw) placed.push(m, inLaw)
      else placed.push(m)
    }
  }
  return placed
}
