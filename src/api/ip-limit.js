import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/ip/limit/list',
    method: 'get',
    params: params
  })
}


export function remove(id) {
  return request({
    url: '/ip/limit/'+ id,
    method: 'delete'
  })
}
