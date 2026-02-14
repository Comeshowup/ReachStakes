import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Plus,
    Trash2,
    DollarSign,
    Clock,
    Instagram,
    Youtube,
    Twitter,
    Globe,
    Video,
    CheckCircle2,
    Loader2,
    Save
} from "lucide-react";

/**
 * ServiceModal - Modal for creating/editing services
 * Handles service creation and editing with platform selection, pricing, and deliverables
 */

const PLATFORMS = [
    { id: "instagram", label: "Instagram", icon: Instagram, color: "text-pink-500" },
    { id: "youtube", label: "YouTube", icon: Youtube, color: "text-red-500" },
    { id: "twitter", label: "Twitter/X", icon: Twitter, color: "text-sky-500" },
    { id: "tiktok", label: "TikTok", icon: Video, color: "text-black dark:text-white" },
    { id: "other", label: "Other", icon: Globe, color: "text-indigo-500" }
];

const TURNAROUND_OPTIONS = [
    { value: "1-2 days", label: "1-2 days" },
    { value: "3-5 days", label: "3-5 days" },
    { value: "1 week", label: "1 week" },
    { value: "2 weeks", label: "2 weeks" },
    { value: "Custom", label: "Custom" }
];

const ServiceModal = ({
    isOpen,
    onClose,
    service = null,
    onSave,
    isLoading = false
}) => {
    const isEdit = !!service;

    const [formData, setFormData] = useState({
        title: "",
        platform: "instagram",
        price: "",
        priceType: "fixed", // "fixed" or "quote"
        description: "",
        turnaroundTime: "3-5 days",
        deliverables: [""]
    });

    const [errors, setErrors] = useState({});

    // Populate form when editing
    useEffect(() => {
        if (service) {
            setFormData({
                title: service.title || "",
                platform: service.platform || "instagram",
                price: service.price?.toString() || "",
                priceType: service.price ? "fixed" : "quote",
                description: service.description || "",
                turnaroundTime: service.turnaroundTime || service.time || "3-5 days",
                deliverables: service.deliverables?.length > 0 ? service.deliverables : [""]
            });
        } else {
            // Reset form for new service
            setFormData({
                title: "",
                platform: "instagram",
                price: "",
                priceType: "fixed",
                description: "",
                turnaroundTime: "3-5 days",
                deliverables: [""]
            });
        }
        setErrors({});
    }, [service, isOpen]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user types
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleDeliverableChange = (index, value) => {
        const newDeliverables = [...formData.deliverables];
        newDeliverables[index] = value;
        setFormData(prev => ({ ...prev, deliverables: newDeliverables }));
    };

    const addDeliverable = () => {
        if (formData.deliverables.length < 6) {
            setFormData(prev => ({
                ...prev,
                deliverables: [...prev.deliverables, ""]
            }));
        }
    };

    const removeDeliverable = (index) => {
        if (formData.deliverables.length > 1) {
            setFormData(prev => ({
                ...prev,
                deliverables: prev.deliverables.filter((_, i) => i !== index)
            }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = "Service title is required";
        }

        if (formData.priceType === "fixed" && !formData.price) {
            newErrors.price = "Price is required for fixed pricing";
        }

        if (formData.priceType === "fixed" && formData.price && isNaN(Number(formData.price))) {
            newErrors.price = "Price must be a number";
        }

        if (!formData.description.trim()) {
            newErrors.description = "Description is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validate()) return;

        const serviceData = {
            ...(service?.id && { id: service.id }),
            title: formData.title.trim(),
            platform: formData.platform,
            price: formData.priceType === "fixed" ? Number(formData.price) : null,
            description: formData.description.trim(),
            turnaroundTime: formData.turnaroundTime,
            deliverables: formData.deliverables.filter(d => d.trim())
        };

        onSave(serviceData);
    };

    if (!isOpen) return null;

    const selectedPlatform = PLATFORMS.find(p => p.id === formData.platform);
    const PlatformIcon = selectedPlatform?.icon || Globe;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30`}>
                            <PlatformIcon className={`w-5 h-5 ${selectedPlatform?.color || "text-indigo-600"}`} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {isEdit ? "Edit Service" : "Add New Service"}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Platform Selection */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-3">
                            Platform
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {PLATFORMS.map(platform => {
                                const Icon = platform.icon;
                                const isSelected = formData.platform === platform.id;
                                return (
                                    <button
                                        key={platform.id}
                                        type="button"
                                        onClick={() => handleChange("platform", platform.id)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all ${isSelected
                                                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                                                : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 text-gray-600 dark:text-slate-400"
                                            }`}
                                    >
                                        <Icon className={`w-4 h-4 ${isSelected ? platform.color : ""}`} />
                                        <span className="text-sm font-medium">{platform.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Service Title */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                            Service Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleChange("title", e.target.value)}
                            placeholder="e.g., Instagram Reel, YouTube Integration"
                            className={`w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-0 transition-colors ${errors.title
                                    ? "border-red-500 focus:border-red-500"
                                    : "border-gray-200 dark:border-slate-700 focus:border-indigo-500"
                                }`}
                        />
                        {errors.title && (
                            <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                        )}
                    </div>

                    {/* Pricing */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                            Pricing
                        </label>
                        <div className="flex gap-3 mb-3">
                            <button
                                type="button"
                                onClick={() => handleChange("priceType", "fixed")}
                                className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${formData.priceType === "fixed"
                                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                                        : "border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400"
                                    }`}
                            >
                                Fixed Price
                            </button>
                            <button
                                type="button"
                                onClick={() => handleChange("priceType", "quote")}
                                className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${formData.priceType === "quote"
                                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                                        : "border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400"
                                    }`}
                            >
                                Request Quote
                            </button>
                        </div>
                        {formData.priceType === "fixed" && (
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.price}
                                    onChange={(e) => handleChange("price", e.target.value)}
                                    placeholder="0.00"
                                    className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-0 transition-colors ${errors.price
                                            ? "border-red-500 focus:border-red-500"
                                            : "border-gray-200 dark:border-slate-700 focus:border-indigo-500"
                                        }`}
                                />
                                {errors.price && (
                                    <p className="mt-1 text-sm text-red-500">{errors.price}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                            Description *
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            placeholder="Describe what's included in this service..."
                            rows={3}
                            className={`w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-0 resize-none transition-colors ${errors.description
                                    ? "border-red-500 focus:border-red-500"
                                    : "border-gray-200 dark:border-slate-700 focus:border-indigo-500"
                                }`}
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                        )}
                    </div>

                    {/* Turnaround Time */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                            Turnaround Time
                        </label>
                        <div className="relative">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                value={formData.turnaroundTime}
                                onChange={(e) => handleChange("turnaroundTime", e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                            >
                                {TURNAROUND_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Deliverables */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                            Deliverables
                        </label>
                        <div className="space-y-3">
                            {formData.deliverables.map((deliverable, index) => (
                                <div key={index} className="flex gap-2">
                                    <div className="relative flex-1">
                                        <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                        <input
                                            type="text"
                                            value={deliverable}
                                            onChange={(e) => handleDeliverableChange(index, e.target.value)}
                                            placeholder={`Deliverable ${index + 1}`}
                                            className="w-full pl-11 pr-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
                                        />
                                    </div>
                                    {formData.deliverables.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeDeliverable(index)}
                                            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {formData.deliverables.length < 6 && (
                                <button
                                    type="button"
                                    onClick={addDeliverable}
                                    className="flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Deliverable
                                </button>
                            )}
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-gray-600 dark:text-slate-400 font-medium hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                {isEdit ? "Save Changes" : "Add Service"}
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ServiceModal;
