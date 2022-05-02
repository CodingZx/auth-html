import request from '@/utils/request'

export function getAccountList(params) {
  return request({
    url: '/admin/list',
    method: 'get',
    params: params
  })
}

export function saveAccount(data) {
  return request({
    url: '/admin/save',
    method: 'post',
    data: data
  })
}


export function deleteAccount(id) {
  return request({
    url: '/admin/'+ id,
    method: 'delete'
  })
}


export function resetPwd(data) {
  return request({
    url: '/admin/reset/pwd',
    method: 'put',
    data: data
  })
}
