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
                // if (!formData.username) newErrors.username = "Username is required"; // Uncomment if username is added to form
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
                };

                const response = await api.post("/auth/register", payload);
                console.log("Registration Successful:", response.data);

                // Optional: visual feedback
                alert("Account created successfully! Please log in.");
                setMode("login");
            } else {
                // Login logic (placeholder until backend implements login)
                console.log("Login submitted (not implemented yet)", formData);
                // Example: const response = await api.post("/auth/login", { ... });
                // If login successful:
                // navigate("/dashboard");
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
        <div className={cn("flex min-h-screen w-full items-center justify-center overflow-hidden transition-colors duration-1000", bgGradient, "text-white")}>

            <BackgroundEffects isBrand={isBrand} />

            {/* RIGHT PANEL - FORM SIDE (Now Centered) */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10">
                <motion.div
                    className="w-full max-w-[450px] relative z-10"
                    layout
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >

                    {/* GLASS CARD CONTAINER */}
                    <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl overflow-hidden ring-1 ring-white/5">
                        {/* Rim Light */}
                        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 pointer-events-none"></div>

                        <AnimatePresence mode="wait">
                            {mode === "signup" && (
                                <motion.div
                                    key="role-selector"
                                    initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                                    animate={{ height: "auto", opacity: 1, marginBottom: 32 }}
                                    exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <RoleSelector role={role} setRole={setRole} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* HEADER */}
                        <div className="text-center space-y-2 mb-8">
                            <h2 className="text-3xl font-bold tracking-tight text-white">
                                {mode === "login" ? "Welcome back" : `Join as a ${role}`}
                            </h2>
                            <p className="text-white/50 text-sm">
                                {mode === "login"
                                    ? "Enter your credentials to access your dashboard"
                                    : "Fill in the details below to create your account"}
                            </p>
                        </div>

                        <ModeToggle mode={mode} setMode={setMode} isBrand={isBrand} />

                        <AuthForm
                            mode={mode}
                            role={role}
                            loading={loading}
                            formData={formData}
                            handleInputChange={handleInputChange}
                            handleSubmit={handleSubmit}
                            errors={errors}
                        />

                        <SocialLogin role={role} mode={mode} />

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
