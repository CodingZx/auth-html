<template>
  <div class="navbar rowBC reset-el-dropdown">
    <div class="rowSC">
      <hamburger
        :is-active="opened"
        class="hamburger-container"
        @toggleClick="toggleSideBar"
      />
      <breadcrumb class="breadcrumb-container" />
    </div>
    <!--nav title-->
    <div class="right-menu">
      <el-dropdown trigger="click" size="medium">
        <div class="avatar-wrapper">
          <img
            src="https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif?imageView2/1/w/80/h/80"
            class="user-avatar"
          />
          <CaretBottom style="width: 1em; height: 1em; margin-left: 4px" />
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            
            <el-dropdown-item @click="handleToUpdatePwd">修改密码</el-dropdown-item>
            <el-dropdown-item divided @click="loginOut">退出</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <el-dialog v-model="dialogUpdateFormVisible" :close-on-click-modal="false" title="重置密码" width="40%">
      <el-form :model="update" label-width="80px" class="interfaceForm">
        <el-form-item label="当前密码:">
            <el-input v-model="update.oldPassword" autocomplete="off" show-password />
        </el-form-item>
        <el-form-item label="新密码:">
            <el-input v-model="update.newPassword" autocomplete="off" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogUpdateFormVisible = false">取消</el-button>
          <el-button type="primary" @click="handleUpdatePwd">确认</el-button>
        </span>
      </template>
  </el-dialog>
  </div>
</template>

<script setup>
import { updatePwdReq } from '@/api/login'
import { CaretBottom } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import Breadcrumb from './Breadcrumb'
import Hamburger from './Hamburger'

import { useAppStore } from '@/store/app'
import { useUserStore } from '@/store/user'
const opened = computed(() => {
  return appStore.sidebar.opened
})
const appStore = useAppStore()
const toggleSideBar = () => {
  appStore.M_toggleSideBar()
}
/*
 * 退出登录
 * */
const router = useRouter()
const loginOut = () => {
  const userStore = useUserStore()
  userStore.logout().then(() => {
    ElMessage({ message: '退出登录成功', type: 'success' })
    router.push(`/login?redirect=/`)
  })
}

const state = reactive({
  dialogUpdateFormVisible: false,
  update:{},
})
const { update, dialogUpdateFormVisible } = toRefs(state)


// 修改密码
const handleToUpdatePwd = () => {
  state.update = {
    oldPassword:"",
    newPassword:""
  }
  state.dialogUpdateFormVisible = true
}

const handleUpdatePwd = () => {
  updatePwdReq(state.update).then((response) => {
     ElMessage({
      message: '修改成功',
      type: 'success',
    })
    state.dialogUpdateFormVisible = false
  }).catch((e) => {
    ElMessage.error(e.message)
  }) 
}

</script>

<style lang="scss" scoped>
.navbar {
  height: $navBarHeight;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

//logo
.avatar-wrapper {
  margin-top: 5px;
  position: relative;
  cursor: pointer;

  .user-avatar {
    cursor: pointer;
    width: 40px;
    height: 40px;
    border-radius: 10px;
  }

  .el-icon-caret-bottom {
    cursor: pointer;
    position: absolute;
    right: -20px;
    top: 25px;
    font-size: 12px;
  }
}

//center-title
.heardCenterTitle {
  text-align: center;
  position: absolute;
  top: 50%;
  left: 46%;
  font-weight: 600;
  font-size: 20px;
  transform: translate(-50%, -50%);
}

//drop-down
.right-menu {
  cursor: pointer;
  margin-right: 40px;
}
</style>
