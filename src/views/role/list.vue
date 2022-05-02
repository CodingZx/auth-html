<template>
  <div class="app-container scroll-y">
     <div class="filter-container" >
        <el-form :inline="true" >
          <el-form-item label=" 角色：">
              <el-input v-model.trim="listQueryCopy.roleName"  />
          </el-form-item>

          <el-form-item label="">
              <el-button class="filter-item" type="primary" :icon="Search" @click="filterData">
                  查询
              </el-button>
          </el-form-item>
        </el-form>

        <el-form :inline="true" v-permission="['auth:role:delete', 'auth:role:add']" >
          <el-form-item label="">
            <el-button v-permission="['auth:role:add']" class="filter-item" type="primary" :icon="Plus" @click="handleCreate">
                新增
            </el-button>
            <el-button v-permission="['auth:role:delete']" class="filter-item" type="danger" :icon="Delete" @click="handleDeleteSelected">
                删除
            </el-button>
          </el-form-item>
        </el-form>
      </div>

    <el-table ref="dataTable" v-loading="listLoading" :data="list" element-loading-text="加载中" border highlight-current-row :height="tableHeight">
      <el-table-column type="selection" width="55" />
      <el-table-column label="角色名称"  align="center">
        <template #default="scope">
          {{ scope.row.roleName }}
        </template>
      </el-table-column>
      
      <el-table-column label="创建时间" align="center">
        <template #default="scope">
          {{ scope.row.createTime }}
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-tooltip content="编辑" placement="top">
            <el-button type="info" v-permission="['auth:role:edit']" :icon="Edit" circle @click="handleUpdate(scope.row)" />
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button type="danger" v-permission="['auth:role:delete']" :icon="Delete" circle @click="handleDeleteRow(scope.row.id)" />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <Pagination v-model:page='listQuery.page' v-model:limit='listQuery.size' :total='count' @pagination='fetchData' />

    <el-dialog v-model="dialogFormVisible" :close-on-click-modal="false" :title="dialogTitle" width="40%">
      <el-form :model="temp" label-width="80px" class="interfaceForm">
        
        <el-form-item label="角色名称:" >
          <el-input v-model="temp.roleName" autocomplete="off" />
        </el-form-item>
        <el-form-item label="权限列表:">
            <div class="down-tree">
                <el-tree
                    :data="menus"
                    ref="menuTree"
                    show-checkbox
                    default-expand-all
                    highlight-current
                    check-strictly
                    :check-on-click-node="true"
                    node-key="id"
                    :props="{'children':'children','label':'title'}">
                </el-tree>
            </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">确认</el-button>
        </span>
      </template>
  </el-dialog>
  </div>
</template>

<script setup>
import Pagination from '@/components/Pagination/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Edit, Plus, Search } from '@element-plus/icons-vue'
import { getRoleList, saveRole, deleteRole, findRoleMenus } from '@/api/role'
import { getAllMenu } from '@/api/menu'
import { nextTick } from 'process'

const dataTable = ref(null)
const menuTree = ref(null)
const tableHeight = ref(`calc(100vh - 70px - 40px - 50px - 20px - 100px)`)

const state = reactive({
  list: [],
  count: 0,
  listLoading: true,
  listQuery: {
    page: 1,
    size: 20,
    roleName:"",
  },
  listQueryCopy: {
    roleName:"",
  },
  dialogFormVisible: false,
  dialogTitle: "",
 
  temp: {},


  menus: [],
})

//导出属性到页面中使用
const { list, listLoading, listQuery, listQueryCopy, count, dialogFormVisible, temp, menus, dialogTitle } = toRefs(state)

onBeforeMount(() => {
  fetchData()
})

const filterData = () => {
  state.listQuery.page = 1
  state.listQuery.roleName = state.listQueryCopy.roleName
  fetchData()
}

const fetchData = () => {

  state.listLoading = true
  getRoleList(state.listQuery).then((response) => {
    var data = response.data
    state.list = data.data
    state.count = data.count
    state.listLoading = false
  }).catch((e) => {
    ElMessage.error(e.message)
  }) 
}

const handleCreate = () => {
  state.menus = []
  getAllMenu().then((response) => {
    state.menus = response.data
    state.temp = {
      roleName:"",
      menus: []
    }
    state.dialogTitle = '新增'

    state.dialogFormVisible = true

    nextTick(() => {
      menuTree.value.setCheckedKeys([])
    })
  }).catch((e) => {
    ElMessage.error(e.message)
  }) 
}

const handleUpdate = (row) => {
  state.menus = []
  getAllMenu().then((response) => {
    state.menus = response.data

    findRoleMenus(row.id).then((menuResp) => {
      state.temp = {
        id: row.id,
        roleName: row.roleName,
        menus: []
      }
      state.dialogTitle = '编辑'

      state.dialogFormVisible = true

      nextTick(() => {
        menuTree.value.setCheckedKeys(menuResp.data)
      })
    })
    
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
    deleteRole(selections).then((response) => {
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
    deleteRole(id).then((response) => {
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
  state.temp.menus = menuTree.value.getCheckedKeys()
  
  saveRole(state.temp).then((response) => {
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
</script>

<style scoped lang="scss">
.down-tree{
    height: 400px;
    display: block;
    overflow-y: scroll;
    width: 100%
}
</style>
