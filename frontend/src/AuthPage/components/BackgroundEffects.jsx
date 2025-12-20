import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const BackgroundEffects = ({ isBrand }) => {
    return (
        <>
            {/* GLOBAL NOISE TEXTURE */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150"></div>

            {/* BACKGROUND EFFECTS */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Tech Grid / Mesh Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>

                {/* Pulsing Nodes */}
                <motion.div
                    className={cn("absolute top-[-10%] left-[-10%] w-[800px] h-[800px] rounded-full mix-blend-screen blur-[120px] opacity-20", isBrand ? "bg-indigo-600" : "bg-teal-600")}
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.15, 0.25, 0.15]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className={cn("absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full mix-blend-screen blur-[120px] opacity-10", isBrand ? "bg-purple-600" : "bg-cyan-600")}
                    animate={{
                        scale: [1.1, 1, 1.1],
                        opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>
        </>
    );
};

export default BackgroundEffects;
