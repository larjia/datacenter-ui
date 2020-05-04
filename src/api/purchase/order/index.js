import request from '@/utils/request'

export function listPurchaseOrder (query) {
  return request({
    url: '/purchase/order/list',
    method: 'get',
    params: query
  })
}

export function getPurchaseOrder (id) {
  return request({
    url: '/purchase/order/' + id,
    method: 'get'
  })
}
