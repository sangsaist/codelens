
import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'
import Navbar from '../components/layout/Navbar'
import Loader from '../components/common/Loader'
import { getInstitutionSummary, getDepartmentPerformance, getTopPerformers, getAtRiskStudents } from '../api/institution'

const InstitutionDashboard = () => {
    const [summary, setSummary] = useState(null)
    const [deptPerformance, setDeptPerformance] = useState([])
    const [topPerformers, setTopPerformers] = useState([])
    const [atRiskStudents, setAtRiskStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true)
                const [summaryRes, deptRes, topRes, riskRes] = await Promise.all([
                    getInstitutionSummary(),
                    getDepartmentPerformance(),
                    getTopPerformers(),
                    getAtRiskStudents()
                ])

                if (summaryRes.success) setSummary(summaryRes.data)
                else throw new Error(summaryRes.error || "Failed to fetch summary")

                if (deptRes.success) setDeptPerformance(deptRes.data)
                else throw new Error(deptRes.error || "Failed to fetch department performance")

                if (topRes.success) setTopPerformers(topRes.data)
                else throw new Error(topRes.error || "Failed to fetch top performers")

                if (riskRes.success) setAtRiskStudents(riskRes.data)
                else throw new Error(riskRes.error || "Failed to fetch at-risk students")

            } catch (err) {
                console.error("Institution Dashboard fetch error:", err)
                setError(err.message || "Failed to load dashboard data")
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
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
                    <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        Error: {error}
                    </div>
                </div>
            </div>
        )
    }

    const StatCard = ({ title, value, subtext }) => (
        <div className="bg-white overflow-hidden shadow-sm rounded-xl p-6 border border-gray-100">
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{value}</dd>
            {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <header className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Institution Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500">Overview of academic performance and engagement.</p>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">

                {/* Section 1: Overview Cards */}
                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <StatCard title="Total Students" value={summary.total_students} />
                        <StatCard title="Total Depts" value={summary.total_departments} />
                        <StatCard title="Linked Platforms" value={summary.total_linked_platforms} />
                        <StatCard title="Total Solved" value={summary.total_problems_solved} subtext="Across all platforms" />
                        <StatCard title="Avg Rating" value={summary.average_rating} />
                        <StatCard title="Total Growth" value={summary.total_growth > 0 ? `+${summary.total_growth}` : summary.total_growth} />
                    </div>
                )}

                {/* Section 2: Department Performance Chart */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Department Performance</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deptPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="department_name" tick={{ fontSize: 12, fill: '#6B7280' }} />
                                <YAxis yAxisId="left" orientation="left" stroke="#4F46E5" tick={{ fontSize: 12 }} />
                                <YAxis yAxisId="right" orientation="right" stroke="#10B981" tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    cursor={{ fill: '#F3F4F6' }}
                                />
                                <Legend />
                                <Bar yAxisId="left" dataKey="total_solved" name="Total Solved" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                                <Bar yAxisId="right" dataKey="total_students" name="Students" fill="#10B981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Section 3: Top Performers Table */}
                    <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Top Performers</h3>
                            <span className="text-sm text-gray-500">Top 10</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dept</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Solved</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {topPerformers.map((student, index) => (
                                        <tr key={student.student_id} className={`hover:bg-gray-50 ${index < 3 ? 'bg-yellow-50/30' : ''}`}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium text-left">#{student.rank}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left">{student.full_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">{student.department_name || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-bold text-right">{student.total_solved}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">{student.average_rating}</td>
                                        </tr>
                                    ))}
                                    {topPerformers.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No data available</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Section 4: At-Risk Students Panel */}
                    <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-red-50">
                            <h3 className="text-lg font-medium leading-6 text-red-900">At-Risk Students</h3>
                            <span className="inline-flex items-center rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">Action Required</span>
                        </div>

                        {atRiskStudents.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                </div>
                                <h3 className="mt-2 text-sm font-semibold text-gray-900">All Clear</h3>
                                <p className="mt-1 text-sm text-gray-500">No students are currently flagged as at-risk.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dept</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {atRiskStudents.map((student) => (
                                            <tr key={student.student_id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left">{student.full_name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">{student.department_name || '-'}</td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-left ${student.growth < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                                                    {student.growth > 0 ? '+' : ''}{student.growth}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">
                                                    {student.last_snapshot_date !== 'Never' ? new Date(student.last_snapshot_date).toLocaleDateString() : 'Never'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

            </main>
        </div>
    )
}

export default InstitutionDashboard
