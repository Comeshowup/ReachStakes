import React from "react";
import { cn } from "@/lib/utils";

const ModeToggle = ({ mode, setMode, isBrand }) => {
    return (
        <div className="flex justify-center gap-8 text-sm mb-6">
            <button
                onClick={() => setMode("login")}
                className={cn(
                    "transition-all duration-300 pb-1 border-b-2",
                    mode === "login"
                        ? (isBrand ? "border-indigo-500 text-white font-medium drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "border-teal-500 text-white font-medium drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]")
                        : "border-transparent text-white/40 hover:text-white/80"
                )}
            >
                Log In
            </button>
            <button
                onClick={() => setMode("signup")}
                className={cn(
                    "transition-all duration-300 pb-1 border-b-2",
                    mode === "signup"
                        ? (isBrand ? "border-indigo-500 text-white font-medium drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "border-teal-500 text-white font-medium drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]")
                        : "border-transparent text-white/40 hover:text-white/80"
                )}
            >
                Create Account
            </button>
        </div>
    );
};

export default ModeToggle;
