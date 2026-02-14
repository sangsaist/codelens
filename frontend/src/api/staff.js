
import api from './axios'

export const createStaff = async (data) => {
    const response = await api.post('/staff/create', data)
    return response.data
}

export const getMyTeam = async () => {
    const response = await api.get('/staff/my-team')
    return response.data
}
