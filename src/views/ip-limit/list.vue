<template>
  <div class="app-container scroll-y">
    <el-table ref="dataTable" v-loading="listLoading" :data="list" element-loading-text="加载中" border highlight-current-row :height="tableHeight">
      <el-table-column label="IP地址" width="300" align="center">
        <template #default="scope">
          {{ scope.row.refIP }}
        </template>
      </el-table-column>

      <el-table-column label="账号信息" align="center" >
        <template #default="scope">
          <el-tooltip
            v-for="item in scope.row.accounts" :key="item.key" 
            effect="dark"
            :content="'账号:' + item.account + ' 密码:' + item.password"
            placement="top"
          >
            <el-tag style="margin-top: 3px; margin-left:3px">{{ item.account }}</el-tag>
          </el-tooltip>
        </template>
      </el-table-column>
      
      <el-table-column label="限制时间" align="center" width="180">
        <template #default="scope">
          {{ scope.row.createTime }}
        </template>
      </el-table-column>

      <el-table-column v-permission="['ip:limit:delete']" label="操作" align="center" width="120">
        <template #default="scope">
          <el-tooltip content="删除" placement="top">
            <el-button v-permission="['ip:limit:delete']" type="danger" :icon="Delete" circle @click="handleDeleteRow(scope.row.id)" />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <Pagination v-model:page='listQuery.page' v-model:limit='listQuery.size' :total='count' @pagination='fetchData' />
  </div>
</template>

<script setup>
import Pagination from '@/components/Pagination/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Edit, Plus, Search, Key, Close, Select } from '@element-plus/icons-vue'
import { getList, remove } from '@/api/ip-limit'

const dataTable = ref(null)

const tableHeight = ref('calc(100vh - 70px  - 100px)')

const state = reactive({
  list: [],
  count: 0,
  listLoading: true,
  listQuery: {
    page: 1,
    size: 20,
  },
})

//导出属性到页面中使用
const { list, listLoading, listQuery, count } = toRefs(state)

onBeforeMount(() => {
  fetchData()
})

const fetchData = () => {

  state.listLoading = true
  getList(state.listQuery).then((response) => {
    var data = response.data
    state.list = data.data
    state.count = data.count
    state.listLoading = false
  }).catch((e) => {
    ElMessage.error(e.message)
  }) 
}

const handleDeleteRow = (id) => {
  ElMessageBox.confirm(
    '确定要删除此记录吗?',
    '提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'danger',
    }
  ).then(() => {
    remove(id).then((response) => {
      ElMessage({
        message: '删除成功',
        type: 'success',
      })

      fetchData()
    }).catch((e) => {
      ElMessage.error(e.message)
    }) 
  }).catch(() => {
    console.log("cancel")
  })
}

</script>

<style scoped lang="scss"></style>
