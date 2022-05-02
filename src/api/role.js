import request from '@/utils/request'
 
export function getAllRole() {
  return request({
    url: '/role/all',
    method: 'get'
  })
}
