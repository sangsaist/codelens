
const GrowthBadge = ({ growth }) => {
    if (!growth) return null;

    const Metric = ({ label, value, isPercentage = false }) => {
        const numValue = parseFloat(value);
        const isPositive = numValue > 0;
        const isNegative = numValue < 0;

        let bgColor = "bg-gray-100";
        let textColor = "text-gray-800";

        if (isPositive) {
            bgColor = "bg-green-100";
            textColor = "text-green-800";
        } else if (isNegative) {
            bgColor = "bg-red-100";
            textColor = "text-red-800";
        }

        // Format value
        let displayValue = numValue;
        if (isPercentage) displayValue = numValue.toFixed(2);

        return (
            <div className={`flex flex-col items-center justify-center p-3 rounded-lg ${bgColor} ${textColor} min-w-[100px]`}>
                <span className="text-xs font-semibold uppercase tracking-wider mb-1 opacity-80">{label}</span>
                <span className="text-xl font-bold leading-none">
                    {isPositive ? '+' : ''}{displayValue}{isPercentage ? '%' : ''}
                </span>
            </div>
        );
    };

    return (
        <div className="flex flex-wrap gap-4 mt-2 mb-6">
            <Metric label="Total Solved" value={growth.total_growth} />
            <Metric label="Growth %" value={growth.growth_percentage} isPercentage={true} />
            <Metric label="Rating Points" value={growth.rating_growth} />
        </div>
    );
};

export default GrowthBadge;
