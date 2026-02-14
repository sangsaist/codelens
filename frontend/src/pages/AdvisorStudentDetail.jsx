
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import StatsOverview from '../components/dashboard/StatsOverview'
import PlatformTable from '../components/dashboard/PlatformTable'
import PlatformAnalytics from '../components/dashboard/PlatformAnalytics'
import Loader from '../components/common/Loader'
import { getStudentDetail } from '../api/advisor'

const AdvisorStudentDetail = () => {
    const { studentId } = useParams()
    const [summary, setSummary] = useState(null)
    const [platforms, setPlatforms] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true)
            try {
                const res = await getStudentDetail(studentId)
                if (res.success) {
                    setSummary(res.data)
                    // The backend returns "platform_summary" which doesn't have IDs for charts unless we query specifically?
                    // But 'getStudentDetail' backend logic reuses 'get_my_summary' which returns 'platform_summary' list.
                    // However, `PlatformAnalytics` needs `id` to fetch `/snapshots/<id>`.
                    // The 'get_my_summary' returns `PlatformAccount` info but does it return `id`?
                    // Let's check backend `get_my_summary` logic again.
                    // It returns structured objects.
                    // Wait, `get_my_summary` in `analytics/routes.py` returns `platform_name`, `username` but NOT `id` explicitly?
                    // I need to check `analytics/routes.py` lines ~196-200.
                    // It constructs a dictionary: "platform_name": account.platform_name...
                    // It DOES NOT include account.id! That's a blocker for charts.
                    // For StudentDashboard, we did a workaround: fetch `getMyPlatforms` to get IDs.
                    // For Advisor, we only have one endpoint `getStudentDetail`.
                    // I should update `getStudentDetail` (and `get_my_summary` ideally) to return account ID. 
                    // Since I copied logic to `advisor/routes.py`, I can just add `id` there.

                    // Let's assume I fix backend.

                    // Logic to set platforms with ID:
                    // If backend returns ID in platform_summary, we are good.
                    // If not, we can't show charts easily without another call.
                    // I will update `advisor/routes.py` to include `id` in `platform_summary` list. I will do this in next step.

                    // For now, let's map assuming IDs are present.
                    setPlatforms(res.data.platform_summary.map(p => ({
                        ...p,
                        id: p.platform_account_id // I added this in my thought for backend update
                    })))

                } else {
                    setError(res.error || "Failed to fetch student details")
                }
            } catch (err) {
                setError("Failed to load student data")
            } finally {
                setLoading(false)
            }
        }
        fetchDetail()
    }, [studentId])

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader /></div>
    if (error) return <div className="min-h-screen bg-gray-50 p-8"><div className="text-red-600">{error}</div></div>

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{summary?.student_info?.full_name}</h1>
                        <p className="text-gray-500">Department: {summary?.student_info?.department_name} | {summary?.student_info?.register_number}</p>
                    </div>
                    <Link to="/advisor/dashboard" className="text-indigo-600 hover:text-indigo-900 font-medium">← Back to Dashboard</Link>
                </div>

                {summary?.overall_aggregation && <StatsOverview stats={summary.overall_aggregation} />}

                {platforms.length > 0 ? (
                    <>
                        <PlatformTable platforms={platforms} />
                        <PlatformAnalytics platforms={platforms} />
                    </>
                ) : (
                    <div className="bg-white p-8 rounded-xl text-center text-gray-500">Student has not linked any platforms yet.</div>
                )}
            </div>
        </div>
    )
}

export default AdvisorStudentDetail
