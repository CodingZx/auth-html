import { defineStore } from 'pinia'
import Layout from '@/layout'
import { asyncRoutes, constantRoutes } from '@/router'

export function filterAsyncRoutes(asyncRoutes, menus) {
  const accessedRouters = []
  if(typeof(menus) == 'undefined' || menus == null || menus.length == 0) return accessedRouters

  for(var i=0; i < menus.length; i++) {
      var dirResp = menus[i];

      var routerDir = {
          path: '/dynamic'+i,
          component: Layout,
          name: 'dynamicRouter-' + i,
          meta: {
              title: dirResp.title,
              elSvgIcon: dirResp.icon
          },
      }
      var children = []
      // 子项
      for(var j=0; j< dirResp.children.length; j++) {
          var menuResp = dirResp.children[j];

          var menuRoute = asyncRoutes.filter(route => {
              return route.path == menuResp.path
          });
          
          if(menuRoute && menuRoute.length > 0) {
              var child = menuRoute[0]
              child.meta = {
                  title: menuResp.title,
                  elSvgIcon: menuResp.icon
              }

              children.push(child)
          }
      }
      
      if(children.length > 0) {
          routerDir.children = children
          routerDir.redirect = children[0].path
          accessedRouters.push(routerDir)
      }
  }
  return accessedRouters
}

export const usePermissionStore = defineStore('permission', {
  /***
   *类似于组件的 data数据的 ,用来存储全局状态的
   * 1、必须是箭头函数
   */
  state: () => {
    return {
      isGetUserInfo: false, // get userInfo
      routes: [], //将过滤后的异步路由和静态路由集合
      addRoutes: [] //过滤后的异步路由
    }
  },

  /***
   *封装处理数据的函数（业务逻辑)：修改数据
   */
  actions: {
    M_routes(routes) {
      this.$patch((state) => {
        state.addRoutes = routes
        state.routes = constantRoutes.concat(routes)
      })
    },
    M_isGetUserInfo(data) {
      this.$patch((state) => {
        state.isGetUserInfo = data
      })
    },
    generateRoutes(menus) {
      return new Promise(async (resolve) => {
        let accessedRoutes = await filterAsyncRoutes(asyncRoutes, menus)
        resolve(accessedRoutes)
      })
    }
  }
})
