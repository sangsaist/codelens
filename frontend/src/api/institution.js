
import api from './axios'

export const getInstitutionSummary = async () => {
    const response = await api.get('/analytics/institution-summary')
    return response.data
}

export const getDepartmentPerformance = async () => {
    const response = await api.get('/analytics/department-performance')
    return response.data
}

export const getTopPerformers = async (limit = 10) => {
    const response = await api.get(`/analytics/top-performers?limit=${limit}`)
    return response.data
}

export const getAtRiskStudents = async () => {
    const response = await api.get('/analytics/at-risk')
    return response.data
}
