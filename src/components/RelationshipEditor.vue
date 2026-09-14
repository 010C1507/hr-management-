<script setup>
import { computed, ref } from 'vue'
import AppIcon from './AppIcon.vue'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { ancestorIds, buildFamilyGraph, descendantIds, siblingIds } from '../utils/kinship'

const props = defineProps({
  member: { type: Object, required: true },
  members: { type: Array, required: true },
})

const emit = defineEmits(['changed'])

const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const childToAdd = ref('')
const siblingToAdd = ref('')

const graph = computed(() => buildFamilyGraph(props.members))
const byId = computed(() => new Map(props.members.map((m) => [m.id, m])))

const father = computed(() => byId.value.get(props.member.father_id) || null)
const mother = computed(() => byId.value.get(props.member.mother_id) || null)
const partner = computed(() => byId.value.get(props.member.spouse_id) || null)

const childList = computed(() =>
  props.members
    .filter((m) => m.father_id === props.member.id || m.mother_id === props.member.id)
    .sort((a, b) => new Date(a.birth_date || '2100-01-01') - new Date(b.birth_date || '2100-01-01'))
)

const siblingList = computed(() => {
  const ids = siblingIds(graph.value, props.member.id)
  return props.members
    .filter((m) => ids.has(m.id))
    .sort((a, b) => new Date(a.birth_date || '2100-01-01') - new Date(b.birth_date || '2100-01-01'))
})

const hasParents = computed(() => Boolean(props.member.father_id || props.member.mother_id))

// ห้ามเลือกตัวเอง และห้ามเลือกลูกหลานของตัวเองมาเป็นพ่อ/แม่/คู่สมรส (กันวงวน)
const parentOptions = computed(() => {
  const blocked = descendantIds(graph.value, props.member.id)
  return props.members.filter((m) => m.id !== props.member.id && !blocked.has(m.id))
})

// ห้ามเลือกบรรพบุรุษของตัวเองมาเป็นลูก และคนที่มีพ่อแม่ครบแล้วก็ไม่ต้องแสดงซ้ำ
const childOptions = computed(() => {
  const blocked = ancestorIds(graph.value, props.member.id)
  const existing = new Set(childList.value.map((m) => m.id))
  return props.members.filter((m) => m.id !== props.member.id && !blocked.has(m.id) && !existing.has(m.id))
})

const siblingOptions = computed(() => {
  const existing = siblingIds(graph.value, props.member.id)
  const blocked = new Set([
    ...descendantIds(graph.value, props.member.id),
    ...ancestorIds(graph.value, props.member.id),
  ])
  return props.members.filter((m) => m.id !== props.member.id && !existing.has(m.id) && !blocked.has(m.id))
})

function label(m) {
  return m.nickname ? `${m.full_name} (${m.nickname})` : m.full_name
}

function flash(message) {
  successMessage.value = message
  setTimeout(() => (successMessage.value = ''), 2600)
}

async function applyUpdates(updates) {
  if (!isSupabaseConfigured) {
    errorMessage.value = 'ยังไม่ได้เชื่อมต่อ Supabase — โหมดข้อมูลตัวอย่างแก้ความสัมพันธ์ไม่ได้'
    return false
  }

  saving.value = true
  errorMessage.value = ''
  for (const { id, patch } of updates) {
    const { error } = await supabase.from('family_members').update(patch).eq('id', id)
    if (error) {
      saving.value = false
      errorMessage.value = 'บันทึกความสัมพันธ์ไม่สำเร็จ: ' + error.message
      return false
    }
  }
  saving.value = false
  emit('changed')
  return true
}

async function setParent(field, value) {
  const ok = await applyUpdates([{ id: props.member.id, patch: { [field]: value || null } }])
  if (ok) flash(value ? 'บันทึกแล้ว — อีกฝ่ายจะเห็นคุณเป็นลูกทันที' : 'ลบความสัมพันธ์แล้ว')
}

async function setSpouse(value) {
  const updates = []
  // ตัดคู่เดิมของทั้งสองฝ่ายออกก่อน แล้วผูกใหม่แบบสองทาง
  if (props.member.spouse_id && props.member.spouse_id !== value) {
    updates.push({ id: props.member.spouse_id, patch: { spouse_id: null } })
  }
  if (value) {
    const target = byId.value.get(value)
    if (target?.spouse_id && target.spouse_id !== props.member.id) {
      updates.push({ id: target.spouse_id, patch: { spouse_id: null } })
    }
    updates.push({ id: value, patch: { spouse_id: props.member.id } })
  }
  updates.push({ id: props.member.id, patch: { spouse_id: value || null } })

  const ok = await applyUpdates(updates)
  if (ok) flash(value ? 'บันทึกแล้ว — อีกฝ่ายจะเห็นคุณเป็นคู่สมรสด้วย' : 'ลบความสัมพันธ์แล้ว')
}

