import request from '@/utils/request'
 
export function getAllRole() {
  return request({
    url: '/role/all',
    method: 'get'
  })
}


export function getRoleList(params) {
  return request({
    url: '/role/list',
    method: 'get',
    params: params
  })
}

export function saveRole(data) {
  return request({
    url: '/role/save',
    method: 'post',
    data: data
  })
}


export function deleteRole(id) {
  return request({
    url: '/role/'+ id,
    method: 'delete'
  })
}

export function findRoleMenus(id) {
  return request({
    url: '/role/find/'+ id + '/menus',
    method: 'get'
  })
}