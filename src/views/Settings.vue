<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import AppIcon from '../components/AppIcon.vue'
import { authUser, demoMode, displayPhoto, linkedMember, signOut, unlinkMember } from '../lib/auth'
import { relationLabels } from '../data/sample'

const router = useRouter()
const errorMessage = ref('')

const accountEmail = computed(() => authUser.value?.email || (demoMode.value ? 'โหมดสาธิต (ไม่ได้เข้าสู่ระบบ)' : '-'))
const profileName = computed(() => linkedMember.value?.full_name || 'ยังไม่ได้ผูกโปรไฟล์')
const profileRole = computed(() =>
  linkedMember.value ? relationLabels[linkedMember.value.relation] || linkedMember.value.relation : 'เลือกตัวตนของคุณเพื่อผูกกับบัญชีนี้'
)
const initials = computed(() =>
  profileName.value.trim().split(' ').map((p) => p[0]).slice(0, 2).join('')
)

async function changeIdentity() {
  errorMessage.value = ''
  const { error } = await unlinkMember()
  if (error) errorMessage.value = error
}

async function handleSignOut() {
  await signOut()
  router.push('/login')
}
</script>

<template>
  <section>
    <PageHeader title="ตั้งค่า" subtitle="จัดการบัญชีและการตั้งค่าระบบ" />

    <p v-if="errorMessage" class="notice notice--error">{{ errorMessage }}</p>

    <div class="data-card profile-card">
      <img v-if="displayPhoto" class="avatar-lg" :src="displayPhoto" :alt="profileName" />
      <div v-else class="avatar-lg">{{ initials }}</div>
      <div class="profile-info">
        <h3>{{ profileName }}</h3>
        <p>{{ profileRole }}</p>
        <div class="contact">
          <span><AppIcon name="mail" :size="15" /> {{ accountEmail }}</span>
        </div>
      </div>
      <div class="profile-actions">
        <router-link v-if="linkedMember" class="btn-ghost" :to="`/members/${linkedMember.id}`">เปิดโปรไฟล์</router-link>
        <button v-if="linkedMember" class="btn-ghost" type="button" @click="changeIdentity">เปลี่ยนตัวตน</button>
        <button class="btn-ghost" type="button" @click="handleSignOut">
          <AppIcon name="logout" :size="15" /> ออกจากระบบ
        </button>
      </div>
    </div>

    <div class="data-card options">
      <div class="option-row">
        <div>
          <h4>การแจ้งเตือนทางอีเมล</h4>
          <p>รับการแจ้งเตือนประกันใกล้หมดอายุและสวัสดิการทางอีเมล</p>
        </div>
        <label class="switch">
          <input type="checkbox" checked />
          <span class="slider" />
        </label>
      </div>
      <div class="option-row">
        <div>
          <h4>โหมดสองปัจจัย (2FA)</h4>
          <p>เพิ่มความปลอดภัยให้บัญชีของคุณ</p>
        </div>
        <label class="switch">
          <input type="checkbox" />
          <span class="slider" />
        </label>
      </div>
    </div>
  </section>
</template>

<style scoped>
.profile-card {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 22px 24px;
  margin-bottom: 18px;
}

.avatar-lg {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #f4a95c;
  color: #fff;
  font-weight: 700;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid var(--border-color);
  flex-shrink: 0;
}

.profile-info {
  flex: 1;
}

.profile-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

img.avatar-lg {
  object-fit: cover;
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

.profile-info h3 {
  margin: 0;
  color: var(--text-on-dark);
  font-size: 17px;
}

.profile-info p {
  margin: 2px 0 8px;
  color: var(--text-on-dark-soft);
  font-size: 13px;
}

.contact {
  display: flex;
  gap: 16px;
  color: var(--text-on-dark-soft);
  font-size: 13px;
}

.contact span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.options {
  padding: 6px 24px;
}

.option-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
}

.option-row:last-child {
  border-bottom: none;
}

.option-row h4 {
  margin: 0;
  color: var(--text-on-dark);
  font-size: 14.5px;
}

.option-row p {
  margin: 4px 0 0;
  color: var(--text-on-dark-soft);
  font-size: 12.5px;
}

.switch {
  position: relative;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  inset: 0;
  background: #cbd5e1;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.18s ease;
}

.slider::before {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  left: 3px;
  top: 3px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.18s ease;
}

.switch input:checked + .slider {
  background: var(--accent-green);
}

.switch input:checked + .slider::before {
  transform: translateX(20px);
}
</style>
