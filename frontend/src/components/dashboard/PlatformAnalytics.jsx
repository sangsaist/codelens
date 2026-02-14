
import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import GrowthBadge from './GrowthBadge'

import Loader from '../common/Loader'
import { getSnapshots } from '../../api/snapshots'
import { getMyGrowth } from '../../api/analytics'

const PlatformAnalytics = ({ platforms }) => {
    const [selectedPlatformId, setSelectedPlatformId] = useState('')
    const [snapshots, setSnapshots] = useState([])
    const [growth, setGrowth] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (platforms.length > 0 && !selectedPlatformId) {
            setSelectedPlatformId(platforms[0].id)
        }
    }, [platforms])

    useEffect(() => {
        const fetchData = async () => {
            if (!selectedPlatformId) return

            setLoading(true)
            setError(null)
            try {
                const [snapshotsData, growthData] = await Promise.all([
                    getSnapshots(selectedPlatformId),
                    getMyGrowth(selectedPlatformId)
                ])

                if (snapshotsData.success) {
                    // Sort descending for table, ascending for chart
                    const sorted = snapshotsData.data.sort((a, b) => new Date(a.snapshot_date) - new Date(b.snapshot_date))
                    setSnapshots(sorted)
                } else {
                    setError(snapshotsData.error)
                }

                if (growthData.success) {
                    setGrowth(growthData.data)
                } else {
                    // Growth endpoint might fail if not enough snapshots, handle gracefully
                    setGrowth(null)
                }

            } catch (err) {
                console.error("Failed to fetch platform data", err)
                setError("Failed to load platform data.")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [selectedPlatformId])

    if (!platforms || platforms.length === 0) return null;

    return (
        <div className="mt-8">
            {/* Header + Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 md:mb-0">Analytics Deep Dive</h3>
                <div className="w-full md:w-64">
                    <select
                        value={selectedPlatformId}
                        onChange={(e) => setSelectedPlatformId(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 pl-3 pr-10 text-base sm:text-sm"
                    >
                        {platforms.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.platform_name.charAt(0).toUpperCase() + p.platform_name.slice(1)} - {p.username}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <Loader />
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
                    {error}
                </div>
            ) : (
                <>
                    {/* Growth Summary */}
                    {growth ? (
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-6">
                            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Growth Summary (Latest vs Previous)</h4>
                            <GrowthBadge growth={growth} />
                        </div>
                    ) : snapshots.length < 2 ? (
                        <div className="bg-blue-50 border border-blue-100 text-blue-700 p-4 rounded-lg mb-6 text-sm">
                            Growth calculation requires at least 2 snapshots. Keep solving!
                        </div>
                    ) : null}

                    {/* Charts Grid */}
                    {snapshots.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                <h4 className="text-sm font-medium text-gray-900 mb-4">Total Solved Trend</h4>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={snapshots} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                            <XAxis
                                                dataKey="snapshot_date"
                                                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                                                tickLine={false}
                                                tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                                labelStyle={{ color: '#6B7280', marginBottom: '0.25rem' }}
                                                labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="total_solved"
                                                name="Questions Solved"
                                                stroke="#4F46E5"
                                                strokeWidth={2}
                                                dot={false}
                                                activeDot={{ r: 6, fill: '#4F46E5', stroke: '#fff', strokeWidth: 2 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                <h4 className="text-sm font-medium text-gray-900 mb-4">Rating Trend</h4>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={snapshots} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                            <XAxis
                                                dataKey="snapshot_date"
                                                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                                                tickLine={false}
                                                tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            />
                                            <YAxis
                                                domain={['auto', 'auto']}
                                                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                                labelStyle={{ color: '#6B7280', marginBottom: '0.25rem' }}
                                                labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="contest_rating"
                                                name="Contest Rating"
                                                stroke="#10B981"
                                                strokeWidth={2}
                                                dot={false}
                                                activeDot={{ r: 6, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }}
                                                connectNulls={true}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm mb-8">
                            <p className="text-gray-500">No snapshot history available for this platform yet.</p>
                        </div>
                    )}

                    {/* History Table */}
                    {snapshots.length > 0 && (
                        <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider">Snapshot History</h3>
                                <span className="text-xs text-gray-500 font-mono">Latest First</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Solved</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Global Rank</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {[...snapshots].reverse().map((snap) => (
                                            <tr key={snap.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                                    {new Date(snap.snapshot_date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {snap.total_solved}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {snap.contest_rating || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {snap.global_rank ? `#${snap.global_rank}` : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex items-center">
                                                        {(!snap.status || snap.status === 'pending') && (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                <Clock className="-ml-0.5 mr-1.5 h-3 w-3" aria-hidden="true" />
                                                                Pending
                                                            </span>
                                                        )}
                                                        {snap.status === 'approved' && (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                <CheckCircle className="-ml-0.5 mr-1.5 h-3 w-3" aria-hidden="true" />
                                                                Approved
                                                            </span>
                                                        )}
                                                        {snap.status === 'rejected' && (
                                                            <div className="group relative flex flex-col">
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 cursor-help">
                                                                    <XCircle className="-ml-0.5 mr-1.5 h-3 w-3" aria-hidden="true" />
                                                                    Rejected
                                                                </span>
                                                                {snap.remarks && (
                                                                    <div className="hidden group-hover:block absolute bottom-full mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded z-50">
                                                                        <div className="font-bold mb-1">Remarks:</div>
                                                                        {snap.remarks}
                                                                        <svg className="absolute text-gray-900 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255" xmlSpace="preserve"><polygon className="fill-current" points="0,0 127.5,127.5 255,0" /></svg>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default PlatformAnalytics
