<template>
  <div class="app-container scroll-y">
     <div class="filter-container" >
        <el-form :inline="true" >
          <el-form-item label=" 账号：">
              <el-input v-model.trim="listQueryCopy.userName" />
          </el-form-item>

          <el-form-item label=" 真实姓名：">
              <el-input v-model.trim="listQueryCopy.realName" />
          </el-form-item>
          <el-form-item label="">
              <el-button class="filter-item" type="primary" :icon="Search" @click="filterData">
                  查询
              </el-button>
          </el-form-item>
        </el-form>

        <el-form v-permission="['auth:admin:delete', 'auth:admin:add']" :inline="true" >
          <el-form-item label="">
            <el-button v-permission="['auth:admin:add']" class="filter-item" type="primary" :icon="Plus" @click="handleCreate">
                新增
            </el-button>
            <el-button v-permission="['auth:admin:delete']" class="filter-item" type="danger" :icon="Delete" @click="handleDeleteSelected">
                删除
            </el-button>
          </el-form-item>
        </el-form>
      </div>

    <el-table ref="dataTable" v-loading="listLoading" :data="list" element-loading-text="加载中" border highlight-current-row :height="tableHeight">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="账号" width="200" align="center">
        <template #default="scope">
          {{ scope.row.userName }}
        </template>
      </el-table-column>

      <el-table-column label="姓名" align="center">
        <template #default="scope">
          <span>{{ scope.row.realName }}</span>
        </template>
      </el-table-column>

      <el-table-column label="角色" align="center">
        <template #default="scope">
          {{ scope.row.roleName }}
        </template>
      </el-table-column>

      <el-table-column label="状态" align="center">
        <template #default="scope">
          <el-tag v-if="scope.row.status" type="success">启用</el-tag>
          <el-tag v-else type="danger">禁用</el-tag>
        </template>
      </el-table-column>
      
      <el-table-column label="创建时间" align="center">
        <template #default="scope">
          {{ scope.row.createTime }}
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-tooltip content="禁用" placement="top">
            <el-button v-if="scope.row.status" v-permission="['auth:admin:status']" type="danger" :icon="Close" circle @click="handleUpdateStatus(scope.row.id, false)" />
          </el-tooltip>
          <el-tooltip content="启用" placement="top">
            <el-button v-if="!scope.row.status" v-permission="['auth:admin:status']" type="success" :icon="Select" circle @click="handleUpdateStatus(scope.row.id, true)" />
          </el-tooltip>
          <el-tooltip content="重置密码" placement="top">
            <el-button v-permission="['auth:admin:reset']" type="info" :icon="Key" circle @click="handleToResetPwd(scope.row.id)" />
          </el-tooltip>
          <el-tooltip content="编辑" placement="top">
            <el-button v-permission="['auth:admin:edit']" type="info" :icon="Edit" circle @click="handleUpdate(scope.row)" />
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button v-permission="['auth:admin:delete']" type="danger" :icon="Delete" circle @click="handleDeleteRow(scope.row.id)" />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <Pagination v-model:page='listQuery.page' v-model:limit='listQuery.size' :total='count' @pagination='fetchData' />

    <el-dialog v-model="dialogFormVisible" :close-on-click-modal="false" :title="dialogTitle" width="40%">
      <el-form :model="temp" label-width="80px" class="interfaceForm">
        <el-form-item label="用户名:" >
          <el-input v-model="temp.userName" autocomplete="off" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item v-if="showPwd" label="密码:">
            <el-input v-model="temp.password" autocomplete="off" show-password />
        </el-form-item>
        <el-form-item label="真实姓名:" >
          <el-input v-model="temp.realName" autocomplete="off" />
        </el-form-item>
        <el-form-item label="角色:" >
          <el-select v-model="temp.roleId" placeholder="请选择角色" :teleported="false">
            <el-option
                v-for="item in roles"
                :key="item.id"
                :label="item.name"
                :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">确认</el-button>
        </span>
      </template>
  </el-dialog>
  <el-dialog v-model="dialogResetFormVisible" :close-on-click-modal="false" title="重置密码" width="40%">
      <el-form :model="reset" label-width="80px" class="interfaceForm">
        <el-form-item label="密码:">
            <el-input v-model="reset.password" autocomplete="off" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogResetFormVisible = false">取消</el-button>
          <el-button type="primary" @click="handleReset">确认</el-button>
        </span>
      </template>
  </el-dialog>
  </div>
