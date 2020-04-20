import request from '@/utils/request'

// FTQ和泄漏率报表
export function getFTQLeakRate (query) {
    return request({
        url: '/production/reporting/quality/ftqleak',
        method: 'get',
        params: query
    })
}