async function addChild() {
  if (!childToAdd.value) return
  const patch =
    props.member.gender === 'female'
      ? { mother_id: props.member.id }
      : { father_id: props.member.id }
  // ถ้ามีคู่สมรส ให้ใส่เป็นพ่อ/แม่อีกฝั่งให้ด้วย
  if (props.member.spouse_id) {
    const other = props.member.gender === 'female' ? 'father_id' : 'mother_id'
    patch[other] = props.member.spouse_id
  }

  const childId = childToAdd.value
  const ok = await applyUpdates([{ id: childId, patch }])
  if (ok) {
    childToAdd.value = ''
    flash('เพิ่มลูกแล้ว — ฝั่งลูกจะเห็นคุณเป็นพ่อ/แม่ทันที')
  }
}

async function removeChild(child) {
  const patch = {}
  if (child.father_id === props.member.id) patch.father_id = null
  if (child.mother_id === props.member.id) patch.mother_id = null
  const ok = await applyUpdates([{ id: child.id, patch }])
  if (ok) flash('ลบความสัมพันธ์แล้ว')
}

async function addSibling() {
  if (!siblingToAdd.value) return
  const target = byId.value.get(siblingToAdd.value)
  if (!target) return

  // พี่น้อง = ใช้พ่อแม่ร่วมกัน จึงคัดลอกพ่อแม่ไปยังฝั่งที่ยังไม่มี
  const updates = []
  if (hasParents.value) {
    updates.push({
      id: target.id,
      patch: { father_id: props.member.father_id || target.father_id || null, mother_id: props.member.mother_id || target.mother_id || null },
    })
  } else if (target.father_id || target.mother_id) {
    updates.push({
      id: props.member.id,
      patch: { father_id: target.father_id || null, mother_id: target.mother_id || null },
    })
  } else {
    errorMessage.value = 'ต้องระบุพ่อหรือแม่ของคนใดคนหนึ่งก่อน — ระบบใช้ "พ่อแม่ร่วมกัน" ในการระบุความเป็นพี่น้อง'
    return
  }

  const ok = await applyUpdates(updates)
  if (ok) {
    siblingToAdd.value = ''
    flash('เพิ่มพี่น้องแล้ว — อีกฝ่ายจะเห็นคุณเป็นพี่/น้องทันที')
  }
}

async function removeSibling(sibling) {
  const patch = {}
  if (sibling.father_id && sibling.father_id === props.member.father_id) patch.father_id = null
  if (sibling.mother_id && sibling.mother_id === props.member.mother_id) patch.mother_id = null
  if (!Object.keys(patch).length) return
  const ok = await applyUpdates([{ id: sibling.id, patch }])
  if (ok) flash('ลบความเป็นพี่น้องแล้ว (ล้างพ่อแม่ร่วมของอีกฝ่าย)')
}
</script>

