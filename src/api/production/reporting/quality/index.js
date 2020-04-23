import request from '@/utils/request'

// FTQ和泄漏率报表
export function getFTQLeakRate (query) {
    return request({
        url: '/production/reporting/quality/ftqleak',
        method: 'get',
        params: query
    })
}

// FTQ报表
export function getFTQ (query) {
  return request({
      url: '/production/reporting/quality/ftq',
      method: 'get',
      params: query
  })
}

// 泄漏率报表
export function getLeakRate (query) {
  return request({
      url: '/production/reporting/quality/leak',
      method: 'get',
      params: query
  })
}

// 导出生产报工数据
export function exportData (query) {
    return request({
      url: '/production/reporting/quality/export',
      method: 'get',
      params: query
    })
  }
