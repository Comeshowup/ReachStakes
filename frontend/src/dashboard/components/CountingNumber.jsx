import React, { useEffect, useState } from "react";
import { animate } from "framer-motion";

const CountingNumber = ({ value, prefix = "", suffix = "", duration = 1.5 }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        // Extract numeric part from string if necessary
        const numericValue = typeof value === 'number' ? value : parseFloat(value.replace(/[^0-9.]/g, ""));

        if (isNaN(numericValue)) {
            setDisplayValue(value);
            return;
        }

        const controls = animate(0, numericValue, {
            duration: duration,
            onUpdate: (latest) => {
                setDisplayValue(latest);
            },
        });

        return () => controls.stop();
    }, [value, duration]);

    return (
        <span>
            {prefix}
            {displayValue.toLocaleString(undefined, {
                minimumFractionDigits: typeof value === 'string' && value.includes(".") ? 1 : 0,
                maximumFractionDigits: typeof value === 'string' && value.includes(".") ? 1 : 0
            })}
            {suffix}
        </span>
    );
};

export default CountingNumber;
