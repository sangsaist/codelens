import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/**
 * Wraps routes to ensure user is authenticated and has required permissions.
 * @param {Array<string>} allowedRoles - List of roles that can access this route.
 * @param {React.ReactNode} children
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, user, loading } = useAuth()

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (allowedRoles && user) {
        const hasPermission = allowedRoles.some(role => user.roles.includes(role))
        if (!hasPermission) {
            return <Navigate to="/unauthorized" replace />
        }
    }

    return children ? children : <Outlet />
}

export default ProtectedRoute
