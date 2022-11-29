import request from '@/utils/request'

export function getAccountList(params) {
  return request({
    url: '/account/list',
    method: 'get',
    params: params
  })
}

export function saveAccount(data) {
  return request({
    url: '/account/save',
    method: 'post',
    data: data
  })
}


export function deleteAccount(id) {
  return request({
    url: '/account/'+ id,
    method: 'delete'
  })
}


export function updateStatus(userId, status) {
  return request({
    url: '/account/update/'+userId+'/'+status,
    method: 'put',
  })
}


export function resetPwd(data) {
  return request({
    url: '/account/reset/pwd',
    method: 'put',
    data: data
  })
}
