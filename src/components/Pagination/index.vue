<template>
  <div class="pagination-container">
    <el-pagination
      v-model:currentPage="currentPage"
      v-model:page-size="pageSize"
      :background="background"
      :layout="layout"
      :page-sizes="pageSizes"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup>
import { scrollTo } from '@/utils/scroll-to'
import { computed, ref } from 'vue'

const emit = defineEmits(['update:page', 'update:limit', 'pagination'])

const props = defineProps({
  total: {
    require: true,
    type: Number
  },
  page: {
    type: Number,
    default: 1
  },
  limit: {
    type: Number,
    default: 10
  },
  pageSizes: {
    type: Array,
    default() {
      return [20, 30, 50, 100]
    }
  },
  layout: {
    type: String,
    default: 'total, sizes, prev, pager, next'
  },
  background: {
    type: Boolean,
    default: true
  },
  autoScroll: {
    type: Boolean,
    default: true
  },
  hidden: {
    type: Boolean,
    default: false
  }
})
const currentPage = computed({
  get() {
    return props.page
  },
  set(val) {
    emit('update:page', val)
  }
})
const pageSize = computed({
  get() {
    return props.limit
  },
  set(val) {
    emit('update:limit', val)
  }
})

const handleSizeChange = (val) => {
  emit('pagination', { page: currentPage, limit: val })
  if (ref(props.autoScroll).value) {
    scrollTo(0, 800)
  }
}
const handleCurrentChange = (val) => {
  emit('pagination', { page: val, limit: pageSize })
  if (ref(props.autoScroll).value) {
    scrollTo(0, 800)
  }
}
</script>

<style scoped>
.pagination-container {
  background: #fff;
  padding-top: 20px;
  padding-left: 16px;
  /*text-align: center;*/
}
.pagination-container.hidden {
  display: none;
}
</style>
