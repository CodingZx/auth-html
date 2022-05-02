<template>
  <div class="app-container scroll-y">
     <div class="filter-container" >
        <el-form :inline="true" v-permission="['auth:menu:delete', 'auth:menu:add']" >
          <el-form-item label="">
            <el-button v-permission="['auth:menu:add']" class="filter-item" type="primary" :icon="Plus" @click="handleCreate">
                新增
            </el-button>
            <el-button v-permission="['auth:menu:delete']" class="filter-item" type="danger" :icon="Delete" @click="handleDeleteSelected">
                删除
            </el-button>
          </el-form-item>
        </el-form>
      </div>

    <el-table ref="dataTable" v-loading="listLoading" :tree-props="{ children: 'children' }" row-key="id" default-expand-all :data="list" element-loading-text="加载中" border highlight-current-row :height="tableHeight">
      <el-table-column type="selection" width="55" />
      <el-table-column label="名称"  align="center">
        <template #default="scope">
          {{ scope.row.title }}
        </template>
      </el-table-column>

      <el-table-column label="类型" align="center">
        <template #default="scope">
          <el-tag v-if="scope.row.menuType == 'button'">按钮</el-tag>
          <el-tag v-if="scope.row.menuType == 'menu'" type="success">菜单</el-tag>
          <el-tag v-if="scope.row.menuType == 'dir'" type="danger">目录</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="图标" align="center">
        <template #default="scope">
          <ElSvgIcon :name="scope.row.icon"></ElSvgIcon>
        </template>
      </el-table-column>

      <el-table-column label="地址" align="center">
        <template #default="scope">
          {{ scope.row.path }}
        </template>
      </el-table-column>

      <el-table-column label="权限" align="center">
        <template #default="scope">
          {{ scope.row.resourceCode }}
        </template>
      </el-table-column>

       <el-table-column label="排序值" align="center">
        <template #default="scope">
          {{ scope.row.sortBy }}
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-tooltip content="新增" placement="top">
            <el-button type="primary" v-permission="['auth:menu:add']" :icon="Plus" circle @click="handleCreateSub(scope.row)" />
          </el-tooltip>
          <el-tooltip content="编辑" placement="top">
            <el-button type="info" v-permission="['auth:menu:edit']" :icon="Edit" circle @click="handleUpdate(scope.row)" />
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button type="danger" v-permission="['auth:menu:delete']" :icon="Delete" circle @click="handleDeleteRow(scope.row.id)" />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogFormVisible" :close-on-click-modal="false" :title="dialogTitle" width="40%">
      <el-form :model="temp" label-width="80px" class="interfaceForm">
        <el-form-item label="上级目录:" v-if="parentName != ''">
            <el-input v-model="parentName" disabled autocomplete="off" />
        </el-form-item>
        <el-form-item label="名称:" >
          <el-input v-model="temp.title" autocomplete="off" />
        </el-form-item>
        <el-form-item label="图标:"  v-if="temp.menuType != 'button'">
          <el-input v-model="temp.icon" autocomplete="off" />
        </el-form-item>
        <el-form-item label="路径:" v-if="temp.menuType == 'menu'">
          <el-input v-model="temp.path" autocomplete="off" />
        </el-form-item>
        <el-form-item label="类型:" >
          <el-select v-model="temp.menuType" disabled >
              <el-option v-if="temp.menuType == 'dir'" label="目录" value="dir"> </el-option>
              <el-option v-if="temp.menuType == 'menu'" label="菜单" value="menu"> </el-option>
              <el-option v-if="temp.menuType == 'button'" label="按钮" value="button"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="权限:" v-if="temp.menuType != 'dir'">
          <el-input v-model="temp.resourceCode" autocomplete="off" />
        </el-form-item>
        <el-form-item label="排序值:" >
          <el-input-number v-model="temp.sortBy" controls-position="right" />
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Edit, Plus, Search } from '@element-plus/icons-vue'
import { getMenuList, saveMenu, deleteMenu } from '@/api/menu'
import * as ElSvg from '@element-plus/icons-vue';

const dataTable = ref(null)
const tableHeight = ref(`calc(100vh - 70px - 40px - 50px )`)

const state = reactive({
  list: [],
  listLoading: true,
  
  dialogFormVisible: false,
  dialogTitle:"",
  temp: {},
  parentName:"",
})

//导出属性到页面中使用
const { list,listLoading, dialogFormVisible, temp, dialogTitle, parentName } = toRefs(state)

onBeforeMount(() => {
  fetchData()
})

const fetchData = () => {
  state.listLoading = true
  getMenuList().then((response) => {
    var data = response.data
    state.list = data
    state.listLoading = false
  }).catch((e) => {
    ElMessage.error(e.message)
  }) 
}

const handleCreate = () => {
  state.parentName = ""
  state.temp = {
    title:"",
    icon:"",
    path:"",
    sortBy: 1,
    menuType:"dir",
    resourceCode:"",
  }
  state.dialogTitle = '新增目录'
  state.dialogFormVisible = true
}

const handleCreateSub = (row) => {
  state.parentName = row.title
 
  var subMenuType = ''
  if(row.menuType == 'dir') {
    subMenuType = 'menu'

    state.dialogTitle = '新增菜单'
  }
  if(row.menuType == 'menu') {
    subMenuType = 'button'
    state.dialogTitle = '新增按钮'
  }
   state.temp = {
    title:"",
    icon:"",
    path:"",
    sortBy: 1,
    menuType: subMenuType,
    resourceCode:"",
    parentId: row.id,
  }
  state.dialogStatus = 'create'
  state.dialogFormVisible = true
}

const handleUpdate = (row) => {
  state.parentName = ""
  state.temp = {
    id: row.id,
    title: row.title,
    icon: row.icon,
    path: row.path,
    sortBy: row.sortBy,
    menuType: row.menuType,
    resourceCode: row.resourceCode,
  }

  if(row.menuType == 'dir') {
      state.dialogTitle = '修改目录'
  }
  if(row.menuType == 'menu') {
      state.dialogTitle = '修改菜单'
  }
  if(row.menuType == 'button') {
      state.dialogTitle = '修改按钮'
  }
  state.dialogFormVisible = true
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
    deleteMenu(selections).then((response) => {
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
    deleteMenu(id).then((response) => {
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
  saveMenu(state.temp).then((response) => {
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

</style>
