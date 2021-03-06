import request from '@/utils/request'

// 生产报工列表
export function listReportHist (query) {
  return request({
    url: '/production/report/prodreporthist/list',
    method: 'get',
    params: query
  })
}

// 根据Id查询生产报工信息
export function getReportHistById (id) {
  return request({
    url: '/production/report/prodreporthist/' + id,
    method: 'get'
  })
}

// 新增生产报工
export function addReportHist (data) {
  return request({
    url: '/production/report/prodreporthist',
    method: 'post',
    data: data
  })
}

// 修改生产报工
export function updateReportHist (data) {
  return request({
    url: '/production/report/prodreporthist/',
    method: 'put',
    data: data
  })
}

// 删除生产报工
export function deleteReportHistById (id) {
  return request({
    url: '/production/report/prodreporthist/' + id,
    method: 'delete'
  })
}

// 导出生产报工数据
export function exportData (query) {
  return request({
    url: '/production/report/prodreporthist/export',
    method: 'get',
    params: query
  })
}