<template>
  <div class="relationship-editor">
    <p class="hint">
      <AppIcon name="check" :size="14" />
      ความสัมพันธ์ที่ตั้งที่นี่มีผลกับอีกฝ่ายทันที — เช่น เลือกน้องสาว ฝั่งเธอก็จะเห็นคุณเป็นพี่ชายเช่นกัน
    </p>

    <p v-if="errorMessage" class="notice notice--error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="notice notice--success">{{ successMessage }}</p>

    <div class="editor-grid">
      <div class="data-card panel">
        <h3><AppIcon name="users" :size="16" /> พ่อ แม่ และคู่สมรส</h3>

        <div class="field">
          <label>พ่อ</label>
          <select :value="member.father_id || ''" :disabled="saving" @change="setParent('father_id', $event.target.value)">
            <option value="">— ยังไม่ระบุ —</option>
            <option v-for="m in parentOptions" :key="m.id" :value="m.id">{{ label(m) }}</option>
          </select>
        </div>

        <div class="field">
          <label>แม่</label>
          <select :value="member.mother_id || ''" :disabled="saving" @change="setParent('mother_id', $event.target.value)">
            <option value="">— ยังไม่ระบุ —</option>
            <option v-for="m in parentOptions" :key="m.id" :value="m.id">{{ label(m) }}</option>
          </select>
        </div>

        <div class="field">
          <label>คู่สมรส</label>
          <select :value="member.spouse_id || ''" :disabled="saving" @change="setSpouse($event.target.value)">
            <option value="">— ยังไม่ระบุ —</option>
            <option v-for="m in parentOptions" :key="m.id" :value="m.id">{{ label(m) }}</option>
          </select>
        </div>

        <dl class="current">
          <div><dt>พ่อ</dt><dd>{{ father ? label(father) : '-' }}</dd></div>
          <div><dt>แม่</dt><dd>{{ mother ? label(mother) : '-' }}</dd></div>
          <div><dt>คู่สมรส</dt><dd>{{ partner ? label(partner) : '-' }}</dd></div>
        </dl>
      </div>

      <div class="data-card panel">
        <h3><AppIcon name="heart" :size="16" /> ลูก</h3>
        <ul v-if="childList.length" class="link-list">
          <li v-for="c in childList" :key="c.id">
            <img v-if="c.photo_url" :src="c.photo_url" :alt="c.full_name" />
            <span class="link-name">{{ label(c) }}</span>
            <button class="remove-btn" type="button" title="ลบความสัมพันธ์" :disabled="saving" @click="removeChild(c)">
              <AppIcon name="close" :size="14" />
            </button>
          </li>
        </ul>
        <p v-else class="no-data">ยังไม่ได้ระบุลูก</p>

        <div class="add-row">
          <select v-model="childToAdd" :disabled="saving">
            <option value="">เลือกสมาชิกเพื่อเพิ่มเป็นลูก</option>
            <option v-for="m in childOptions" :key="m.id" :value="m.id">{{ label(m) }}</option>
          </select>
          <button class="btn-primary" type="button" :disabled="!childToAdd || saving" @click="addChild">
            <AppIcon name="plus" :size="15" /> เพิ่ม
          </button>
        </div>
      </div>

      <div class="data-card panel">
        <h3><AppIcon name="tree" :size="16" /> พี่น้อง</h3>
        <ul v-if="siblingList.length" class="link-list">
          <li v-for="s in siblingList" :key="s.id">
            <img v-if="s.photo_url" :src="s.photo_url" :alt="s.full_name" />
            <span class="link-name">{{ label(s) }}</span>
            <button class="remove-btn" type="button" title="ลบความสัมพันธ์" :disabled="saving" @click="removeSibling(s)">
              <AppIcon name="close" :size="14" />
            </button>
          </li>
        </ul>
        <p v-else class="no-data">ยังไม่ได้ระบุพี่น้อง</p>

        <div class="add-row">
          <select v-model="siblingToAdd" :disabled="saving">
            <option value="">เลือกสมาชิกเพื่อเพิ่มเป็นพี่น้อง</option>
            <option v-for="m in siblingOptions" :key="m.id" :value="m.id">{{ label(m) }}</option>
          </select>
          <button class="btn-primary" type="button" :disabled="!siblingToAdd || saving" @click="addSibling">
            <AppIcon name="plus" :size="15" /> เพิ่ม
          </button>
        </div>
        <p class="foot-hint">พี่น้องคือคนที่มีพ่อหรือแม่ร่วมกัน — เมื่อเพิ่ม ระบบจะตั้งพ่อแม่ชุดเดียวกันให้อีกฝ่ายอัตโนมัติ</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hint {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #15803d;
  font-size: 12.5px;
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

.notice--success {
  background: #f0fdf4;
  color: #15803d;
  border-color: #bbf7d0;
}

.editor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  align-items: start;
}

.panel {
  padding: 18px 20px;
}

.panel h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px;
  font-size: 14px;
  color: var(--text-on-dark);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.field label {
  font-size: 12.5px;
  color: var(--text-secondary);
  font-weight: 600;
}

.field select,
.add-row select {
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  background: var(--surface-bg);
  color: var(--text-primary);
  font-size: 13.5px;
  font-family: inherit;
}

.current {
  margin: 16px 0 0;
  padding-top: 14px;
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.current > div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 12.5px;
}

.current dt {
  color: var(--text-on-dark-faint);
}

.current dd {
  margin: 0;
  font-weight: 600;
  color: var(--text-on-dark-soft);
  text-align: right;
}

.link-list {
  list-style: none;
  margin: 0 0 14px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.link-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  background: var(--surface-bg);
  border: 1px solid var(--border-color);
}

.link-list img {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.link-name {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-on-dark);
}

.remove-btn {
  width: 24px;
  height: 24px;
  padding: 0;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background: #fff;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.remove-btn:hover:not(:disabled) {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.add-row {
  display: flex;
  gap: 8px;
}

.add-row select {
  flex: 1;
  min-width: 0;
}

.no-data {
  margin: 0 0 14px;
  font-size: 12.5px;
  color: var(--text-on-dark-faint);
}

.foot-hint {
  margin: 12px 0 0;
  font-size: 11.5px;
  line-height: 1.5;
  color: var(--text-on-dark-faint);
}
</style>
