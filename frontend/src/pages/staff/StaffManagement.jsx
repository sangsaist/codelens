
import { useState, useEffect } from 'react'
import Navbar from '../../components/layout/Navbar'
import MyTeamTable from './MyTeamTable'
import CreateStaffModal from './CreateStaffModal'
import { getMyTeam } from '../../api/staff'
import Toast from '../../components/common/Toast'

const StaffManagement = () => {
    const [staffList, setStaffList] = useState([])
    const [loading, setLoading] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [toast, setToast] = useState(null)

    const fetchMyTeam = async () => {
        setLoading(true)
        try {
            const res = await getMyTeam()
            if (res.success) {
                setStaffList(res.data)
            } else {
                setToast({ type: 'error', message: res.error || "Failed to fetch team" })
            }
        } catch (err) {
            console.error(err)
            setToast({ type: 'error', message: "Server error fetching team" })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMyTeam()
    }, [])

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {toast && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}

            <header className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Staff Management</h1>
                        <p className="mt-1 text-sm text-gray-500">Manage hierarchical staff within your department.</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                    >
                        <svg className="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" />
                        </svg>
                        Create Staff
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <MyTeamTable staffList={staffList} loading={loading} />
            </main>

            <CreateStaffModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={(msg) => {
                    setToast({ type: 'success', message: msg })
                    fetchMyTeam()
                }}
                onError={(msg) => setToast({ type: 'error', message: msg })}
            />
        </div>
    )
}

export default StaffManagement
