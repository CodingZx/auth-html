<template>
  <div class="app-container scroll-y">
    <div class="filter-container" >
      <el-form :inline="true" >
        <el-form-item label=" 状态">
            <el-select v-model="listQuery.status" placeholder="请选择" @change="fetchData">
                  <el-option label="全部" value="-99"></el-option>
                  <el-option label="待处理" value="0"></el-option>
                  <el-option label="已处理" value="1"></el-option>
                  <el-option label="已忽略" value="-1"></el-option>
              </el-select>
        </el-form-item>
      </el-form>
    </div>

    <el-table ref="dataTable" v-loading="listLoading" :data="list" element-loading-text="加载中" border highlight-current-row :height="tableHeight">
      <el-table-column label="缩略信息" width="250" align="center">
        <template #default="scope">

          <el-tooltip :content="scope.row.logMsg" placement="top">
            <span>{{ ellipsis(scope.row.logMsg) }}</span>
          </el-tooltip>
        </template>
      </el-table-column>

      <el-table-column label="处理状态"  width="130"  align="center">
        <template #default="scope">
          <el-tag v-if="scope.row.status == 0" type="warning" >待处理</el-tag>
          <el-tag v-if="scope.row.status == 1" type="success" >已处理</el-tag>
          <el-tag v-if="scope.row.status == -1" type="info" >已忽略</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="上报次数" width="120" align="center">
        <template #default="scope">
          {{ scope.row.counter }}
        </template>
      </el-table-column>
      
      <el-table-column label="上报时间" align="center">
        <template #default="scope">
          {{ scope.row.createTime }}
        </template>
      </el-table-column>

      <el-table-column label="最后上报时间" align="center">
        <template #default="scope">
          {{ scope.row.lastReportTime }}
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-tooltip content="详情" placement="top">
              <el-button circle :icon="Opportunity" @click="handleDetail(scope.row.id)" />
          </el-tooltip>
          <el-tooltip content="下载" placement="top">
              <el-button v-permission="['exception:log:download']" circle type="info" :icon="Download" @click="handleDownload(scope.row.id)" />
          </el-tooltip>
          <el-tooltip v-if="scope.row.status == 0" content="处理"  placement="top">
              <el-button v-permission="['exception:log:status']" circle type="success" :icon="Check" @click="handleProcess(scope.row.id)" />
          </el-tooltip>
          <el-tooltip v-if="scope.row.status == 0"  content="忽略"  placement="top">
              <el-button v-permission="['exception:log:status']" circle type="info" :icon="Close" @click="handleIgnore(scope.row.id)" />
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button v-permission="['exception:log:delete']" type="danger" :icon="Delete" circle @click="handleDeleteRow(scope.row.id)" />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <Pagination v-model:page='listQuery.page' v-model:limit='listQuery.size' :total='count' @pagination='fetchData' />

    <el-dialog v-model="dialogFormVisible" :close-on-click-modal="false" title="详细信息" width="60%">
      <el-form :model="temp" label-width="100px" class="interfaceForm">
        <el-row>
            <el-col :span="12">
                <el-form-item label="上报次数:">
                    {{temp.counter}}
                </el-form-item>
            </el-col>
        </el-row>

        <el-row>
            <el-col :span="12">
                <el-form-item label="上报时间:">
                    {{temp.createTime}}
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item label="最后上报时间:">
                    {{temp.lastReportTime}}
                </el-form-item>
            </el-col>
        </el-row>

        <el-form-item label="缩略信息:">
            {{temp.logMsg}}
        </el-form-item>
        <el-form-item label="完整日志:">
            {{temp.msgDetail}}
        </el-form-item>
      </el-form>
    </el-dialog>
  
  </div>
</template>

<script setup>
import Pagination from '@/components/Pagination/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Edit, Plus, Search, Key, Check, Close, Opportunity, Download } from '@element-plus/icons-vue'
import { getReportList, findReportDetail, setReportStatus, deleteReport, downloadReport } from '@/api/exception-log'
import { nextTick } from 'process'

const dataTable = ref(null)
const tableHeight = ref('calc(100vh - 70px - 40px - 20px - 100px)')

const state = reactive({
  list: [],
  count: 0,
  listLoading: true,
  listQuery: {
    page: 1,
    size: 20,
    status: "-99",
  },
  dialogFormVisible: false,
  temp: {},
})

//导出属性到页面中使用
const { list, listLoading, listQuery, count, dialogFormVisible, temp } = toRefs(state)

onBeforeMount(() => {
  fetchData()
})

const filterData = () => {
  state.listQuery.page = 1
  fetchData()
}

const fetchData = () => {

  state.listLoading = true
  getReportList(state.listQuery).then((response) => {
    var data = response.data
    state.list = data.data
    state.count = data.count
    state.listLoading = false
  }).catch((e) => {
    ElMessage.error(e.message)
  }) 
}


const handleDetail = (id) => {
  findReportDetail(id).then(response => {
      state.temp = response.data
      state.dialogFormVisible = true;
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
    deleteReport(id).then((response) => {
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

const handleProcess = (id) => {
  ElMessageBox.confirm(
    '确定要更改为已处理吗?',
    '提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'danger',
    }
  ).then(() => {
    setReportStatus(id, 1).then((response) => {
      ElMessage({
        message: '操作成功',
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

const handleIgnore = (id) => {
  ElMessageBox.confirm(
    '确定要更改为忽略吗?',
    '提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'danger',
    }
  ).then(() => {
    setReportStatus(id, -1).then((response) => {
      ElMessage({
        message: '操作成功',
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

const handleDownload = (id) => {
  downloadReport(id).then(res => {
      const url = URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = url;
      link.setAttribute("download", 'report');
      document.body.appendChild(link);
      link.click();
      link.remove();
  })
}

const ellipsis = (value) => {
    if (!value) return ''
    if (value.length > 20) {
        return value.slice(0,20) + '...'
    }
    return value
}
</script>

<style scoped lang="scss"></style>
