
import api from './axios'

export const createStaff = async (data) => {
    const response = await api.post('/staff/create', data)
    return response.data
}

export const getMyTeam = async () => {
    const response = await api.get('/staff/my-team')
    return response.data
}

export const assignAdvisor = async (advisorId, studentIds) => {
    const response = await api.post('/staff/assign-advisor', {
        advisor_id: advisorId,
        student_ids: studentIds
    })
    return response.data
}

export const assignCounsellor = async (counsellorId, studentIds) => {
    const response = await api.post('/staff/assign-counsellor', {
        counsellor_id: counsellorId,
        student_ids: studentIds
    })
    return response.data
}
