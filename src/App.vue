<template>
  <router-view />
</template>
<script setup>
import { setToken } from '@/utils/auth'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
const settings = computed(() => {
  return appStore.settings
})
</script>
