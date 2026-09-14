<script setup>
import { computed } from 'vue'
import { isSupabaseConfigured } from '../lib/supabase'
import { authError, authLoading, enterDemoMode, signInWithGoogle } from '../lib/auth'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const canUseGoogle = computed(() => isSupabaseConfigured)

function startDemo() {
  enterDemoMode()
  router.replace(route.query.redirect || '/')
}
</script>

<template>
  <main class="login-page">
    <div class="login-card">
      <div class="brand">
        <span class="brand-mark">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 20V11M10 20V5M16 20v-8M22 20H2" />
          </svg>
        </span>
        <div>
          <h1>Household Registry</h1>
          <p>ทะเบียนครัวเรือนของครอบครัวคุณ</p>
        </div>
      </div>

      <p class="intro">เข้าสู่ระบบเพื่อดูและจัดการข้อมูลสมาชิก พัฒนาการลูก ประกัน และสวัสดิการของครอบครัว</p>

      <button v-if="canUseGoogle" class="google-btn" type="button" :disabled="authLoading" @click="signInWithGoogle">
        <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">
          <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
          <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
          <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z" />
          <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
        </svg>
        {{ authLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Google' }}
      </button>

      <p v-if="authError" class="notice notice--error">{{ authError }}</p>

      <div v-if="!canUseGoogle" class="demo-block">
        <p class="notice">
          ยังไม่ได้ตั้งค่า Supabase (<code>VITE_SUPABASE_URL</code> / <code>VITE_SUPABASE_ANON_KEY</code>)
          จึงยังเข้าสู่ระบบด้วย Google ไม่ได้ — ดูวิธีตั้งค่าใน README
        </p>
        <button class="btn-ghost" type="button" @click="startDemo">เข้าดูโหมดสาธิต (ข้อมูลตัวอย่าง)</button>
      </div>

      <p class="footnote">หลังเข้าสู่ระบบครั้งแรก ระบบจะให้เลือกว่าคุณคือสมาชิกคนไหนในครอบครัว แล้วจดจำไว้ให้ครั้งถัดไป</p>
    </div>
  </main>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(180deg, #0b2a5c 0%, #0f3a73 42%, #1653a8 78%, #1c62c9 100%);
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 20px;
  padding: 32px 30px;
  box-shadow: 0 24px 60px -20px rgba(6, 24, 54, 0.5);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-mark {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, #4a9eff 0%, #1a63d8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 16px -4px rgba(26, 99, 216, 0.6);
}

.brand h1 {
  margin: 0;
  font-size: 19px;
  color: #12305e;
}

.brand p {
  margin: 2px 0 0;
  font-size: 12.5px;
  color: var(--text-muted);
}

.intro {
  margin: 22px 0;
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--text-secondary);
}

.google-btn {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  background: #fff;
  color: #1f2937;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
}

.google-btn:hover:not(:disabled) {
  background: #f6f9ff;
  border-color: #b8cef0;
  transform: translateY(-1px);
}

.google-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.notice {
  margin: 16px 0 0;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  background: #eff6ff;
  color: var(--text-secondary);
  font-size: 12.5px;
  line-height: 1.55;
  border: 1px solid #bfdbfe;
}

.notice--error {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}

.demo-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 4px;
}

.demo-block .btn-ghost {
  justify-content: center;
}

.footnote {
  margin: 22px 0 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-muted);
  border-top: 1px solid var(--border-color);
  padding-top: 16px;
}
</style>
