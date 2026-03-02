import React from "react";
import {
    Briefcase,
    DollarSign,
    TrendingUp,
    Users,
    Shield,
    BarChart3
} from "lucide-react";
import StatCard from "./StatCard";
import SectionCard from "./SectionCard";
import EmptyState from "./EmptyState";

const PerformanceTab = ({ profile, campaigns }) => {
    const totalCampaigns = profile?.stats?.campaigns || campaigns?.length || 0;

    const totalSpend = campaigns?.reduce((sum, c) => {
        const budget = parseFloat(String(c.budget).replace(/[^0-9.]/g, ""));
        return sum + (isNaN(budget) ? 0 : budget);
    }, 0) || 0;

    const roasValues = (campaigns || [])
        .map(c => parseFloat(String(c.roi).replace(/[^0-9.]/g, "")))
        .filter(v => !isNaN(v) && v > 0);
    const avgRoas = roasValues.length > 0
        ? (roasValues.reduce((s, v) => s + v, 0) / roasValues.length).toFixed(1)
        : null;

    const completedCampaigns = (campaigns || []).filter(c =>
        c.status === "Completed" || c.status === "completed"
    ).length;
    const completionRate = totalCampaigns > 0
        ? Math.round((completedCampaigns / totalCampaigns) * 100)
        : null;

    const hasData = totalCampaigns > 0;

    const metrics = [
        {
            icon: Briefcase,
            label: "Total Campaigns",
            value: totalCampaigns.toString(),
            subtext: `${completedCampaigns} completed`,
            delay: 0
        },
        {
            icon: DollarSign,
            label: "Total Spend",
            value: totalSpend > 0 ? `$${totalSpend.toLocaleString()}` : "$0",
            subtext: "Across all campaigns",
            delay: 0.05
        },
        {
            icon: TrendingUp,
            label: "Average ROAS",
            value: avgRoas ? `${avgRoas}x` : "—",
            subtext: avgRoas ? "Return on ad spend" : "No data yet",
            delay: 0.1
        },
        {
            icon: Users,
            label: "Creator Retention",
            value: profile?.stats?.rating || "—",
            subtext: "Brand rating",
            delay: 0.15
        },
        {
            icon: Shield,
            label: "Escrow Reliability",
            value: hasData ? "100%" : "—",
            subtext: hasData ? "Fully funded" : "No campaigns",
            delay: 0.2
        },
        {
            icon: BarChart3,
            label: "Completion Rate",
            value: completionRate !== null ? `${completionRate}%` : "—",
            subtext: completionRate !== null ? `${completedCampaigns}/${totalCampaigns} campaigns` : "No data",
            delay: 0.25
        }
    ];

    return (
        <div className="bp-tab-content" role="tabpanel" id="panel-performance" aria-labelledby="tab-performance">
            {hasData ? (
                <SectionCard
                    icon={BarChart3}
                    title="Performance Overview"
                    subtitle="Key metrics from your campaigns"
                >
                    <div className="bp-stat-grid">
                        {metrics.map(metric => (
                            <StatCard key={metric.label} {...metric} />
                        ))}
                    </div>
                </SectionCard>
            ) : (
                <EmptyState
                    icon={BarChart3}
                    title="No performance data yet"
                    description="Launch your first campaign to start tracking performance metrics like ROAS, creator retention, and spend."
                    actionLabel="Create Campaign"
                    onAction={() => {
                        window.location.href = "/brand/campaigns/create";
                    }}
                />
            )}
        </div>
    );
};

export default PerformanceTab;
