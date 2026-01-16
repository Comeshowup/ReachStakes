import React from "react";
import { ShieldCheck, Lock, Info } from "lucide-react";
import { motion } from "framer-motion";

const GuaranteedPayBadge = ({ status, variant, size = "md", className = "" }) => {
    // Compatibility: Map 'variant' to internal status logic if provided
    // variant: 'guaranteed' | 'locked'
    const isGuaranteed = variant === "guaranteed" || (status && status !== "Locked" && status !== "Pending" && status !== "None");

    const sizeClasses = {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-3 py-1 text-xs",
        lg: "px-4 py-1.5 text-sm"
    };

    const iconSizes = {
        sm: 12,
        md: 14,
        lg: 16
    };

    if (status === "None") return null;

    return (
        <div className="relative group inline-flex">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`inline-flex items-center gap-1.5 rounded-full font-bold shadow-sm backdrop-blur-sm border transition-all duration-300 ${isGuaranteed
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:bg-emerald-500/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                    } ${sizeClasses[size] || sizeClasses.md} ${className}`}
                whileHover={{ scale: 1.02 }}
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

            {/* Custom Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                <div className="bg-slate-900 border border-slate-700 text-white text-xs p-3 rounded-xl shadow-xl text-center">
                    <p className="font-bold mb-1">{isGuaranteed ? "Funds Secured" : "Payment Not Verified"}</p>
                    <p className="text-slate-400 text-[10px] leading-tight">
                        {isGuaranteed
                            ? "Full campaign budget is held in escrow and released upon approval."
                            : "Brand has not yet funded this campaign in escrow."}
                    </p>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-700"></div>
                </div>
            </div>
        </div>
    );
};

export default GuaranteedPayBadge;
