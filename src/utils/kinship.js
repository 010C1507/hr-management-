// สร้างกราฟความสัมพันธ์ของครอบครัวจากข้อมูลที่เก็บแบบ "อ้างอิงจากตัวเอง"
// แล้วใช้กราฟนี้คำนวณคำเรียกญาติเมื่อมองจากสมาชิกคนใดก็ได้

export function buildFamilyGraph(members) {
  const byId = new Map(members.map((m) => [m.id, m]))
  const parents = new Map()
  const children = new Map()
  const spouse = new Map()
  const generation = new Map()

  function addParent(child, parent) {
    if (!child || !parent) return
    if (!parents.has(child.id)) parents.set(child.id, new Set())
    if (!children.has(parent.id)) children.set(parent.id, new Set())
    parents.get(child.id).add(parent.id)
    children.get(parent.id).add(child.id)
  }

  function addSpouse(a, b) {
    if (!a || !b) return
    spouse.set(a.id, b.id)
    spouse.set(b.id, a.id)
  }

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
    addParent(child, father)
    addParent(child, mother)
  }
  for (const kid of all('child')) {
    addParent(kid, self)
    addParent(kid, partner)
  }
  addParent(father, gfPaternal)
  addParent(father, gmPaternal)
  addParent(mother, gfMaternal)
  addParent(mother, gmMaternal)

  addSpouse(self, partner)
  addSpouse(father, mother)
  addSpouse(gfPaternal, gmPaternal)
  addSpouse(gfMaternal, gmMaternal)

  const GENERATION_BY_RELATION = {
    grandfather_paternal: -2,
    grandmother_paternal: -2,
    grandfather_maternal: -2,
    grandmother_maternal: -2,
    father: -1,
    mother: -1,
    self: 0,
    spouse: 0,
    sibling: 0,
    child: 1,
  }
  for (const m of members) {
    if (m.relation in GENERATION_BY_RELATION) generation.set(m.id, GENERATION_BY_RELATION[m.relation])
  }

  return { byId, parents, children, spouse, generation, members }
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

// เรียงสมาชิกในแต่ละรุ่นให้คู่สมรสอยู่ติดกัน
export function orderRow(graph, rowMembers) {
  const remaining = [...rowMembers].sort(
    (a, b) => new Date(a.birth_date || '2100-01-01') - new Date(b.birth_date || '2100-01-01')
  )
  const placed = []
  const done = new Set()
  for (const member of remaining) {
    if (done.has(member.id)) continue
    placed.push(member)
    done.add(member.id)
    const spouseId = graph.spouse.get(member.id)
    const partner = remaining.find((m) => m.id === spouseId && !done.has(m.id))
    if (partner) {
      placed.push(partner)
      done.add(partner.id)
    }
  }
  return placed
}
