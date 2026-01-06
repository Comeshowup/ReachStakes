import React from "react";
import { CheckCircle2, ShieldCheck, Crown } from "lucide-react";
import { motion } from "framer-motion";

const ReachVerifiedBadge = ({ tier = "None", size = "md", className = "" }) => {
    if (tier === "None" || !tier) return null;

    const tiers = {
        Silver: {
            color: "text-slate-300",
            bg: "bg-slate-500/10",
            border: "border-slate-400/20",
            icon: CheckCircle2,
            label: "Verified"
        },
        Gold: {
            color: "text-yellow-400",
            bg: "bg-yellow-500/10",
            border: "border-yellow-500/20",
            icon: ShieldCheck,
            label: "Gold Tier"
        },
        Black: {
            color: "text-white",
            bg: "bg-black/80 dark:bg-slate-800",
            border: "border-slate-700",
            icon: Crown,
            label: "Elite"
        }
    };

    const config = tiers[tier] || tiers.Silver;
    const Icon = config.icon;

    const sizeClasses = {
        sm: "h-5 px-1.5 text-[10px]",
        md: "h-6 px-2.5 text-xs",
        lg: "h-8 px-3 text-sm"
    };

    const iconSizes = {
        sm: 10,
        md: 12,
        lg: 16
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            className={`inline-flex items-center gap-1.5 rounded-full font-bold shadow-sm backdrop-blur-sm border ${config.bg} ${config.color} ${config.border} ${sizeClasses[size] || sizeClasses.md} ${className}`}
            title={`ReachVerified: ${tier} Tier`}
        >
            <Icon size={iconSizes[size] || 12} strokeWidth={2.5} />
            <span>{config.label}</span>
        </motion.div>
    );
};

export const ReachVerifiedBadgeCompact = (props) => <ReachVerifiedBadge {...props} size="sm" />;

export default ReachVerifiedBadge;
