
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Loader from '../components/common/Loader'
import { getMyStudents } from '../api/advisor'

const AdvisorDashboard = () => {
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await getMyStudents()
                if (res.success) {
                    setStudents(res.data)
                } else {
                    setError(res.error || "Failed to fetch assigned students")
                }
            } catch (err) {
                console.error(err)
                setError("Failed to load dashboard data")
            } finally {
                setLoading(false)
            }
        }
        fetchStudents()
    }, [])

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
                    <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">Error: {error}</div>
                </div>
            </div>
        )
    }

    // Calculations
    const totalStudents = students.length
    const avgGrowth = totalStudents > 0
        ? (students.reduce((acc, curr) => acc + curr.growth, 0) / totalStudents).toFixed(2)
        : 0
    // "At Risk" logic for Advisor: Growth <= 0 or inactive > 30 days (backend handles dates, but let's check simple growth here for card)
    // Actually backend doesn't return risk flag explicitly for advisor list, so we infer from growth <= 0
    const atRiskCount = students.filter(s => s.growth <= 0).length

    const StatCard = ({ title, value, color = "text-gray-900" }) => (
        <div className="bg-white overflow-hidden shadow-sm rounded-xl p-6 border border-gray-100">
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className={`mt-1 text-3xl font-semibold tracking-tight ${color}`}>{value}</dd>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <header className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Advisor Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500">Monitor your assigned students' progress.</p>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="Assigned Students" value={totalStudents} />
                    <StatCard title="Average Growth" value={avgGrowth > 0 ? `+${avgGrowth}` : avgGrowth} color={avgGrowth >= 0 ? 'text-green-600' : 'text-red-600'} />
                    <StatCard title="At Risk (Low Growth)" value={atRiskCount} color={atRiskCount > 0 ? 'text-red-600' : 'text-green-600'} />
                </div>

                {/* Table */}
                <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Your Students</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Solved</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                                    <th className="relative px-6 py-3"><span className="sr-only">View</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {students.map((student) => (
                                    <tr key={student.student_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.full_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.department_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold text-right">{student.total_solved}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${student.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {student.growth > 0 ? '+' : ''}{student.growth}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                            {student.last_active_date !== 'Never' ? new Date(student.last_active_date).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link to={`/advisor/student/${student.student_id}`} className="text-indigo-600 hover:text-indigo-900">View Details</Link>
                                        </td>
                                    </tr>
                                ))}
                                {students.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">No students assigned to you yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default AdvisorDashboard
