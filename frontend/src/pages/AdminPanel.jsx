
import { useState, useEffect } from 'react'
import Navbar from '../components/layout/Navbar'
import DepartmentTable from '../components/admin/DepartmentTable'
import StudentTable from '../components/admin/StudentTable'
import CreateDepartmentModal from '../components/admin/CreateDepartmentModal'
import Loader from '../components/common/Loader'
import Toast from '../components/common/Toast'
import { getDepartments, getAllStudents, assignDepartment, unassignDepartment, deleteStudent } from '../api/admin'

const AdminPanel = () => {
    const [departments, setDepartments] = useState([])
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [toast, setToast] = useState(null)

    const fetchAllData = async () => {
        setLoading(true)
        try {
            const [deptRes, studRes] = await Promise.all([
                getDepartments(),
                getAllStudents()
            ])

            if (deptRes.success) setDepartments(deptRes.data)
            else console.error("Failed to fetch departments", deptRes.error)

            if (studRes.success) setStudents(studRes.data)
            else console.error("Failed to fetch students", studRes.error)

        } catch (error) {
            console.error("Admin data fetch error", error)
            setToast({ type: 'error', message: "Failed to load dashboard data." })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAllData()
    }, [])

    const handleAssign = async (studentId, deptId) => {
        try {
            const res = await assignDepartment(studentId, deptId)
            if (res.success) {
                setToast({ type: 'success', message: "Student assigned successfully!" })
                // Optimistic Update
                setStudents(prev => prev.map(s => s.id === studentId ? {
                    ...s,
                    department_id: deptId,
                    department_name: departments.find(d => d.id === deptId)?.name
                } : s))
            } else {
                setToast({ type: 'error', message: res.error || "Failed to assign" })
            }
        } catch (error) {
            setToast({ type: 'error', message: "Server error during assignment" })
        }
    }

    const handleUnassign = async (studentId) => {
        if (!window.confirm("Are you sure you want to remove this student from the department?")) return;
        try {
            // Assuming unassign API returns success
            const res = await unassignDepartment(studentId)
            if (res.success) {
                setToast({ type: 'success', message: "Student unassigned." })
                // Optimistic Update
                setStudents(prev => prev.map(s => s.id === studentId ? { ...s, department_id: null, department_name: null } : s))
            } else {
                setToast({ type: 'error', message: res.error || "Failed to unassign" })
            }
        } catch (error) {
            setToast({ type: 'error', message: "Server error during unassign" })
        }
    }

    const handleDeleteStudent = async (studentId) => {
        if (!window.confirm("Are you sure you want to permanently delete this student? This action cannot be undone.")) return;
        try {
            const res = await deleteStudent(studentId)
            if (res.success) {
                setToast({ type: 'success', message: "Student deleted." })
                setStudents(prev => prev.filter(s => s.id !== studentId))
            } else {
                setToast({ type: 'error', message: res.error || "Failed to delete student" })
            }
        } catch (error) {
            setToast({ type: 'error', message: "Server error deletion" })
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <header className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Admin Panel</h1>
                        <p className="mt-1 text-sm text-gray-500">Manage departments and student assignments.</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        + Create Department
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {loading ? (
                    <Loader />
                ) : (
                    <div className="space-y-8">
                        {/* Departments Section */}
                        <DepartmentTable
                            departments={departments}
                            loading={loading}
                            onRefresh={fetchAllData}
                            onError={(msg) => setToast({ type: 'error', message: msg })}
                        />

                        {/* Students Section */}
                        <StudentTable
                            students={students}
                            departments={departments}
                            loading={loading}
                            onAssign={handleAssign}
                            onUnassign={handleUnassign}
                            onDelete={handleDeleteStudent}
                            onError={(msg) => setToast({ type: 'error', message: msg })}
                        />
                    </div>
                )}
            </main>

            <CreateDepartmentModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={(msg) => {
                    setToast({ type: 'success', message: msg })
                    fetchAllData()
                }}
                onError={(msg) => setToast({ type: 'error', message: msg })}
            />
        </div>
    )
}

export default AdminPanel
