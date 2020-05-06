import request from '@/utils/request'

// 根据申请号查询BPM申请记录
export function listBPMByAppNbr (query) {
  return request({
    url: '/bpm/applicationhist/listbyappnbr',
    method: 'get',
    params: query    
  })
}
