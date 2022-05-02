import request from '@/utils/request'
 
export function getLogList(params) {
  return request({
    url: '/log/list',
    method: 'get',
    params: params
  })
}


export function deleteLog(id) {
  return request({
    url: '/log/remove/'+ id,
    method: 'delete'
  })
}

export function clearLog() {
  return request({
    url: '/log/clear',
    method: 'delete'
  })
}

export function findLogDetail(id) {
  return request({
    url: '/log/'+ id + '/detail',
    method: 'get'
  })
}