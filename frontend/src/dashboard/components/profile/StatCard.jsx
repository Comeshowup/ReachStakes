import React from "react";
import { motion } from "framer-motion";

const StatCard = ({ icon: Icon, label, value, change, changeDirection, subtext, delay = 0 }) => (
    <motion.div
        className="bp-stat"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
        {Icon && (
            <div className="bp-stat__icon">
                <Icon style={{ width: 16, height: 16, color: "var(--bd-text-secondary)" }} />
            </div>
        )}
        <p className="bp-stat__label">{label}</p>
        <p className="bp-stat__value">{value}</p>
        {change && (
            <span className={`bp-stat__change ${changeDirection === "up" ? "bp-stat__change--up" : "bp-stat__change--down"}`}>
                {change}
            </span>
        )}
        {subtext && <p className="bp-stat__sub">{subtext}</p>}
    </motion.div>
);

export default StatCard;
