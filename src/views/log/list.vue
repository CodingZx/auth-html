<template>
  <div class="app-container scroll-y">
     <div class="filter-container" >
        <el-form :inline="true" >
          <el-form-item label=" 操作人：">
              <el-input v-model.trim="listQueryCopy.operName"  />
          </el-form-item>
          <el-form-item label=" 时间：">
            <el-date-picker
              v-model="listQueryCopy.time"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>

          <el-form-item label="">
              <el-button class="filter-item" type="primary" :icon="Search" @click="filterData">
                  查询
              </el-button>
          </el-form-item>
        </el-form>

        <el-form v-permission="['auth:role:delete', 'auth:role:clear']" :inline="true" >
          <el-form-item label="">
            
            <el-button v-permission="['auth:log:delete']" class="filter-item" type="danger" :icon="Delete" @click="handleDeleteSelected">
                删除
            </el-button>
            <el-button v-permission="['auth:log:clear']" class="filter-item" type="danger" :icon="Plus" @click="handleClear">
                清空
            </el-button>
          </el-form-item>
        </el-form>
      </div>

    <el-table ref="dataTable" v-loading="listLoading" :data="list" element-loading-text="加载中" border highlight-current-row :height="tableHeight">
      <el-table-column type="selection" width="55" />
      <el-table-column label="操作"  align="center">
        <template #default="scope">
          {{ scope.row.title }}
        </template>
      </el-table-column>
      <el-table-column label="URI"  align="center">
        <template #default="scope">
          {{ scope.row.uri }}
        </template>
      </el-table-column>
      <el-table-column label="请求方式"  align="center">
        <template #default="scope">
          <el-tag v-if="scope.row.requestMethod == 'PUT'">PUT</el-tag>
          <el-tag v-if="scope.row.requestMethod == 'GET'" type="success">GET</el-tag>
          <el-tag v-if="scope.row.requestMethod == 'POST'" type="info">POST</el-tag>
          <el-tag v-if="scope.row.requestMethod == 'DELETE'" type="danger">DELETE</el-tag>
        </template>
      </el-table-column>
       <el-table-column label="操作人"  align="center">
        <template #default="scope">
          {{ scope.row.operName }}
        </template>
      </el-table-column>
      
      <el-table-column label="创建时间" align="center">
        <template #default="scope">
          {{ scope.row.createTime }}
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-tooltip content="详情" placement="top">
            <el-button type="info"  :icon="Document" circle @click="handleDetail(scope.row.id)" />
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button v-permission="['auth:log:delete']" type="danger" :icon="Delete" circle @click="handleDeleteRow(scope.row.id)" />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <Pagination v-model:page='listQuery.page' v-model:limit='listQuery.size' :total='count' @pagination='fetchData' />
    <el-dialog v-model="dialogFormVisible" :close-on-click-modal="false" title="详情" width="60%">
      <el-form :model="temp" label-width="100px" class="interfaceForm">
          <el-row>
              <el-col :span="12">
                  <el-form-item label="标题:">
                      {{temp.title}}
                  </el-form-item>
                    <el-form-item label="请求地址:">
                      {{temp.uri}}
                  </el-form-item>
              </el-col>

              <el-col :span="12">
                  <el-form-item label="操作类型:">
                      {{temp.type}}
                  </el-form-item>
                  
                  <el-form-item label="请求方式:">
                      {{temp.requestMethod}}
                  </el-form-item>
              </el-col>
          </el-row>
          <el-form-item label="操作人:">
              {{temp.operName}} &nbsp;&nbsp;|&nbsp;&nbsp; {{temp.ip}} &nbsp;&nbsp;|&nbsp;&nbsp; {{temp.createTime}}
          </el-form-item>
          <el-form-item label="请求方法:">
              {{temp.method}}
          </el-form-item>
          <el-form-item label="请求参数:">
              {{temp.operParam}}
          </el-form-item>
          <el-form-item v-if="temp.errorMsg != ''" label="错误信息:">
              {{temp.errorMsg}}
          </el-form-item>
      </el-form>
  </el-dialog>
  </div>
</template>

<script setup>
import Pagination from '@/components/Pagination/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Edit, Plus, Search, Document } from '@element-plus/icons-vue'
import { getLogList, deleteLog, clearLog, findLogDetail } from '@/api/log'

const dataTable = ref(null)
const tableHeight = ref(`calc(100vh - 70px - 40px - 50px - 20px - 100px)`)

const state = reactive({
  list: [],
  count: 0,
  listLoading: true,
  listQuery: {
    page: 1,
    size: 20,
    operName: "",
    start:"",
    end:"",
  },
  listQueryCopy: {
    operName:"",
    time:[],
  },
  dialogFormVisible: false,
 
  temp: {},
})

//导出属性到页面中使用
const { list, listLoading, listQuery, listQueryCopy, count, dialogFormVisible, temp, } = toRefs(state)

onBeforeMount(() => {
  fetchData()
})

const filterData = () => {
  state.listQuery.page = 1
  state.listQuery.operName = state.listQueryCopy.operName
  if(state.listQueryCopy.time && state.listQueryCopy.time.length > 0) {
    state.listQuery.start = state.listQueryCopy.time[0]
    state.listQuery.end = state.listQueryCopy.time[1]
  } else {
    state.listQuery.start = ""
    state.listQuery.end = ""
  }


  fetchData()
}

const fetchData = () => {

  state.listLoading = true
  getLogList(state.listQuery).then((response) => {
    var data = response.data
    state.list = data.data
    state.count = data.count
    state.listLoading = false
  }).catch((e) => {
    ElMessage.error(e.message)
  }) 
}

const handleDetail = (id) => {
  findLogDetail(id).then((response) => {
    state.temp = response.data

    state.dialogFormVisible = true
  }).catch((e) => {
    ElMessage.error(e.message)
  }) 
}

const handleDeleteSelected = () => {
  var selections = dataTable.value.getSelectionRows().map((m) => m.id)
  if(selections.length == 0) return

  ElMessageBox.confirm(
    '确定要删除选中的记录吗?',
    '提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'danger',
    }
  ).then(() => {
    deleteLog(selections).then((response) => {
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
    deleteLog(id).then((response) => {
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

const handleClear = () => {
  ElMessageBox.confirm(
    '确定要清空所有记录吗?',
    '提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'danger',
    }
  ).then(() => {
    clearLog().then((response) => {
      ElMessage({
        message: '清空成功',
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

<style scoped lang="scss">

</style>
