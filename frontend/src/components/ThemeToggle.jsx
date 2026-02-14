import React from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../contexts/ThemeProvider";

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2 rounded-xl transition-colors"
            style={{
                background: 'var(--bd-surface-input)',
                color: 'var(--bd-text-secondary)',
            }}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            <div className="relative w-5 h-5">
                <motion.div
                    initial={false}
                    animate={{
                        scale: isDark ? 0 : 1,
                        rotate: isDark ? 90 : 0,
                        opacity: isDark ? 0 : 1,
                    }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <Sun className="w-[18px] h-[18px]" strokeWidth={1.5} />
                </motion.div>
                <motion.div
                    initial={false}
                    animate={{
                        scale: isDark ? 1 : 0,
                        rotate: isDark ? 0 : -90,
                        opacity: isDark ? 1 : 0,
                    }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <Moon className="w-[18px] h-[18px]" strokeWidth={1.5} />
                </motion.div>
            </div>
        </button>
    );
}

export default ThemeToggle;
