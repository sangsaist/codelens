
import api from './axios'

export const getSnapshots = async (platformAccountId) => {
    const response = await api.get(`/snapshots/${platformAccountId}`)
    return response.data
}

export const createSnapshot = async (data) => {
    const response = await api.post('/snapshots', data)
    return response.data
}
