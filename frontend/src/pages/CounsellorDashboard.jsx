
import { useState, useEffect } from 'react'
import { getCounsellorSummary } from '../api/counsellor'
import { getPendingSnapshots } from '../api/review'
import Navbar from '../components/layout/Navbar'
import Loader from '../components/common/Loader'
import ApprovalTable from '../components/counsellor/ApprovalTable'
import ReviewModal from '../components/counsellor/ReviewModal'
import Toast from '../components/common/Toast'

// Tabs Configuration
const TABS = [
    { id: 'pending', label: 'Pending' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' },
    { id: 'all', label: 'All' }
]

const CounsellorDashboard = () => {
    const [summary, setSummary] = useState(null)
    const [pendingSnapshots, setPendingSnapshots] = useState([])
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
            const [summaryRes, pendingRes] = await Promise.all([
                getCounsellorSummary(),
                getPendingSnapshots()
            ])

            if (summaryRes.success) setSummary(summaryRes.data)
            else setError(summaryRes.error || "Failed to fetch summary")

            if (pendingRes.success) setPendingSnapshots(pendingRes.data)
            else console.error(pendingRes.error)

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
        // Refresh data
        fetchData()
        // Or optimistically update local state:
        // setPendingSnapshots(prev => prev.filter(s => s.snapshot_id !== selectedSnapshot.snapshot_id))
        // But fetch is safer to get summary updates too.
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

    const StatCard = ({ title, value, icon, color = "text-gray-900" }) => (
        <div className="bg-white overflow-hidden shadow-sm rounded-xl p-6 border border-gray-100 transition-all hover:shadow-md">
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className={`mt-1 text-3xl font-semibold tracking-tight ${color}`}>{value}</dd>
        </div>
    )

    // Determine data to show based on tab
    // Since backend only provides pending list and aggregate counts, we simulate empty lists for history.
    let tableData = []
    let tableStatus = 'Pending'

    if (activeTab === 'pending') {
        tableData = pendingSnapshots
        tableStatus = 'Pending'
    } else if (activeTab === 'approved') {
        tableData = [] // No endpoint available
        tableStatus = 'Approved'
    } else if (activeTab === 'rejected') {
        tableData = [] // No endpoint available
        tableStatus = 'Rejected'
    } else {
        tableData = [] // No endpoint available
        tableStatus = 'All'
    }

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
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Counsellor Review Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500">Department: <span className="font-semibold text-indigo-600">{summary?.department_name}</span></p>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">

                {/* 1. Summary Cards */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <StatCard
                        title="Pending Approvals"
                        value={pendingSnapshots.length}
                        color={pendingSnapshots.length > 0 ? "text-yellow-600" : "text-green-600"}
                    />
                    <StatCard
                        title="Total Solved (Dept)"
                        value={summary?.total_solved}
                        color="text-indigo-600"
                    />
                    <StatCard
                        title="At-Risk Students"
                        value={summary?.at_risk_count}
                        color={summary?.at_risk_count > 0 ? "text-red-600" : "text-green-600"}
                    />
                </div>

                {/* 2. Tab Navigation & Table */}
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

                    {/* Table Content */}
                    <div className="min-h-[400px]">
                        {activeTab !== 'pending' && (
                            <div className="p-4 bg-blue-50 text-blue-700 text-sm mb-4 border-l-4 border-blue-400 mx-6 mt-6">
                                <p className="font-semibold">Historical data feature coming soon.</p>
                                <p>Currently, only pending approvals require action. Approved and rejected records are archived securely.</p>
                            </div>
                        )}

                        <ApprovalTable
                            snapshots={tableData}
                            status={tableStatus}
                            onReview={(snap) => {
                                setSelectedSnapshot(snap)
                                setIsReviewOpen(true)
                            }}
                        />
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
