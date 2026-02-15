
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import ProtectedRoute from './ProtectedRoute'
import Login from '../pages/Login'
import Register from '../pages/Register'
import StudentDashboard from '../pages/StudentDashboard'
import AdminPanel from '../pages/AdminPanel'
import InstitutionDashboard from '../pages/InstitutionDashboard'
import HODStudentManagement from '../pages/HODStudentManagement'
import AdvisorDashboard from '../pages/AdvisorDashboard'
import AdvisorStudentDetail from '../pages/AdvisorStudentDetail'
import CounsellorDashboard from '../pages/CounsellorDashboard'
import Leaderboard from '../pages/Leaderboard'
import Unauthorized from '../pages/Unauthorized'
import NotFound from '../pages/NotFound'
import StaffManagement from '../pages/staff/StaffManagement'

const AppRoutes = () => {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Staff Management Route */}
                <Route
                    path="/staff"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'hod', 'advisor']}>
                            <StaffManagement />
                        </ProtectedRoute>
                    }
                />

                {/* Student Routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['student']}>
                            <StudentDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Routes */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminPanel />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/institution"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <InstitutionDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* HOD Routes */}
                <Route
                    path="/department/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['hod']}>
                            <InstitutionDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/department/students"
                    element={
                        <ProtectedRoute allowedRoles={['hod']}>
                            <HODStudentManagement />
                        </ProtectedRoute>
                    }
                />

                {/* Advisor Routes */}
                <Route
                    path="/advisor/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['advisor']}>
                            <AdvisorDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/advisor/student/:studentId"
                    element={
                        <ProtectedRoute allowedRoles={['advisor']}>
                            <AdvisorStudentDetail />
                        </ProtectedRoute>
                    }
                />

                {/* Counsellor Routes */}
                <Route
                    path="/counsellor/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['counsellor']}>
                            <CounsellorDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/leaderboard"
                    element={
                        <ProtectedRoute allowedRoles={['student', 'admin', 'hod', 'counsellor', 'advisor']}>
                            <Leaderboard />
                        </ProtectedRoute>
                    }
                />

                <Route path="*" element={<NotFound />} />
            </Routes>
        </AuthProvider>
    )
}

export default AppRoutes
