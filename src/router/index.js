import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '@/layout'

export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404.vue'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401.vue'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    hidden: true,
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '首页', elSvgIcon: 'Fold' }
      }
    ]
  },
]
/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    path: '/auth/admin/list',
    name: 'authAdmin',
    component: () => import('@/views/account/list.vue'),
    meta: { title: '账号列表'}
  },
  {
    path: '/auth/role/list',
    name: 'authRole',
    component: () => import('@/views/role/list.vue'),
    meta: { title: '角色列表'}
  },
  {
    path: '/auth/menu/list',
    name: 'authMenu',
    component: () => import('@/views/menu/list.vue'),
    meta: { title: '菜单列表'}
  },
  {
    path: '/auth/log/list',
    name: 'authLog',
    component: () => import('@/views/log/list.vue'),
    meta: { title: '日志列表'}
  },
  {
    path: '/exception/log/list',
    name: 'exceptionLog',
    component: () => import('@/views/exception-log/list.vue'),
    meta: { title: '异常列表'}
  },
  {
    path: '/ip/limit/list',
    name: 'ipLimitList',
    component: () => import('@/views/ip-limit/list.vue'),
    meta: { title: 'IP限制'}
  },
  // 404 page must be placed at the end !!!
  // using pathMatch install of "*" in vue-router 4.0
  { path: '/:pathMatch(.*)', redirect: '/404', hidden: true }
]

const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: constantRoutes
})

export default router
