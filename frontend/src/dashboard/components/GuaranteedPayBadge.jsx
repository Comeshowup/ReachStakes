import React from "react";
import { ShieldCheck, Lock } from "lucide-react";
import { motion } from "framer-motion";

const GuaranteedPayBadge = ({ status, variant, size = "md", className = "" }) => {
    // Compatibility: Map 'variant' to internal status logic if provided
    // variant: 'guaranteed' | 'locked'
    const isGuaranteed = variant === "guaranteed" || (status && status !== "Locked" && status !== "Pending" && status !== "None");

    const sizeClasses = {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm"
    };

    const iconSizes = {
        sm: 12,
        md: 14,
        lg: 16
    };

    if (status === "None") return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`inline-flex items-center gap-1.5 rounded-full font-bold shadow-sm backdrop-blur-sm border ${isGuaranteed
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10"
                    : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                } ${sizeClasses[size] || sizeClasses.md} ${className}`}
            title={isGuaranteed ? "Funds secured in escrow" : "Payment not guaranteed"}
        >
            {isGuaranteed ? (
                <>
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut"
                        }}
                    >
                        <ShieldCheck size={iconSizes[size] || 14} className="fill-emerald-500/20" />
                    </motion.div>
                    <span>Guaranteed Pay</span>
                </>
            ) : (
                <>
                    <Lock size={iconSizes[size] || 14} />
                    <span>Unsecured</span>
                </>
            )}
        </motion.div>
    );
};

export default GuaranteedPayBadge;
