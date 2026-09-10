<script setup>
import AppIcon from './AppIcon.vue'

defineProps({
  member: { type: Object, required: true },
  relationLabel: { type: String, default: '' },
  highlight: { type: Boolean, default: false },
})

const emit = defineEmits(['focus', 'view'])

function initials(name) {
  return name ? name.trim().split(' ').map((p) => p[0]).slice(0, 2).join('') : '-'
}

function ageLabel(birthDate) {
  if (!birthDate) return ''
  const birth = new Date(birthDate)
  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  if (now.getMonth() - birth.getMonth() < 0) years -= 1
  return years < 1 ? 'ต่ำกว่า 1 ปี' : `${years} ปี`
}
</script>

<template>
  <div
    class="tree-node"
    :class="{ highlight }"
    role="button"
    tabindex="0"
    :title="highlight ? 'มุมมองปัจจุบัน' : `มองจากมุมมองของ ${member.full_name}`"
    @click="emit('focus')"
    @keydown.enter.prevent="emit('focus')"
    @keydown.space.prevent="emit('focus')"
  >
    <img v-if="member.photo_url" class="node-avatar" :src="member.photo_url" :alt="member.full_name" />
    <span v-else class="node-avatar node-initials">{{ initials(member.full_name) }}</span>
    <span class="node-name">{{ member.full_name }}</span>
    <span class="node-relation">{{ relationLabel }}</span>
    <span v-if="member.birth_date" class="node-age">{{ ageLabel(member.birth_date) }}</span>
    <button class="node-open" type="button" title="เปิดโปรไฟล์" @click.stop="emit('view')">
      <AppIcon name="chevronRight" :size="14" />
    </button>
  </div>
</template>

<style scoped>
.tree-node {
  position: relative;
  width: 136px;
  padding: 12px 10px 10px;
  border-radius: 14px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  box-shadow: var(--shadow-soft);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-family: inherit;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.tree-node:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(26, 63, 122, 0.14);
}

.tree-node:focus-visible {
  outline: 2px solid #1a3f7a;
  outline-offset: 2px;
}

.tree-node.highlight {
  background: linear-gradient(135deg, #1a3f7a, #2d6bd6);
  border-color: transparent;
  cursor: default;
}

.node-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--surface-bg);
  border: 3px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.node-initials {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #1e3a5f;
  background: var(--accent-blue);
}

.node-name {
  margin-top: 4px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-on-dark);
  text-align: center;
  line-height: 1.3;
}

.node-relation {
  font-size: 11.5px;
  font-weight: 600;
  color: #1a3f7a;
  background: #e8effa;
  padding: 2px 9px;
  border-radius: 999px;
  text-align: center;
}

.node-age {
  font-size: 11px;
  color: var(--text-on-dark-faint);
}

.node-open {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 22px;
  height: 22px;
  padding: 0;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background: var(--surface-bg);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s ease, background 0.15s ease;
}

.tree-node:hover .node-open,
.tree-node:focus-within .node-open {
  opacity: 1;
}

.node-open:hover {
  background: #dde6f5;
  color: #1a3f7a;
}

.highlight .node-name {
  color: #fff;
}

.highlight .node-relation {
  color: #1a3f7a;
  background: #fff;
}

.highlight .node-age {
  color: rgba(255, 255, 255, 0.8);
}

.highlight .node-open {
  opacity: 1;
  background: rgba(255, 255, 255, 0.9);
  border-color: transparent;
  color: #1a3f7a;
}
</style>
