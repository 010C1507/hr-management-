<script setup>
import { onMounted, ref } from 'vue'
import AppIcon from './AppIcon.vue'
import { supabase } from '../lib/supabase'
import { authUser, linkToMember, signOut } from '../lib/auth'
import { relationLabels } from '../data/sample'

const members = ref([])
const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')
const selectedId = ref('')

function initials(name) {
  return name ? name.trim().split(' ').map((p) => p[0]).slice(0, 2).join('') : '-'
}

async function loadMembers() {
  loading.value = true
  errorMessage.value = ''
  const { data, error } = await supabase.from('family_members').select('*').order('birth_date')
  if (error) errorMessage.value = 'โหลดรายชื่อสมาชิกไม่สำเร็จ: ' + error.message
  else members.value = data ?? []
  loading.value = false
}

async function confirmSelection() {
  if (!selectedId.value) return
  saving.value = true
  errorMessage.value = ''
  const { error } = await linkToMember(selectedId.value)
  saving.value = false
  if (error) errorMessage.value = error
}

onMounted(loadMembers)
</script>

<template>
  <div class="overlay">
    <div class="dialog">
      <header class="dialog-head">
        <h2>คุณคือใครในครอบครัว?</h2>
        <p>
          เข้าสู่ระบบด้วย <strong>{{ authUser?.email }}</strong> แล้ว —
          เลือกโปรไฟล์ของคุณหนึ่งครั้ง ระบบจะจดจำไว้ให้ครั้งถัดไป
        </p>
      </header>

      <p v-if="errorMessage" class="notice notice--error">{{ errorMessage }}</p>
      <p v-if="loading" class="notice">กำลังโหลดรายชื่อสมาชิก...</p>
      <p v-else-if="!members.length" class="notice">
        ยังไม่มีสมาชิกในระบบ — ต้องเพิ่มสมาชิกในฐานข้อมูลก่อนจึงจะเลือกตัวตนได้
      </p>

      <div v-else class="member-grid">
        <button
          v-for="m in members"
          :key="m.id"
          type="button"
          class="member-option"
          :class="{ selected: selectedId === m.id }"
          @click="selectedId = m.id"
        >
          <img v-if="m.photo_url" :src="m.photo_url" :alt="m.full_name" />
          <span v-else class="member-initials">{{ initials(m.full_name) }}</span>
          <span class="member-name">{{ m.full_name }}</span>
          <span class="member-relation">{{ relationLabels[m.relation] || m.relation }}</span>
          <AppIcon v-if="selectedId === m.id" class="check" name="check" :size="16" />
        </button>
      </div>

      <footer class="dialog-foot">
        <button class="btn-ghost" type="button" @click="signOut">
          <AppIcon name="logout" :size="15" /> ออกจากระบบ
        </button>
        <button class="btn-primary" type="button" :disabled="!selectedId || saving" @click="confirmSelection">
          {{ saving ? 'กำลังบันทึก...' : 'ยืนยันว่านี่คือฉัน' }}
        </button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(9, 26, 56, 0.62);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.dialog {
  width: 100%;
  max-width: 640px;
  max-height: 88vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 18px;
  padding: 26px;
  box-shadow: 0 24px 60px -18px rgba(6, 24, 54, 0.55);
}

.dialog-head h2 {
  margin: 0;
  font-size: 19px;
  color: #12305e;
}

.dialog-head p {
  margin: 6px 0 18px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-secondary);
}

.notice {
  margin: 0 0 16px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  background: #eff6ff;
  color: var(--text-secondary);
  font-size: 12.5px;
  border: 1px solid #bfdbfe;
}

.notice--error {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}

.member-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.member-option {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 14px 10px 12px;
  border-radius: 14px;
  border: 2px solid var(--border-color);
  background: var(--surface-bg);
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.15s ease, transform 0.15s ease, background 0.15s ease;
}

.member-option:hover {
  transform: translateY(-2px);
  background: #f2f7ff;
}

.member-option.selected {
  border-color: #1a3f7a;
  background: #eaf1fd;
}

.member-option img,
.member-initials {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--accent-blue);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #1e3a5f;
  border: 3px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.member-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  line-height: 1.3;
}

.member-relation {
  font-size: 11.5px;
  color: #1a3f7a;
  background: #e8effa;
  padding: 2px 9px;
  border-radius: 999px;
}

.check {
  position: absolute;
  top: 8px;
  right: 8px;
  color: #1a3f7a;
}

.dialog-foot {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid var(--border-color);
}
</style>
