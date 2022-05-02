import request from '@/utils/request'

export function getReportList(params) {
  return request({
    url: '/report/log/list',
    method: 'get',
    params: params
  })
}

export function findReportDetail(id) {
  return request({
    url: '/report/log/'+ id + '/detail',
    method: 'get'
  })
}


export function setReportStatus(id, status) {
  return request({
    url: '/report/log/'+id+'/set/' + status,
    method: 'put'
  })
}

export function deleteReport(id) {
  return request({
    url: '/report/log/'+ id,
    method: 'delete'
  })
}

export function downloadReport(id) {
  return request({
    url: '/report/log/down/'+ id,
    method: 'post',
    isDownLoadFile: true,
  })
}
