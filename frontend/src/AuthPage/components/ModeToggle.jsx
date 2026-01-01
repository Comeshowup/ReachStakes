import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const ModeToggle = ({ mode, setMode, isBrand }) => {
    return (
        <div className="flex justify-center gap-1 bg-white/5 p-1 rounded-md relative mb-8 backdrop-blur-sm border border-white/10 w-fit mx-auto">
            {["login", "signup"].map((m) => (
                <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={cn(
                        "relative z-10 px-6 py-2 text-sm font-medium transition-colors duration-300",
                        mode === m ? "text-white" : "text-white/50 hover:text-white/80"
                    )}
                >
                    {mode === m && (
                        <motion.div
                            layoutId="active-mode"
                            className={cn(
                                "absolute inset-0 rounded-sm shadow-lg",
                                isBrand ? "bg-indigo-600" : "bg-teal-600"
                            )}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    <span className="relative z-10">{m === "login" ? "Log In" : "Create Account"}</span>
                </button>
            ))}
        </div>
    );
};

export default ModeToggle;
