import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const BackgroundEffects = ({ isBrand }) => {
    return (
        <>
            {/* CSS-based Noise Texture (No External URL) */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.04] z-0 mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
                }}
            />

            {/* BACKGROUND EFFECTS */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                {/* Tech Grid / Mesh Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>

                {/* Pulsing Nodes - Optimized Animation */}
                <motion.div
                    className={cn("absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full mix-blend-screen blur-[100px] opacity-20 will-change-transform", isBrand ? "bg-indigo-600" : "bg-teal-600")}
                    animate={{
                        scale: [1, 1.05, 1],
                        opacity: [0.15, 0.2, 0.15],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className={cn("absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full mix-blend-screen blur-[100px] opacity-10 will-change-transform", isBrand ? "bg-purple-600" : "bg-cyan-600")}
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.1, 0.15, 0.1],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>
        </>
    );
};

export default BackgroundEffects;
