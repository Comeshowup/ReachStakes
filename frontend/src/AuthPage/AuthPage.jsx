import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import BackgroundEffects from "./components/BackgroundEffects";
import RoleSelector from "./components/RoleSelector";
import ModeToggle from "./components/ModeToggle";
import AuthForm from "./components/AuthForm";
import SocialLogin from "./components/SocialLogin";

const AuthPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Initialize state from URL query parameters or defaults
    const initialRole = searchParams.get("role") === "creator" ? "creator" : "brand";
    const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";
    const initialReferralCode = searchParams.get("ref") || "";

    const [role, setRole] = useState(initialRole); // "brand" | "creator"
    const [mode, setMode] = useState(initialMode); // "login" | "signup"
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        companyName: "",
        fullName: "",
        username: "",
        handle: "",
        referralCode: initialReferralCode,
    });

    // Validation State
    const [errors, setErrors] = useState({});

    // Entrance Animation State (keeping for consistency, though effect is minimal inside components now)
    const [pageLoaded, setPageLoaded] = useState(false);
    useEffect(() => {
        setPageLoaded(true);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear error on change
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.email.includes("@")) newErrors.email = "Invalid email address";
        if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";

        if (mode === "signup") {
            if (role === "brand" && !formData.companyName) newErrors.companyName = "Company Name is required";
            if (role === "creator") {
                if (!formData.fullName) newErrors.fullName = "Full Name is required";
                if (!formData.handle) newErrors.handle = "Handle is required";
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setErrors({}); // Clear previous errors

        try {
            if (mode === "signup") {
                const payload = {
                    name: role === "brand" ? formData.companyName : formData.fullName,
                    email: formData.email,
                    password: formData.password,
                    role: role,
                    handle: formData.handle,
                    ...(role === "creator" && formData.referralCode && { referralCode: formData.referralCode }),
                };

                const response = await api.post("/auth/register", payload);
                console.log("Registration Successful:", response.data);

                // Auto-login on signup
                if (response.data.status === "success") {
                    const { token, user } = response.data.data;
                    localStorage.setItem("token", token);
                    localStorage.setItem("userInfo", JSON.stringify(user));

                    // Redirect based on role
                    // New signups go to onboarding wizard first
                    if (user.role === "creator") {
                        navigate("/creator/onboarding");
                    } else {
                        // Brand users go to onboarding wizard on first signup
                        navigate("/brand/onboarding");
                    }
                }
            } else {
                // Login logic
                const payload = {
                    email: formData.email,
                    password: formData.password
                };

                const response = await api.post("/auth/login", payload);

                if (response.data.status === "success") {
                    const { token, user } = response.data.data;
                    localStorage.setItem("token", token);
                    localStorage.setItem("userInfo", JSON.stringify(user));

                    // Redirect based on role
                    // For login, check if onboarding was completed/skipped
                    if (user.role === "creator") {
                        navigate("/creator");
                    } else {
                        // Check if brand has completed onboarding
                        const onboardingComplete = localStorage.getItem('onboardingComplete');
                        const onboardingSkipped = localStorage.getItem('onboardingSkipped');

                        if (onboardingComplete || onboardingSkipped) {
                            navigate("/brand");
                        } else {
                            // First time login or onboarding not done
                            navigate("/brand/onboarding");
                        }
                    }
                }
            }
        } catch (error) {
            console.error("API Error:", error);
            const msg = error.response?.data?.message || "Something went wrong. Please try again.";
            setErrors(prev => ({ ...prev, apiError: msg }));
        } finally {
            setLoading(false);
        }
    };

    const isBrand = role === "brand";

    // Background Gradients
    const bgGradient = isBrand
        ? "bg-gradient-to-br from-[#0F1016] via-[#1E1B4B] to-[#020205]"
        : "bg-gradient-to-br from-[#0F1615] via-[#0F3935] to-[#020504]";


    return (
        <div className={cn("flex min-h-[100dvh] w-full items-center justify-center overflow-hidden transition-colors duration-1000 relative", bgGradient, "text-white")}>

            <BackgroundEffects isBrand={isBrand} />

            {/* RIGHT PANEL - FORM SIDE (Now Centered) */}
            <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-12 relative z-10 w-full">
                <motion.div
                    className="w-full max-w-[450px] relative z-10"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >

                    {/* GLASS CARD CONTAINER */}
                    <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden ring-1 ring-white/5">
                        {/* Rim Light */}
                        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 pointer-events-none"></div>

                        <AnimatePresence mode="wait">
                            {mode === "signup" && (
                                <motion.div
                                    key="role-selector"
                                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, height: "auto", scale: 1 }}
                                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden mb-6"
                                >
                                    <RoleSelector role={role} setRole={setRole} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* HEADER */}
                        <div className="text-center space-y-2 mb-8">
                            {/* Progress indicator for signup */}
                            {mode === "signup" && (
                                <div className="flex items-center justify-center gap-2 mb-4">
                                    <div className="flex items-center gap-1">
                                        <div className="w-6 h-6 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center font-medium">1</div>
                                        <span className="text-xs text-white/50">Account</span>
                                    </div>
                                    <div className="w-8 h-px bg-white/20"></div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-6 h-6 rounded-full bg-white/10 text-white/40 text-xs flex items-center justify-center font-medium">2</div>
                                        <span className="text-xs text-white/30">Setup</span>
                                    </div>
                                    <div className="w-8 h-px bg-white/20"></div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-6 h-6 rounded-full bg-white/10 text-white/40 text-xs flex items-center justify-center font-medium">3</div>
                                        <span className="text-xs text-white/30">Launch</span>
                                    </div>
                                </div>
                            )}

                            <h2 className="text-3xl font-bold tracking-tight text-white">
                                {mode === "login" ? "Welcome back" : `Join as a ${role}`}
                            </h2>
                            <p className="text-white/50 text-sm">
                                {mode === "login"
                                    ? "Enter your credentials to access your dashboard"
                                    : "Fill in the details below to create your account"}
                            </p>

                            {/* Trust micro-copy for signup */}
                            {mode === "signup" && (
                                <div className="flex items-center justify-center gap-4 pt-2">
                                    <span className="flex items-center gap-1.5 text-xs text-white/40">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Takes 2 minutes
                                    </span>
                                    <span className="text-white/20">•</span>
                                    <span className="flex items-center gap-1.5 text-xs text-white/40">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        Your data is encrypted
                                    </span>
                                </div>
                            )}
                        </div>

                        <ModeToggle mode={mode} setMode={setMode} isBrand={isBrand} />

                        <div className="relative">
                            <AuthForm
                                mode={mode}
                                role={role}
                                loading={loading}
                                formData={formData}
                                handleInputChange={handleInputChange}
                                handleSubmit={handleSubmit}
                                errors={errors}
                                hasReferralFromUrl={!!initialReferralCode}
                            />

                            <SocialLogin role={role} mode={mode} />
                        </div>

                        <p className="text-center text-xs text-white/30 mt-6">
                            By clicking continue, you agree to our <a href="#" className="underline hover:text-white transition-colors">Terms of Service</a> and <a href="#" className="underline hover:text-white transition-colors">Privacy Policy</a>.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AuthPage;
