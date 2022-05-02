import request from '@/utils/request'
 
export function getAllMenu() {
  return request({
    url: '/menu/all',
    method: 'get'
  })
}


export function getMenuList() {
  return request({
    url: '/menu/list',
    method: 'get',
  })
}

export function saveMenu(data) {
  return request({
    url: '/menu/save',
    method: 'post',
    data: data
  })
}


export function deleteMenu(id) {
  return request({
    url: '/menu/'+ id,
    method: 'delete'
  })
}