import React, { useMemo } from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';

const GlobalROIHeatmap = () => {
    // Generate dummy data for the last 365 days
    const data = useMemo(() => {
        const days = [];
        const today = new Date();
        for (let i = 0; i < 365; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - (364 - i));

            // Random intensity 0-4
            // More activity in recent months (higher index)
            let intensity = 0;
            if (Math.random() > 0.4) {
                intensity = Math.floor(Math.random() * 5);
                if (i > 300) intensity = Math.max(intensity, 2); // Boost recent
            }

            days.push({
                date: date.toISOString().split('T')[0],
                intensity: intensity, // 0-4 scale
                value: intensity * 1500 // Rough dollar amount
            });
        }
        return days;
    }, []);

    // Helper to get color based on intensity
    const getColor = (intensity) => {
        const colors = [
            'bg-slate-100 dark:bg-slate-800', // 0
            'bg-emerald-200 dark:bg-emerald-900/40', // 1
            'bg-emerald-300 dark:bg-emerald-700/60', // 2
            'bg-emerald-400 dark:bg-emerald-600', // 3
            'bg-emerald-500 dark:bg-emerald-500', // 4
        ];
        return colors[intensity] || colors[0];
    };

    return (
        <div className="w-full overflow-x-auto pb-2">
            <div className="min-w-[800px]">
                <div className="flex gap-1">
                    {/* Simplified Week Grid - Columns are weeks, Rows are days (Mon-Sun) */}
                    {Array.from({ length: 53 }).map((_, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-1">
                            {Array.from({ length: 7 }).map((_, dayIndex) => {
                                const dayData = data[weekIndex * 7 + dayIndex];
                                if (!dayData) return null;

                                return (
                                    <div
                                        key={dayData.date}
                                        data-tooltip-id="heatmap-tooltip"
                                        data-tooltip-content={`${dayData.date}: $${dayData.value} Revenue`}
                                        className={`w-3 h-3 rounded-sm ${getColor(dayData.intensity)} hover:ring-2 hover:ring-slate-400 dark:hover:ring-slate-500 transition-all cursor-pointer`}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                    <span>Less</span>
                    <div className="flex gap-1 items-center">
                        <div className="w-3 h-3 bg-slate-100 dark:bg-slate-800 rounded-sm" />
                        <div className="w-3 h-3 bg-emerald-200 dark:bg-emerald-900/40 rounded-sm" />
                        <div className="w-3 h-3 bg-emerald-300 dark:bg-emerald-700/60 rounded-sm" />
                        <div className="w-3 h-3 bg-emerald-400 dark:bg-emerald-600 rounded-sm" />
                        <div className="w-3 h-3 bg-emerald-500 dark:bg-emerald-500 rounded-sm" />
                    </div>
                    <span>More</span>
                </div>
            </div>
            {/* Tooltip component */}
            <ReactTooltip id="heatmap-tooltip" place="top" style={{ backgroundColor: '#1e293b', color: '#fff', fontSize: '12px', padding: '4px 8px', borderRadius: '6px' }} />
        </div>
    );
};

export default GlobalROIHeatmap;
