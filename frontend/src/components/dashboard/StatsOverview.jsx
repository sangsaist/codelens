
const StatsOverview = ({ stats }) => {
    // Determine growth color and symbol
    const getGrowthColor = (growth) => {
        if (growth > 0) return 'text-green-600'
        if (growth < 0) return 'text-red-600'
        return 'text-gray-500'
    }

    const growthSymbol = (growth) => {
        if (growth > 0) return '+'
        if (growth < 0) return ''
        return ''
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow-sm rounded-xl p-6 border border-gray-100">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Platforms Linked</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{stats.total_platforms_linked}</dd>
            </div>
            <div className="bg-white overflow-hidden shadow-sm rounded-xl p-6 border border-gray-100">
                <dt className="text-sm font-medium text-gray-500 truncate">Overall Total Solved</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-indigo-600">{stats.overall_total_solved}</dd>
            </div>
            <div className="bg-white overflow-hidden shadow-sm rounded-xl p-6 border border-gray-100">
                <dt className="text-sm font-medium text-gray-500 truncate">Average Rating</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{stats.overall_rating_average}</dd>
            </div>
            <div className="bg-white overflow-hidden shadow-sm rounded-xl p-6 border border-gray-100">
                <dt className="text-sm font-medium text-gray-500 truncate">Overall Growth</dt>
                <dd className={`mt-1 text-3xl font-semibold tracking-tight ${getGrowthColor(stats.overall_growth)}`}>
                    {growthSymbol(stats.overall_growth)}{stats.overall_growth}
                </dd>
            </div>
        </div>
    )
}

export default StatsOverview
