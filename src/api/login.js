import request from '@/utils/request'

export function loginReq(data) {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}


export function currentMenuReq() {
  return request({
    url: '/current/menus',
    method: 'get',
  })
}



export function logoutReq() {
  return request({
    url: '/logout',
    method: 'post'
  })
}
