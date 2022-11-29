import { getKey, loginReq, logoutReq, currentMenuReq } from '@/api/login'
import { setToken, removeToken, setPermissions, removePermissions, getPermissions } from '@/utils/auth'
import router, { asyncRoutes } from '@/router'
import { defineStore } from 'pinia'
import { usePermissionStore } from '@/store/permission'
import { useTagsViewStore } from '@/store/tagsView'
import JSEncrypt from 'jsencrypt'

const resetRouter = () => {
  const asyncRouterNameArr = asyncRoutes.map((mItem) => mItem.name)
  asyncRouterNameArr.forEach((name) => {
    if (router.hasRoute(name)) {
      router.removeRoute(name)
    }
  })
}


const encrypt = (data, key) => {
  const PUBLIC_KEY = key
  var jse = new JSEncrypt()
  jse.setPublicKey(PUBLIC_KEY)
  return jse.encrypt(data)
}

export const useUserStore = defineStore('user', {

  actions: {
    login(data) {
      return new Promise((resolve, reject) => {
        getKey().then(res => {
          var key = res.data

          var pwd = data.password
          pwd = encrypt(pwd, key)

          loginReq({
            userName: data.userName,
            password: pwd
          }).then((res) => {
              if (res.code === 200) {
                setToken(res.data.token)
                setPermissions(res.data.permissions)
                resolve(null)
              } else {
                reject(res)
              }
            })
            .catch((error) => {
              reject(error)
            })
        }).catch((e) => {
          reject(e)
        }) 
      })
    },
    getCurrentMenus() {
      return new Promise((resolve, reject) => {
        currentMenuReq()
          .then((res) => {
            if (res.code === 200) {
              resolve({
                menus: res.data,
              })
            } else {
              reject(null)
            }
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    // user logout
    logout() {
      return new Promise((resolve, reject) => {
        logoutReq()
          .then(() => {
            this.resetState()
            resolve(null)
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    resetState() {
      return new Promise((resolve) => {
        removeToken() // must remove  token  first
        removePermissions()
        resetRouter() // reset the router
        const permissionStore = usePermissionStore()
        permissionStore.M_isGetUserInfo(false)
        const tagsViewStore = useTagsViewStore()
        tagsViewStore.delAllViews()
        resolve(null)
      })
    }
  }
})
