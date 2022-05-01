import request from '@/utils/request'

export function loginReq(data) {
  return request({
    url: '/login',
    data,
    method: 'post',
  })
}

export function logoutReq() {
  return request({
    url: '/logout',
    method: 'post'
  })
}
