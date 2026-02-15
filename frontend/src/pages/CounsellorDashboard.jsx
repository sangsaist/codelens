
import { useState, useEffect } from 'react'
import { getCounsellorSummary, getDepartmentStudents as getMyStudents } from '../api/counsellor'
import { getPendingSnapshots } from '../api/review'
import Navbar from '../components/layout/Navbar'
import Loader from '../components/common/Loader'
import ApprovalTable from '../components/counsellor/ApprovalTable'
import ReviewModal from '../components/counsellor/ReviewModal'
import Toast from '../components/common/Toast'

// Tabs Configuration
const TABS = [
    { id: 'pending', label: 'Pending Approvals' },
    { id: 'students', label: 'My Students' },
    { id: 'history', label: 'Review History' }
]

const CounsellorDashboard = () => {
    const [summary, setSummary] = useState(null)
    const [pendingSnapshots, setPendingSnapshots] = useState([])
    const [myStudents, setMyStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('pending')
    const [error, setError] = useState(null)
    const [toast, setToast] = useState(null)

    // Modal State
    const [isReviewOpen, setIsReviewOpen] = useState(false)
    const [selectedSnapshot, setSelectedSnapshot] = useState(null)

    const fetchData = async () => {
        setLoading(true)
        try {
            const [summaryRes, pendingRes, studentsRes] = await Promise.all([
                getCounsellorSummary(),
                getPendingSnapshots(),
                getMyStudents()
            ])

            if (summaryRes.success) setSummary(summaryRes.data)
            else setError(summaryRes.error || "Failed to fetch summary")

            if (pendingRes.success) setPendingSnapshots(pendingRes.data)
            else console.error(pendingRes.error)

            if (studentsRes.success) setMyStudents(studentsRes.data)
            else console.error(studentsRes.error)

        } catch (err) {
            console.error(err)
            setError("Failed to load dashboard data")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleReviewAction = (msg) => {
        setToast({ type: 'success', message: msg })
        fetchData()
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader />
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="mx-auto max-w-7xl px-4 py-8">
                    <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">Error: {error}</div>
                </div>
            </div>
        )
    }

    const StatCard = ({ title, value, color = "text-gray-900" }) => (
        <div className="bg-white overflow-hidden shadow-sm rounded-xl p-6 border border-gray-100 transition-all hover:shadow-md">
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className={`mt-1 text-3xl font-semibold tracking-tight ${color}`}>{value}</dd>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Navbar />

            {toast && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}

            <header className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Counsellor Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500">Department: <span className="font-semibold text-indigo-600">{summary?.department_name}</span></p>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">

                {/* 1. Summary Cards */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <StatCard
                        title="Assigned Students"
                        value={summary?.total_students || 0}
                        color="text-indigo-600"
                    />
                    <StatCard
                        title="Pending Reviews"
                        value={pendingSnapshots.length}
                        color={pendingSnapshots.length > 0 ? "text-yellow-600" : "text-green-600"}
                    />
                    <StatCard
                        title="At-Risk Students"
                        value={summary?.at_risk_count}
                        color={summary?.at_risk_count > 0 ? "text-red-600" : "text-green-600"}
                    />
                </div>

                {/* 2. Content Area */}
                <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden min-h-[500px]">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                        ${activeTab === tab.id
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                    `}
                                >
                                    {tab.label}
                                    {tab.id === 'pending' && pendingSnapshots.length > 0 && (
                                        <span className="ml-2 bg-yellow-100 text-yellow-800 py-0.5 px-2 rounded-full text-xs">
                                            {pendingSnapshots.length}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-0">
                        {activeTab === 'pending' && (
                            <ApprovalTable
                                snapshots={pendingSnapshots}
                                status="Pending"
                                onReview={(snap) => {
                                    setSelectedSnapshot(snap)
                                    setIsReviewOpen(true)
                                }}
                            />
                        )}

                        {activeTab === 'students' && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Register No</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Solved</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {myStudents.map((student) => (
                                            <tr key={student.student_id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.full_name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.register_number}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold text-right">{student.total_solved}</td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${student.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {student.growth > 0 ? '+' : ''}{student.growth}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {student.is_risk ? (
                                                        <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">At Risk</span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">On Track</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {myStudents.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-500">
                                                    No students assigned to you yet.
                                                    <br />
                                                    Ask your Advisor to assign students.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="p-12 text-center text-gray-500">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Review History</h3>
                                <p className="mt-1 text-sm text-gray-500">View past approvals and rejections here (Coming Soon).</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <ReviewModal
                isOpen={isReviewOpen}
                onClose={() => setIsReviewOpen(false)}
                snapshot={selectedSnapshot}
                onActionComplete={handleReviewAction}
            />
        </div>
    )
}

export default CounsellorDashboard
