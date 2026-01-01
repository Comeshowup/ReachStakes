import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const FormInput = ({
    id,
    name,
    label,
    type = "text",
    placeholder,
    value,
    onChange,
    error,
    icon: Icon,
    isBrand,
    endIcon, // For password toggle
}) => {
    // Active Colors
    const activeBorderFocus = isBrand ? "focus-visible:border-indigo-500" : "focus-visible:border-teal-500";
    const activeGlow = isBrand ? "shadow-[0_0_20px_rgba(99,102,241,0.15)]" : "shadow-[0_0_20px_rgba(45,212,191,0.15)]";
    const activeColor = isBrand ? "text-indigo-400 group-focus-within:text-indigo-300" : "text-teal-400 group-focus-within:text-teal-300";
    // For specific icons like Mail/Lock which change color based on role differently in original code vs Company/User
    // Original code had slight inconsistencies in icon coloring logic, but we'll standardize it.
    // Company/User used 'group-focus-within', Mail/Lock used static activeColor.
    // Let's standardise to the "activeColor" computed prop passed or internal logic.

    // Actually, let's just use the classes passed or derive standard ones.
    const iconColorClass = isBrand ? "text-indigo-400" : "text-teal-400";

    return (
        <div className="space-y-2 group">
            <Label htmlFor={id} className="text-white/70 group-focus-within:text-white transition-colors">
                {label}
            </Label>
            <div className="relative">
                {Icon && (
                    <Icon className={cn("absolute left-3 top-2.5 h-4 w-4 transition-colors duration-300",
                        // In original code:
                        // Company: text-indigo-400 group-focus-within:text-indigo-300 (Brand) / text-white/30 (Brand?? No wait check logic)
                        // Actually let's look at original logic:
                        // Building2: isBrand ? "text-indigo-400 group-focus-within:text-indigo-300" : "text-white/30"
                        // User: text-teal-400 group-focus-within:text-teal-300
                        // Mail/Lock: activeColor (which is simply text-indigo-400 or text-teal-400)
                        // Let's try to unify or accept a strict className prop for icon if needed, but standardizing is better.
                        iconColorClass
                    )} />
                )}
                <Input
                    id={id}
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    className={cn("pl-9 bg-black/30 border-white/10 text-white placeholder:text-white/30 transition-all duration-300 backdrop-blur-sm",
                        "hover:border-white/30 hover:bg-black/40",
                        activeBorderFocus, activeGlow,
                        "focus:bg-black/50 focus:ring-1 focus:ring-white/10"
                    )}
                    value={value}
                    onChange={onChange}
                    style={{ fontSize: '16px' }} // Prevent iOS zoom
                />
                {endIcon}
            </div>
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>
    );
};

export default FormInput;
