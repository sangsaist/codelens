import { createContext, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { login as apiLogin, register as apiRegister } from '../api/auth'
import { getPrimaryDashboardRoute, hasRole as utilHasRole } from '../utils/roles'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(localStorage.getItem('token'))
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        const storedToken = localStorage.getItem('token')

        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser))
            setToken(storedToken)
        }
        setLoading(false)
    }, [])

    const login = async (email, password) => {
        try {
            const data = await apiLogin(email, password)
            if (data.success) {
                const { access_token, user } = data.data
                localStorage.setItem('token', access_token)
                localStorage.setItem('user', JSON.stringify(user))
                setToken(access_token)
                setUser(user)

                // Redirect based on role
                const redirectPath = getPrimaryDashboardRoute(user)

                // If the user was trying to access a specific page before login, 
                // we might want to preserve that (requires storing 'from' in location state),
                // but for now, prioritize user role redirection as requested.
                navigate(redirectPath)
                return { success: true }
            }
            return { success: false, error: data.error || 'Login failed' }
        } catch (err) {
            return { success: false, error: err.response?.data?.error || 'Server error' }
        }
    }

    const register = async (name, email, password) => {
        try {
            const data = await apiRegister(name, email, password)
            if (data.success) {
                navigate('/login')
                return { success: true }
            }
            return { success: false, error: data.error || 'Registration failed' }
        } catch (err) {
            return { success: false, error: err.response?.data?.error || 'Server error' }
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        setToken(null)
        navigate('/login')
    }

    const hasRole = (role) => {
        return utilHasRole(user, role)
    }

    return (
        <AuthContext.Provider value={{
            user,
            token,
            login,
            register,
            logout,
            loading,
            isAuthenticated: !!token,
            hasRole
        }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}
