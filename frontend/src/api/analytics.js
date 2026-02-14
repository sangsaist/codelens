
import api from './axios'

export const getMySummary = async () => {
    const response = await api.get('/analytics/my-summary')
    return response.data
}

export const getMyGrowth = async (platformAccountId) => {
    const response = await api.get(`/analytics/my-growth/${platformAccountId}`)
    return response.data
}
