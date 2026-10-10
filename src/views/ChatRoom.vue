<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { authUser, displayName, isSignedIn, linkedMember } from '../lib/auth'
import { familyMembers as mockMembers } from '../data/sample'

const BUCKET = 'chat-attachments'
const MAX_FILE_SIZE = 20 * 1024 * 1024
const MESSAGE_LIMIT = 200
const LOCAL_USER_ID = 'local-me'

const members = ref([])
const messages = ref([])
const loading = ref(false)
const sending = ref(false)
const errorMessage = ref('')
const draft = ref('')
const pendingFile = ref(null)
const pendingPreview = ref('')
const dragging = ref(false)
const lightboxUrl = ref('')

const listEl = ref(null)
const textareaEl = ref(null)
const fileInput = ref(null)
const imageInput = ref(null)

let channel = null

// แชทจริงต้องรู้ว่าใครส่ง (auth.uid()) — โหมดสาธิตจึงเก็บข้อความไว้ในเครื่องแทน
const isLive = computed(() => isSupabaseConfigured && isSignedIn.value)
const myUserId = computed(() => (isLive.value ? authUser.value?.id : LOCAL_USER_ID))

const memberById = computed(() => Object.fromEntries(members.value.map((m) => [m.id, m])))

const timeline = computed(() => {
  const items = []
  let lastDay = ''
  let lastSender = ''
  for (const msg of messages.value) {
    const day = dayKey(msg.created_at)
    if (day !== lastDay) {
      items.push({ type: 'date', key: 'd-' + day, label: dayLabel(msg.created_at) })
      lastDay = day
      lastSender = ''
    }
    const mine = msg.sender_user_id === myUserId.value
    const first = msg.sender_user_id !== lastSender
    items.push({ type: 'msg', key: msg.id, msg, mine, first, showSender: !mine && first })
    lastSender = msg.sender_user_id
  }
  return items
})

function senderName(msg) {
  const m = memberById.value[msg.sender_member_id]
  return m?.nickname || m?.full_name || msg.sender_name || 'สมาชิก'
}

function senderPhoto(msg) {
  return memberById.value[msg.sender_member_id]?.photo_url || ''
}

function dayKey(iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function dayLabel(iso) {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (dayKey(d) === dayKey(today)) return 'วันนี้'
  if (dayKey(d) === dayKey(yesterday)) return 'เมื่อวาน'
  return d.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

function timeLabel(iso) {
  return new Date(iso).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
}

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

function fileExt(name) {
  const ext = (name || '').split('.').pop()
  return ext && ext !== name ? ext.slice(0, 4).toUpperCase() : 'FILE'
}

const isImage = (msg) => (msg.attachment_type || '').startsWith('image/')

async function scrollToBottom(force = false) {
  await nextTick()
  const el = listEl.value
  if (!el) return
  const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 160
  if (force || nearBottom) el.scrollTop = el.scrollHeight
}

// ---------- Data ----------

async function attachSignedUrls(list) {
  const paths = list.filter((m) => m.attachment_path && !m.url).map((m) => m.attachment_path)
  if (!paths.length) return list
  const { data } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 60 * 60)
  const urlByPath = Object.fromEntries((data || []).map((d) => [d.path, d.signedUrl]))
  return list.map((m) => (m.attachment_path ? { ...m, url: m.url || urlByPath[m.attachment_path] || '' } : m))
}

function seedLocalMessages() {
  const now = Date.now()
  const at = (minutesAgo) => new Date(now - minutesAgo * 60 * 1000).toISOString()
  return [
    { id: 'l-1', sender_user_id: 'u-m-6', sender_member_id: 'm-6', content: 'วันอาทิตย์นี้กลับบ้านกินข้าวกันไหมลูก', created_at: at(60 * 26) },
    { id: 'l-2', sender_user_id: 'u-m-2', sender_member_id: 'm-2', content: 'ไปค่ะแม่ เดี๋ยวพาเด็ก ๆ ไปด้วย', created_at: at(60 * 25) },
    { id: 'l-3', sender_user_id: LOCAL_USER_ID, sender_member_id: 'm-1', content: 'ผมขับรถไปรับพ่อกับแม่ก่อนนะครับ', created_at: at(60 * 24) },
    { id: 'l-4', sender_user_id: 'u-m-11', sender_member_id: 'm-11', content: 'เอมขอฝากซื้อขนมด้วยน้า 🍰', created_at: at(35) },
    { id: 'l-5', sender_user_id: 'u-m-5', sender_member_id: 'm-5', content: 'พ่อส่งผลตรวจสุขภาพล่าสุดให้ดูนะ', created_at: at(20) },
  ]
}

async function loadData() {
  errorMessage.value = ''

  if (!isLive.value) {
    members.value = mockMembers
    if (!messages.value.length) messages.value = seedLocalMessages()
    scrollToBottom(true)
    return
  }

  loading.value = true
  const [membersRes, messagesRes] = await Promise.all([
    supabase.from('family_members').select('id, full_name, nickname, photo_url'),
    supabase.from('chat_messages').select('*').order('created_at', { ascending: false }).limit(MESSAGE_LIMIT),
  ])
  loading.value = false

  if (membersRes.error) errorMessage.value = 'โหลดข้อมูลสมาชิกไม่สำเร็จ: ' + membersRes.error.message
  else members.value = membersRes.data

  if (messagesRes.error) {
    errorMessage.value = 'โหลดข้อความไม่สำเร็จ (อาจยังไม่ได้รัน migration 009): ' + messagesRes.error.message
    return
  }

  messages.value = await attachSignedUrls([...messagesRes.data].reverse())
  scrollToBottom(true)
}

function subscribe() {
  if (!isLive.value) return
  channel = supabase
    .channel('chat-room')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, async ({ new: row }) => {
      if (messages.value.some((m) => m.id === row.id)) return
      const [withUrl] = await attachSignedUrls([row])
      if (messages.value.some((m) => m.id === row.id)) return
      messages.value.push(withUrl)
      scrollToBottom()
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'chat_messages' }, ({ old }) => {
      messages.value = messages.value.filter((m) => m.id !== old.id)
    })
    .subscribe()
}

