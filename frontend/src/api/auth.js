
import api from './axios'

export const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
}

export const register = async (name, email, password) => {
    const response = await api.post('/auth/register', {
        full_name: name,
        email,
        password
    })
    return response.data
}

export const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
}
