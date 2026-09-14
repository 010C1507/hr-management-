import { computed, ref } from 'vue'
import { supabase, isSupabaseConfigured } from './supabase'

const DEMO_MODE_KEY = 'household-registry:demo-mode'

function readDemoFlag() {
  try {
    return localStorage.getItem(DEMO_MODE_KEY) === '1'
  } catch {
    return false
  }
}

function writeDemoFlag(value) {
  try {
    if (value) localStorage.setItem(DEMO_MODE_KEY, '1')
    else localStorage.removeItem(DEMO_MODE_KEY)
  } catch {
    /* โหมดส่วนตัวของเบราว์เซอร์อาจปิด localStorage — ไม่ถือเป็นข้อผิดพลาด */
  }
}

export const session = ref(null)
export const linkedMember = ref(null)
export const authError = ref('')
export const demoMode = ref(readDemoFlag())
export const authLoading = ref(false)

export const authUser = computed(() => session.value?.user ?? null)
export const isSignedIn = computed(() => Boolean(session.value))
export const isAuthenticated = computed(() => demoMode.value || isSignedIn.value)
export const needsProfileLink = computed(() => isSignedIn.value && !linkedMember.value)

export const displayName = computed(() => {
  if (linkedMember.value) return linkedMember.value.nickname || linkedMember.value.full_name
  const user = authUser.value
  return user?.user_metadata?.full_name || user?.email || 'ผู้ใช้งาน'
})

export const displayPhoto = computed(
  () => linkedMember.value?.photo_url || authUser.value?.user_metadata?.avatar_url || ''
)

let readyPromise = null

export function initAuth() {
  if (readyPromise) return readyPromise

  readyPromise = (async () => {
    if (!isSupabaseConfigured) return

    const { data } = await supabase.auth.getSession()
    session.value = data.session ?? null

    supabase.auth.onAuthStateChange((_event, nextSession) => {
      session.value = nextSession ?? null
      if (!nextSession) linkedMember.value = null
      else loadLinkedMember()
    })

    if (session.value) await loadLinkedMember()
  })()

  return readyPromise
}

export async function loadLinkedMember() {
  if (!isSupabaseConfigured || !session.value) {
    linkedMember.value = null
    return
  }

  const { data: link, error } = await supabase
    .from('member_accounts')
    .select('member_id')
    .eq('user_id', session.value.user.id)
    .maybeSingle()

  if (error) {
    authError.value = 'อ่านข้อมูลการผูกโปรไฟล์ไม่สำเร็จ (อาจยังไม่ได้รัน migration 006): ' + error.message
    linkedMember.value = null
    return
  }

  if (!link) {
    linkedMember.value = null
    return
  }

  const { data: member } = await supabase
    .from('family_members')
    .select('*')
    .eq('id', link.member_id)
    .maybeSingle()

  linkedMember.value = member ?? null
}

export async function signInWithGoogle() {
  authError.value = ''
  if (!isSupabaseConfigured) {
    authError.value = 'ยังไม่ได้ตั้งค่า Supabase — เข้าสู่ระบบด้วย Google ไม่ได้'
    return
  }

  authLoading.value = true
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  })
  authLoading.value = false

  if (error) authError.value = 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ: ' + error.message
}

export async function signOut() {
  authError.value = ''
  if (isSupabaseConfigured) await supabase.auth.signOut()
  session.value = null
  linkedMember.value = null
  exitDemoMode()
}

export async function linkToMember(memberId) {
  if (!session.value) return { error: 'ยังไม่ได้เข้าสู่ระบบ' }

  authLoading.value = true
  const { error } = await supabase.from('member_accounts').upsert(
    {
      user_id: session.value.user.id,
      member_id: memberId,
      email: session.value.user.email,
    },
    { onConflict: 'user_id' }
  )
  authLoading.value = false

  if (error) {
    // unique_violation: โปรไฟล์นี้ถูกบัญชีอื่นจองไปแล้ว
    if (error.code === '23505') return { error: 'โปรไฟล์นี้ถูกผูกกับบัญชีอื่นไปแล้ว กรุณาเลือกโปรไฟล์อื่น' }
    return { error: 'ผูกโปรไฟล์ไม่สำเร็จ: ' + error.message }
  }

  await loadLinkedMember()
  return {}
}

export async function unlinkMember() {
  if (!session.value) return { error: 'ยังไม่ได้เข้าสู่ระบบ' }

  const { error } = await supabase.from('member_accounts').delete().eq('user_id', session.value.user.id)
  if (error) return { error: 'ยกเลิกการผูกโปรไฟล์ไม่สำเร็จ: ' + error.message }

  linkedMember.value = null
  return {}
}

export function enterDemoMode() {
  demoMode.value = true
  writeDemoFlag(true)
}

export function exitDemoMode() {
  demoMode.value = false
  writeDemoFlag(false)
}