// ---------- Composer ----------

function pickFile(file) {
  if (!file) return
  if (file.size > MAX_FILE_SIZE) {
    errorMessage.value = `ไฟล์ "${file.name}" ใหญ่เกิน 20 MB`
    return
  }
  errorMessage.value = ''
  clearPendingFile()
  pendingFile.value = file
  if (file.type.startsWith('image/')) pendingPreview.value = URL.createObjectURL(file)
}

function clearPendingFile() {
  if (pendingPreview.value) URL.revokeObjectURL(pendingPreview.value)
  pendingPreview.value = ''
  pendingFile.value = null
}

function onFileInput(event) {
  pickFile(event.target.files?.[0])
  event.target.value = ''
}

function onPaste(event) {
  const file = [...(event.clipboardData?.files || [])][0]
  if (file) {
    event.preventDefault()
    pickFile(file)
  }
}

function onDrop(event) {
  dragging.value = false
  pickFile(event.dataTransfer?.files?.[0])
}

function onKeydown(event) {
  // isComposing: กันกด Enter ระหว่างพิมพ์ด้วย IME แล้วส่งข้อความไปก่อนพิมพ์เสร็จ
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
    event.preventDefault()
    send()
  }
}

function autoGrow() {
  const el = textareaEl.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}

async function send() {
  const content = draft.value.trim()
  const file = pendingFile.value
  if ((!content && !file) || sending.value) return

  errorMessage.value = ''
  const base = {
    sender_member_id: linkedMember.value?.id ?? (isLive.value ? null : 'm-1'),
    sender_name: displayName.value,
    content: content || null,
    attachment_name: file?.name ?? null,
    attachment_type: file?.type || (file ? 'application/octet-stream' : null),
    attachment_size: file?.size ?? null,
  }

  if (!isLive.value) {
    messages.value.push({
      ...base,
      id: 'l-' + Date.now(),
      sender_user_id: LOCAL_USER_ID,
      url: file ? URL.createObjectURL(file) : '',
      attachment_path: file ? 'local' : null,
      created_at: new Date().toISOString(),
    })
    resetComposer()
    scrollToBottom(true)
    return
  }

  sending.value = true
  let attachment_path = null

  if (file) {
    const safeName = file.name.replace(/[^\w.\-]+/g, '_').slice(-80)
    attachment_path = `${authUser.value.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(attachment_path, file, { contentType: base.attachment_type, upsert: false })
    if (error) {
      sending.value = false
      errorMessage.value = 'อัปโหลดไฟล์ไม่สำเร็จ: ' + error.message
      return
    }
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({ ...base, attachment_path })
    .select()
    .single()
  sending.value = false

  if (error) {
    errorMessage.value = 'ส่งข้อความไม่สำเร็จ: ' + error.message
    if (attachment_path) supabase.storage.from(BUCKET).remove([attachment_path])
    return
  }

  if (!messages.value.some((m) => m.id === data.id)) {
    const [withUrl] = await attachSignedUrls([data])
    if (!messages.value.some((m) => m.id === data.id)) messages.value.push(withUrl)
  }
  resetComposer()
  scrollToBottom(true)
}

function resetComposer() {
  draft.value = ''
  clearPendingFile()
  nextTick(autoGrow)
  textareaEl.value?.focus()
}

async function unsend(msg) {
  if (!confirm('ยกเลิกการส่งข้อความนี้?')) return

  if (isLive.value) {
    const { error } = await supabase.from('chat_messages').delete().eq('id', msg.id)
    if (error) {
      errorMessage.value = 'ยกเลิกการส่งไม่สำเร็จ: ' + error.message
      return
    }
    if (msg.attachment_path) supabase.storage.from(BUCKET).remove([msg.attachment_path])
  }
  messages.value = messages.value.filter((m) => m.id !== msg.id)
}

onMounted(() => {
  loadData()
  subscribe()
})

onBeforeUnmount(() => {
  if (channel) supabase.removeChannel(channel)
  clearPendingFile()
})
</script>

<template>
  <div
    class="chat"
    @dragover.prevent="dragging = true"
    @dragleave.self="dragging = false"
    @drop.prevent="onDrop"
  >
    <!-- Room header -->
    <header class="chat-header">
      <span class="room-icon"><AppIcon name="chat" :size="20" /></span>
      <div class="room-text">
        <h2>ห้องแชทครอบครัว</h2>
        <p>
          สมาชิก {{ members.length }} คน
          <span v-if="!isLive" class="local-note">· โหมดสาธิต (ข้อความไม่ถูกบันทึก)</span>
        </p>
      </div>
    </header>

    <!-- Messages -->
    <div ref="listEl" class="chat-body">
      <div v-if="loading" class="chat-empty">กำลังโหลดข้อความ...</div>
      <div v-else-if="!timeline.length" class="chat-empty">ยังไม่มีข้อความ — เริ่มทักทายครอบครัวได้เลย 👋</div>

      <template v-for="item in timeline" :key="item.key">
        <div v-if="item.type === 'date'" class="date-chip"><span>{{ item.label }}</span></div>

        <div v-else class="row" :class="{ mine: item.mine, grouped: !item.first }">
          <template v-if="!item.mine">
            <div class="avatar-slot">
              <template v-if="item.showSender">
                <img v-if="senderPhoto(item.msg)" class="avatar" :src="senderPhoto(item.msg)" :alt="senderName(item.msg)" />
                <span v-else class="avatar avatar-fallback">{{ senderName(item.msg).charAt(0) }}</span>
              </template>
            </div>
          </template>

          <div class="stack">
            <span v-if="item.showSender" class="sender">{{ senderName(item.msg) }}</span>

            <div class="line">
              <div class="content">
                <!-- Image -->
                <button
                  v-if="item.msg.attachment_path && isImage(item.msg)"
                  type="button"
                  class="image-bubble"
                  @click="lightboxUrl = item.msg.url"
                >
                  <img v-if="item.msg.url" :src="item.msg.url" :alt="item.msg.attachment_name" loading="lazy" />
                  <span v-else class="image-missing">ไม่พบรูปภาพ</span>
                </button>

                <!-- File -->
                <a
                  v-else-if="item.msg.attachment_path"
                  class="file-bubble"
                  :href="item.msg.url || undefined"
                  :download="item.msg.attachment_name"
                  target="_blank"
                  rel="noopener"
                >
                  <span class="file-icon">{{ fileExt(item.msg.attachment_name) }}</span>
                  <span class="file-meta">
                    <span class="file-name">{{ item.msg.attachment_name }}</span>
                    <span class="file-size">{{ formatSize(item.msg.attachment_size) }} · ดาวน์โหลด</span>
                  </span>
                </a>

                <!-- Text -->
                <div v-if="item.msg.content" class="bubble">{{ item.msg.content }}</div>
              </div>

              <div class="meta">
                <button v-if="item.mine" type="button" class="unsend" title="ยกเลิกการส่ง" @click="unsend(item.msg)">
                  ยกเลิก
                </button>
                <span>{{ timeLabel(item.msg.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <p v-if="errorMessage" class="chat-error">{{ errorMessage }}</p>

    <!-- Pending attachment -->
    <div v-if="pendingFile" class="pending">
      <img v-if="pendingPreview" :src="pendingPreview" alt="ตัวอย่างรูป" class="pending-thumb" />
      <span v-else class="file-icon">{{ fileExt(pendingFile.name) }}</span>
      <span class="pending-meta">
        <span class="file-name">{{ pendingFile.name }}</span>
        <span class="file-size">{{ formatSize(pendingFile.size) }}</span>
      </span>
      <button type="button" class="icon-action" title="นำออก" @click="clearPendingFile">
        <AppIcon name="close" :size="16" />
      </button>
    </div>

    <!-- Composer -->
    <footer class="composer">
      <button type="button" class="icon-action" title="แนบไฟล์" @click="fileInput.click()">
        <AppIcon name="paperclip" :size="20" />
      </button>
      <button type="button" class="icon-action" title="ส่งรูปภาพ" @click="imageInput.click()">
        <AppIcon name="image" :size="20" />
      </button>
      <input ref="fileInput" type="file" hidden @change="onFileInput" />
      <input ref="imageInput" type="file" accept="image/*" hidden @change="onFileInput" />

      <textarea
        ref="textareaEl"
        v-model="draft"
        rows="1"
        placeholder="พิมพ์ข้อความ"
        @input="autoGrow"
        @keydown="onKeydown"
        @paste="onPaste"
      />

      <button
        type="button"
        class="send-btn"
        :disabled="sending || (!draft.trim() && !pendingFile)"
        title="ส่ง"
        @click="send"
      >
        <AppIcon name="send" :size="18" />
      </button>
    </footer>

    <div v-if="dragging" class="drop-overlay">วางไฟล์ที่นี่เพื่อแนบ</div>

    <div v-if="lightboxUrl" class="lightbox" @click="lightboxUrl = ''">
      <img :src="lightboxUrl" alt="รูปภาพ" @click.stop />
      <button type="button" class="lightbox-close" title="ปิด" @click="lightboxUrl = ''">
        <AppIcon name="close" :size="22" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.chat {
  --line-bg: #8cabd9;
  --line-mine: #8de055;

  position: relative;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 130px);
  min-height: 420px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--glass-border);
  background: var(--line-bg);
  box-shadow: var(--shadow-card);
}

/* ---------- Header ---------- */
.chat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  background: #273246;
  color: #ffffff;
}

.room-icon {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #06c755;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.room-text h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
}

.room-text p {
  margin: 2px 0 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.72);
}

.local-note {
  color: #fcd34d;
}

/* ---------- Body ---------- */
.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 14px 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.chat-empty {
  margin: auto;
  padding: 10px 16px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.18);
  color: #ffffff;
  font-size: 13px;
}

.date-chip {
  display: flex;
  justify-content: center;
  margin: 8px 0 4px;
}

.date-chip span {
  padding: 3px 12px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.2);
  color: #ffffff;
  font-size: 11.5px;
}

.row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  max-width: 100%;
}

.row:not(.grouped) {
  margin-top: 6px;
}

.row.mine {
  justify-content: flex-end;
}

.avatar-slot {
  width: 38px;
  flex-shrink: 0;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  background: #ffffff;
  display: block;
}

.avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #dbe6f7;
  color: #1a3f7a;
  font-weight: 700;
  font-size: 15px;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  max-width: min(72%, 520px);
}

.row.mine .stack {
  align-items: flex-end;
}

.sender {
  font-size: 12px;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
}

.line {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  min-width: 0;
}

.row.mine .line {
  flex-direction: row-reverse;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.row.mine .content {
  align-items: flex-end;
}

.bubble {
  position: relative;
  padding: 8px 12px;
  border-radius: 18px;
  background: #ffffff;
  color: #111827;
  font-size: 14px;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
}

.row.mine .bubble {
  background: var(--line-mine);
}

/* หางบับเบิลเฉพาะข้อความแรกของกลุ่ม แบบ Line */
.row:not(.grouped) .content > :first-child.bubble::before {
  content: '';
  position: absolute;
  top: 0;
  width: 12px;
  height: 14px;
}

.row:not(.grouped):not(.mine) .content > :first-child.bubble::before {
  left: -5px;
  background: radial-gradient(circle at 0 100%, transparent 11px, #ffffff 12px);
}

.row.mine:not(.grouped) .content > :first-child.bubble::before {
  right: -5px;
  background: radial-gradient(circle at 100% 100%, transparent 11px, var(--line-mine) 12px);
}

.meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
  font-size: 10.5px;
  color: rgba(255, 255, 255, 0.92);
  white-space: nowrap;
}

.row:not(.mine) .meta {
  align-items: flex-start;
}

.unsend {
  padding: 0;
  border: none;
  background: none;
  color: rgba(255, 255, 255, 0.92);
  font-size: 10.5px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.row:hover .unsend,
.unsend:focus-visible {
  opacity: 1;
  text-decoration: underline;
}

.image-bubble {
  padding: 0;
  border: none;
  border-radius: 14px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.4);
  cursor: zoom-in;
  display: block;
  max-width: 260px;
}

.image-bubble img {
  display: block;
  max-width: 100%;
  max-height: 300px;
  object-fit: cover;
}

.image-missing {
  display: block;
  padding: 24px 28px;
  font-size: 12px;
  color: #475569;
}

.file-bubble {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  background: #ffffff;
  color: #111827;
  min-width: 200px;
  max-width: 280px;
  text-decoration: none;
}

.file-bubble:hover {
  background: #f8fafc;
}

.file-icon {
  width: 40px;
  height: 46px;
  flex-shrink: 0;
  border-radius: 6px;
  background: #1a3f7a;
  color: #ffffff;
  font-size: 10.5px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-meta,
.pending-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.file-name {
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 11.5px;
  color: #64748b;
}

/* ---------- Footer ---------- */
.chat-error {
  margin: 0;
  padding: 8px 16px;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 12.5px;
}

.pending {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  background: #f1f5f9;
  border-top: 1px solid #e2e8f0;
}

.pending-meta {
  flex: 1;
  color: #111827;
}

.pending-thumb {
  width: 46px;
  height: 46px;
  border-radius: 8px;
  object-fit: cover;
}

.composer {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  padding: 10px 12px;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
}

.icon-action {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.icon-action:hover {
  background: #f1f5f9;
  color: #1a3f7a;
}

.composer textarea {
  flex: 1;
  min-width: 0;
  resize: none;
  max-height: 120px;
  padding: 9px 14px;
  margin: 0 4px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: #f1f5f9;
  color: #111827;
  font: inherit;
  font-size: 14px;
  line-height: 1.4;
  outline: none;
}

.composer textarea:focus {
  border-color: #06c755;
  background: #ffffff;
}

.send-btn {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border: none;
  border-radius: 50%;
  background: #06c755;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease, opacity 0.15s ease;
}

.send-btn:hover:not(:disabled) {
  background: #05a948;
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

/* ---------- Overlays ---------- */
.drop-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(6, 199, 85, 0.22);
  border: 3px dashed #06c755;
  border-radius: inherit;
  color: #064e3b;
  font-weight: 700;
  pointer-events: none;
}

.lightbox {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.85);
  cursor: zoom-out;
}

.lightbox img {
  max-width: 100%;
  max-height: 100%;
  border-radius: 8px;
  cursor: default;
}

.lightbox-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

@media (max-width: 640px) {
  .chat {
    height: calc(100dvh - 170px);
  }
  .stack {
    max-width: 80%;
  }
}
</style>
