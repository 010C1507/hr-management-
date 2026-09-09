<script setup>
import PageHeader from '../components/PageHeader.vue'
import AppIcon from '../components/AppIcon.vue'

const profile = {
  name: 'เอกชัย ชาวราช',
  email: 'eak.chawarat@gmail.com',
  role: 'เจ้าของครอบครัว',
}
</script>

<template>
  <section>
    <PageHeader title="ตั้งค่า" subtitle="จัดการโปรไฟล์และการตั้งค่าระบบ" />

    <div class="data-card profile-card">
      <div class="avatar-lg">EC</div>
      <div class="profile-info">
        <h3>{{ profile.name }}</h3>
        <p>{{ profile.role }}</p>
        <div class="contact">
          <span><AppIcon name="mail" :size="15" /> {{ profile.email }}</span>
        </div>
      </div>
      <button class="btn-ghost" type="button">แก้ไขโปรไฟล์</button>
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
