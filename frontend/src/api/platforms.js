
import api from './axios'

export const getMyPlatforms = async () => {
    const response = await api.get('/platforms/my')
    return response.data
}

export const linkPlatform = async (platformName, username) => {
    const response = await api.post('/platforms/link', { platform_name: platformName, username })
    return response.data
}

export const unlinkPlatform = async (platformAccountId) => {
    const response = await api.delete(`/platforms/${platformAccountId}`)
    return response.data
}