</template>

<script setup>
import Pagination from '@/components/Pagination/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Edit, Plus, Search, Key, Close, Select } from '@element-plus/icons-vue'
import { checkPermissions } from '@/utils/auth'
import { getAccountList, saveAccount, deleteAccount, resetPwd, updateStatus } from '@/api/account'
import { getAllRole } from '@/api/role'
import { nextTick } from 'process'

const dataTable = ref(null)

var tableHeightCalc = ''
if(checkPermissions(['auth:admin:delete', 'auth:admin:add'])) {
  tableHeightCalc += ' - 50px'
}
const tableHeight = ref('calc(100vh - 70px - 40px - 20px - 100px '+ tableHeightCalc +')')

const state = reactive({
  list: [],
  count: 0,
  listLoading: true,
  listQuery: {
    page: 1,
    size: 20,
    userName:"",
    realName:"",
  },
  listQueryCopy: {
    userName:"",
    realName:"",
  },
  dialogFormVisible: false,
  dialogTitle: "",
  temp: {},
  dialogResetFormVisible: false,
  reset: {},

  showPwd: false,
  roles: [],
})

//导出属性到页面中使用
const { list, listLoading, listQuery, listQueryCopy, count, dialogFormVisible, temp, roles, dialogTitle, reset, dialogResetFormVisible, showPwd } = toRefs(state)

onBeforeMount(() => {
  fetchData()
})

const filterData = () => {
  state.listQuery.page = 1
  state.listQuery.realName = state.listQueryCopy.realName
  state.listQuery.userName = state.listQueryCopy.userName
  fetchData()
}

const fetchData = () => {

  state.listLoading = true
  getAccountList(state.listQuery).then((response) => {
    var data = response.data
    state.list = data.data
    state.count = data.count
    state.listLoading = false
  }).catch((e) => {
    ElMessage.error(e.message)
  }) 
}

const handleCreate = () => {
  state.roles = []
  getAllRole().then((response) => {
    state.roles = response.data
    state.temp = {
      realName:"",
      password:"",
      userName:"",
      roleId: "",
    }
    state.dialogTitle = '新增'
    state.showPwd = true

    state.dialogFormVisible = true
  }).catch((e) => {
    ElMessage.error(e.message)
  }) 
}

const handleUpdate = (row) => {
  state.roles = []
  getAllRole().then((response) => {
    state.roles = response.data
    state.temp = {
      id: row.id,
      realName: row.realName,
      password: "",
      userName: row.userName,
      roleId: row.roleId,
    }
    state.dialogTitle = '编辑'
    state.showPwd = false

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
    deleteAccount(selections).then((response) => {
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
    deleteAccount(id).then((response) => {
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

const handleSave = () => {
  if(state.temp.roleId == '') {
    state.temp.roleId = null
  }
  saveAccount(state.temp).then((response) => {
    state.dialogFormVisible = false
    ElMessage({
      message: '保存成功',
      type: 'success',
    })

    fetchData()
  }).catch((e) => {
    ElMessage.error(e.message)
  }) 
}

const handleToResetPwd = (id) => {
  state.reset = {
    adminId: id,
    password: "",
  }
  state.dialogResetFormVisible = true
}

const handleReset = () => {
  resetPwd(state.reset).then((response) => {
    state.dialogResetFormVisible = false
    ElMessage({
      message: '重置成功',
      type: 'success',
    })
  }).catch((e) => {
    ElMessage.error(e.message)
  }) 
}


const handleUpdateStatus = (id, status) => {
  ElMessageBox.confirm(
    status ? '确定要启用吗?' : '确定要禁用吗?',
    '提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'danger',
    }
  ).then(() => {
    updateStatus(id, status).then((response) => {
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


</script>

<style scoped lang="scss"></style>
