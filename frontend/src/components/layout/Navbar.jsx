
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const Navbar = () => {
    const { logout, hasRole } = useAuth()
    const location = useLocation()
    const currentPath = location.pathname

    const getLinkClass = (path) => {
        const isActive = currentPath === path
        return isActive
            ? 'bg-indigo-900 text-white rounded-md px-3 py-2 text-sm font-medium'
            : 'text-gray-300 hover:bg-indigo-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium'
    }

    return (
        <nav className="bg-indigo-800">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <span className="text-white font-bold text-xl">CodeLens</span>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">

                                {/* Admin Links */}
                                {hasRole('admin') && (
                                    <>
                                        <Link to="/admin/institution" className={getLinkClass('/admin/institution')}>
                                            Overview
                                        </Link>
                                        <Link to="/admin" className={getLinkClass('/admin')}>
                                            Manage
                                        </Link>
                                    </>
                                )}

                                {/* Advisor Links */}
                                {hasRole('hod') && (
                                    <Link to="/department/dashboard" className={getLinkClass('/department/dashboard')}>
                                        Department Dashboard
                                    </Link>
                                )}

                                {/* Advisor Links */}
                                {hasRole('advisor') && (
                                    <Link to="/advisor/dashboard" className={getLinkClass('/advisor/dashboard')}>
                                        Advisor Dashboard
                                    </Link>
                                )}

                                {/* Counsellor Links */}
                                {hasRole('counsellor') && (
                                    <Link to="/counsellor/dashboard" className={getLinkClass('/counsellor/dashboard')}>
                                        Counsellor Dashboard
                                    </Link>
                                )}

                                {/* Student Links (Hidden if Admin) */}
                                {hasRole('student') && !hasRole('admin') && (
                                    <Link to="/dashboard" className={getLinkClass('/dashboard')}>
                                        My Dashboard
                                    </Link>
                                )}

                                {/* Common Links */}
                                <Link to="/leaderboard" className={getLinkClass('/leaderboard')}>
                                    Leaderboard
                                </Link>

                                {/* Staff Management Link */}
                                {(hasRole('admin') || hasRole('hod') || hasRole('advisor')) && (
                                    <Link to="/staff" className={getLinkClass('/staff')}>
                                        Staff
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                    <div>
                        <button
                            onClick={logout}
                            className="rounded-md bg-indigo-950 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-800"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
