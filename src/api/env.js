import request from '@/utils/request'
 
export function getSystemEnv() {
  return request({
      url: '/system/env',
      method: 'get'
  })
}

export function getSystemServers() {
  return request({
      url: '/system/servers',
      method: 'get'
  })
}

export function getSystemMonitor(params) {
  return request({
      url: '/system/monitor',
      method: 'get',
      params: params
  })
}


export function getReviews(id, type, params) {
  return request({
      url: '/system/'+type+'/reviews/'+id,
      method: 'get',
      params: params
  })
}