<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DashboardLayout from './layouts/DashboardLayout.vue'

const route = useRoute()
const plainLayout = computed(() => route.meta.layout === 'plain')
</script>

<template>
  <router-view v-if="plainLayout" />
  <DashboardLayout v-else />
</template>
