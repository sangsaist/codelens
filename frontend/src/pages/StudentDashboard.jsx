
import { useState, useEffect } from 'react'
import Navbar from '../components/layout/Navbar'
import ProfileCard from '../components/dashboard/ProfileCard'
import StatsOverview from '../components/dashboard/StatsOverview'
import PlatformTable from '../components/dashboard/PlatformTable'
import LinkPlatformModal from '../components/dashboard/LinkPlatformModal'
import ManualEntryModal from '../components/dashboard/ManualEntryModal'
import PlatformAnalytics from '../components/dashboard/PlatformAnalytics'
import Loader from '../components/common/Loader'
import EmptyState from '../components/common/EmptyState'
import Toast from '../components/common/Toast'
import { getMySummary } from '../api/analytics'
import { getMyPlatforms } from '../api/platforms'
import { createSnapshot } from '../api/snapshots'

const StudentDashboard = () => {
    const [summary, setSummary] = useState(null)
    const [platforms, setPlatforms] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [toast, setToast] = useState(null)

    // Modals
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
    const [isEntryModalOpen, setIsEntryModalOpen] = useState(false)
    const [processing, setProcessing] = useState(false)

    const fetchDashboardData = async () => {
        try {
            setLoading(true)
            // Fetch summary
            const summaryData = await getMySummary()
            if (summaryData.success) {
                setSummary(summaryData.data)
            } else {
                setError(summaryData.error || "Failed to fetch summary")
            }

            // Fetch platforms to get IDs (linking logic)
            const platformsData = await getMyPlatforms()
            if (platformsData.success) {
                const summaryList = summaryData.data?.platform_summary || []
                const detailedList = platformsData.data || []

                // Map IDs to summary list
                const mergedPlatforms = summaryList.map(item => {
                    const match = detailedList.find(p =>
                        p.platform_name === item.platform_name &&
                        p.username === item.username
                    )
                    return { ...item, id: match ? match.id : null }
                })

                setPlatforms(mergedPlatforms)
            }

        } catch (err) {
            console.error("Dashboard fetch error:", err)
            setError(err.response?.status === 403 ? "Access Denied" : "Failed to load dashboard data.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const handleLinkSuccess = (msg) => {
        setToast({ type: 'success', message: msg })
        fetchDashboardData() // Refresh data
    }

    const handleLinkError = (msg) => {
        setToast({ type: 'error', message: msg })
    }

    const handleManualEntrySubmit = async (data) => {
        setProcessing(true)
        try {
            const res = await createSnapshot(data)
            if (res.success) {
                setToast({ type: 'success', message: "Progress submitted for approval!" })
                setIsEntryModalOpen(false)
                fetchDashboardData() // Refresh to show pending status if applicable
            } else {
                alert(res.error || "Failed to submit progress")
            }
        } catch (err) {
            console.error(err)
            alert("Error submitting progress")
        } finally {
            setProcessing(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex h-screen items-center justify-center">
                    <Loader />
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="mx-auto max-w-7xl px-4 py-8">
                    <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center">
                        Error: {error}
                    </div>
                </div>
            </div>
        )
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
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Student Dashboard</h1>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setIsEntryModalOpen(true)}
                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                            Update Progress
                        </button>
                        <button
                            onClick={() => setIsLinkModalOpen(true)}
                            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            + Link Platform
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {summary && (
                    <>
                        {/* Profile Section */}
                        {summary.student_info && (
                            <ProfileCard profile={summary.student_info} />
                        )}

                        {/* Stats Overview */}
                        {summary.overall_aggregation && (
                            <StatsOverview stats={summary.overall_aggregation} />
                        )}

                        {/* Platforms Section */}
                        {platforms.length > 0 ? (
                            <>
                                <PlatformTable platforms={platforms} onRefresh={fetchDashboardData} />
                                <PlatformAnalytics platforms={platforms} />
                            </>
                        ) : (
                            <EmptyState
                                message="No platforms linked yet"
                                description="Link your LeetCode or Codeforces account to start tracking progress."
                                actionText="Link Platform"
                                onAction={() => setIsLinkModalOpen(true)}
                            />
                        )}
                    </>
                )}
            </main>

            <LinkPlatformModal
                isOpen={isLinkModalOpen}
                onClose={() => setIsLinkModalOpen(false)}
                onSuccess={handleLinkSuccess}
                onError={handleLinkError}
            />

            <ManualEntryModal
                isOpen={isEntryModalOpen}
                onClose={() => setIsEntryModalOpen(false)}
                platforms={platforms}
                onSubmit={handleManualEntrySubmit}
                processing={processing}
            />
        </div>
    )
}

export default StudentDashboard
