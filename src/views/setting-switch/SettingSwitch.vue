<template>
  <div class="scroll-y">
    <h3 class="mb-2">props operate demo of settings.js</h3>
    <div class="rowSS">
      <div class="mb-1">
        page layout related
       
      </div>
    </div>
    <div class="mt-2 mb-1">store.commit to change</div>
  </div>
</template>

<script setup>
import { useAppStore } from '@/store/app'

const settings = computed(() => {
  return appStore.settings || {}
})

const appStore = useAppStore()

const source = ref(false)
const sourceFun = () => {
  source.value = !source.value
}
const handle = () => {
  new Promise((resolve, reject) => {
    reject('reject promise')
  }).then((res) => {
    console.log('ok')
  })
}

const flag = ref(null)

const consoleErrorFun = () => {
  console.error('console.error')
}

const normalError = () => {
  throw new Error(' throw new Error("")\n')
}
const { proxy } = getCurrentInstance()
const updateReq = () => {
  return proxy
    .$axiosReq({
      // baseURL: 'http://8.135.1.141/micro-service-test',
      url: '/integration-front/brand/updateBy',
      data: { id: 'fai' },
      method: 'put',
      isParams: true,
      bfLoading: true
    })
    .then(() => {})
  // .catch((err) => {
  //   console.log('接口catch', err)
  // })
}
</script>

<style scoped lang="scss"></style>
