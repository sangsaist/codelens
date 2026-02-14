
import api from './axios'

export const getCounsellorSummary = async () => {
    const response = await api.get('/analytics/counsellor/summary')
    return response.data
}

export const getDepartmentStudents = async () => {
    const response = await api.get('/analytics/counsellor/students')
    return response.data
}

export const getAtRiskStudents = async () => {
    const response = await api.get('/analytics/counsellor/at-risk')
    return response.data
}
