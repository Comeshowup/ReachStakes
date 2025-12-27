import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Briefcase, Sparkles } from "lucide-react";

const RoleSelector = ({ role, setRole }) => {
    return (
        <div className="relative flex p-1 bg-black/40 rounded-xl border border-white/5">
            {["brand", "creator"].map((r) => (
                <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={cn(
                        "flex-1 relative flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors z-10 outline-none focus-visible:ring-2 ring-indigo-500/50 rounded-lg",
                        role === r ? "text-white" : "text-white/50 hover:text-white/80"
                    )}
                >
                    {role === r && (
                        <motion.div
                            layoutId="activeRole"
                            className={cn(
                                "absolute inset-0 rounded-lg shadow-lg",
                                r === "brand" ? "bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-indigo-500/20" : "bg-gradient-to-r from-teal-600 to-teal-500 shadow-teal-500/20"
                            )}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                    )}
                    <span className="relative z-10 flex items-center gap-2 capitalize">
                        {r === "brand" ? <Briefcase className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                        {r}
                    </span>
                </button>
            ))}
        </div>
    );
};

export default RoleSelector;
