
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PerformanceChart = ({ data }) => {
    return (
        <div className="h-64 w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Performance History</h4>
            {data && data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis
                            dataKey="snapshot_date"
                            tick={{ fontSize: 12, fill: '#6B7280' }}
                            tickFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="total_solved"
                            stroke="#4F46E5"
                            strokeWidth={2}
                            dot={{ fill: '#4F46E5', r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                    No history data available
                </div>
            )}
        </div>
    );
};

export default PerformanceChart;
