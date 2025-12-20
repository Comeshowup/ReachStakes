import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, User, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import FormInput from "./FormInput";

const AuthForm = ({
    mode,
    role,
    loading,
    formData,
    handleInputChange,
    handleSubmit,
    errors
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const isBrand = role === "brand";

    // Button Gradients
    const brandBtnGradient = "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-[0_0_20px_rgba(79,70,229,0.3)]";
    const creatorBtnGradient = "bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 shadow-[0_0_20px_rgba(13,148,136,0.3)]";
    const activeBtnGradient = isBrand ? brandBtnGradient : creatorBtnGradient;


    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence initial={false}>
                {mode === "signup" && isBrand && (
                    <motion.div
                        key="brand-signup"
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <FormInput
                            id="companyName"
                            name="companyName"
                            label="Company Name"
                            placeholder="Acme Inc."
                            value={formData.companyName}
                            onChange={handleInputChange}
                            error={errors.companyName}
                            icon={Building2}
                            isBrand={isBrand}
                        />
                    </motion.div>
                )}

                {mode === "signup" && !isBrand && (
                    <motion.div
                        key="creator-signup"
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden space-y-5"
                    >
                        <FormInput
                            id="fullName"
                            name="fullName"
                            label="Full Name"
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            error={errors.fullName}
                            icon={User}
                            isBrand={isBrand}
                        />
                    </motion.div>
                )}

                {/* Common Fields */}
                <motion.div key="common-fields" layout className="space-y-5">
                    <FormInput
                        id="email"
                        name="email"
                        label="Email Address"
                        type="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        error={errors.email}
                        icon={Mail}
                        isBrand={isBrand}
                    />

                    <FormInput
                        id="password"
                        name="password"
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        error={errors.password}
                        icon={Lock}
                        isBrand={isBrand}
                        endIcon={
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2.5 text-white/40 hover:text-white focus:outline-none transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        }
                    />
                </motion.div>
            </AnimatePresence>

            <div className="pt-2">
                {errors.apiError && (
                    <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                        {errors.apiError}
                    </div>
                )}
                <Button
                    type="submit"
                    disabled={loading}
                    className={cn(
                        "w-full h-12 text-base font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
                        activeBtnGradient
                    )}
                >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? "Processing..." : (mode === "login" ? `Sign In as ${isBrand ? 'Brand' : 'Creator'}` : `Join as ${isBrand ? 'Brand' : 'Creator'}`)}
                </Button>
            </div>
        </form>
    );
};

export default AuthForm;
