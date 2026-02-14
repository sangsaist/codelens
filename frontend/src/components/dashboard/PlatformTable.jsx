
import { useState } from 'react'
import PerformanceChart from '../charts/PerformanceChart'
import { getSnapshots } from '../../api/snapshots'

const PlatformTable = ({ platforms, onRefresh }) => {
    const [expandedRow, setExpandedRow] = useState(null)
    const [snapshotData, setSnapshotData] = useState([])
    const [chartLoading, setChartLoading] = useState(false)

    const handleExpand = async (platform, index) => {
        if (expandedRow === index) {
            setExpandedRow(null)
            return
        }

        setExpandedRow(index)
        setChartLoading(true)

        try {
            if (platform.id) {
                const data = await getSnapshots(platform.id)
                if (data.success) {
                    const sorted = data.data.sort((a, b) => new Date(a.snapshot_date) - new Date(b.snapshot_date))
                    setSnapshotData(sorted)
                }
            } else {
                // If simple summary view without platform ID linkage (e.g. backend doesn't return ID in summary)
                console.warn("Platform ID missing, chart unavailable")
            }
        } catch (error) {
            console.error("Failed to fetch snapshots", error)
        } finally {
            setChartLoading(false)
        }
    }

    const getGrowthColor = (growth) => {
        if (growth > 0) return 'text-green-600'
        if (growth < 0) return 'text-red-600'
        return 'text-gray-500' // 0 or null
    }

    const formatGrowth = (growth, percentage) => {
        const symbol = growth > 0 ? '+' : ''
        return `${symbol}${growth} (${percentage}%)`
    }

    return (
        <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Linked Platforms</h3>
                <span className="text-sm text-gray-500">{platforms.length} total</span>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Latest Total Solved</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Latest Rating</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth %</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Snapshot Date</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {platforms.map((platform, index) => (
                            <div key={index} style={{ display: 'contents' }}>
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                                        {platform.platform_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <a href={`https://${platform.platform_name.toLowerCase()}.com/${platform.username}`} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 hover:underline">
                                            {platform.username}
                                        </a>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                                        {platform.latest_total_solved}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                                        {platform.latest_rating || '-'}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${getGrowthColor(platform.total_growth)}`}>
                                        {formatGrowth(platform.total_growth, platform.growth_percentage)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {platform.last_snapshot_date ? new Date(platform.last_snapshot_date).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {platform.id ? (
                                            <button
                                                onClick={() => handleExpand(platform, index)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                {expandedRow === index ? 'Hide Chart' : 'View Chart'}
                                            </button>
                                        ) : (
                                            <span className="text-gray-400 text-xs italic">No chart</span>
                                        )}
                                    </td>
                                </tr>
                                {expandedRow === index && platform.id && (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-4 bg-gray-50">
                                            {chartLoading ? (
                                                <div className="flex justify-center py-4 text-sm text-gray-500">Loading chart data...</div>
                                            ) : (
                                                <PerformanceChart data={snapshotData} />
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </div>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default PlatformTable
