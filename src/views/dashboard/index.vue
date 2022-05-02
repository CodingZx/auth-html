<template>
  <div>
    <img :src="emptyGif" class="emptyGif" />
  </div>
</template>

<script setup>
import { toRefs, reactive, computed } from 'vue'
const state = reactive({
  emptyGif: 'https://wpimg.wallstcn.com/0e03b7da-db9e-4819-ba10-9016ddfdaed3'
})
let { emptyGif } = toRefs(state)
</script>

<style lang="scss" scoped>
.emptyGif {
  display: block;
  width: 100%;
  margin: 0 auto;
}
</style>
