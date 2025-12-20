import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Upload,
    Image as ImageIcon,
    User,
    MapPin,
    Globe,
    Instagram,
    Linkedin,
    Twitter,
    Mail,
    Phone,
    Check,
    Loader2,
    Camera,
    Star
} from "lucide-react";

const EditProfileModal = ({ isOpen, onClose, profile, onSave }) => {
    const [formData, setFormData] = useState({
        name: "",
        tagline: "",
        location: "",
        about: "",
        ...profile,
        contact: profile?.contact || { email: "", phone: "" },
        socials: profile?.socials || { instagram: "", linkedin: "", twitter: "", website: "" },
        skills: Array.isArray(profile?.skills) ? profile.skills.join(", ") : (profile?.skills || "")
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Refs for file inputs
    const bannerInputRef = useRef(null);
    const logoInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, [field]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        const submissionData = {
            ...formData,
            skills: typeof formData.skills === 'string'
                ? formData.skills.split(",").map(s => s.trim()).filter(s => s)
                : formData.skills
        };
        onSave(submissionData);
        setIsSaving(false);
        setIsSaved(true);

        // Close after showing success state
        setTimeout(() => {
            setIsSaved(false);
            onClose();
        }, 1000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="w-8" /> {/* Spacer for centering */}
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center">Edit Profile</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-all duration-200 hover:rotate-90"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleSubmit} className="p-6 md:p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">

                            {/* Left Column: Primary Details (60%) */}
                            <div className="lg:col-span-3 space-y-8">
                                {/* Basic Info Section */}
                                <div className="space-y-5">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <User className="w-4 h-4 text-indigo-500" />
                                        Basic Information
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Brand Name</label>
                                            <input
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                                placeholder="e.g. Acme Co."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Tagline</label>
                                            <input
                                                name="tagline"
                                                value={formData.tagline}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                                placeholder="Short & catchy description"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Location</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    name="location"
                                                    value={formData.location}
                                                    onChange={handleChange}
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                                    placeholder="City, Country"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">About</label>
                                            <textarea
                                                name="about"
                                                value={formData.about}
                                                onChange={handleChange}
                                                rows="5"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none resize-y min-h-[120px]"
                                                placeholder="Tell us about your brand..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Skills Section */}
                                <div className="space-y-5">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Star className="w-4 h-4 text-indigo-500" />
                                        Skills & Interests
                                    </h3>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Skills (Comma separated)</label>
                                        <textarea
                                            name="skills"
                                            value={formData.skills}
                                            onChange={handleChange}
                                            rows="2"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none resize-y"
                                            placeholder="Marketing, Branding, Design..."
                                        />
                                    </div>
                                </div>

                                {/* Social Links Section */}
                                <div className="space-y-5">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-indigo-500" />
                                        Social Presence
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="relative group">
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors">
                                                <Instagram className="w-4 h-4" />
                                            </div>
                                            <input
                                                name="socials.instagram"
                                                value={formData.socials?.instagram || ''}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all outline-none text-sm"
                                                placeholder="Instagram URL"
                                            />
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                                <Linkedin className="w-4 h-4" />
                                            </div>
                                            <input
                                                name="socials.linkedin"
                                                value={formData.socials?.linkedin || ''}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none text-sm"
                                                placeholder="LinkedIn URL"
                                            />
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors">
                                                <Twitter className="w-4 h-4" />
                                            </div>
                                            <input
                                                name="socials.twitter"
                                                value={formData.socials?.twitter || ''}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 transition-all outline-none text-sm"
                                                placeholder="X (Twitter) URL"
                                            />
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                                                <Globe className="w-4 h-4" />
                                            </div>
                                            <input
                                                name="socials.website"
                                                value={formData.socials?.website || ''}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-sm"
                                                placeholder="Website URL"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Visuals & Contact (40%) */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Visual Assets */}
                                <div className="space-y-5">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4 text-indigo-500" />
                                        Visual Assets
                                    </h3>

                                    {/* Banner Upload */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Cover Image</label>
                                        <div
                                            className="relative group w-full h-32 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors bg-gray-50 dark:bg-slate-800/50 cursor-pointer"
                                            onClick={() => bannerInputRef.current?.click()}
                                        >
                                            {formData.banner ? (
                                                <>
                                                    <img src={formData.banner} alt="Banner" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <span className="text-white text-xs font-bold flex items-center gap-1.5 bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                            <Upload className="w-3 h-3" /> Change Banner
                                                        </span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                                                    <span className="text-xs font-medium">Upload Banner</span>
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                ref={bannerInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => handleFileChange(e, 'banner')}
                                            />
                                        </div>
                                    </div>

                                    {/* Logo Upload */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Profile Logo</label>
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors bg-gray-50 dark:bg-slate-800/50 cursor-pointer flex-shrink-0"
                                                onClick={() => logoInputRef.current?.click()}
                                            >
                                                {formData.logo ? (
                                                    <>
                                                        <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <Camera className="w-6 h-6 text-white" />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                                        <User className="w-8 h-8 opacity-50" />
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    ref={logoInputRef}
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange(e, 'logo')}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <button
                                                    type="button"
                                                    onClick={() => logoInputRef.current?.click()}
                                                    className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                                                >
                                                    Change Logo
                                                </button>
                                                <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                                                    Recommended: 400x400px. <br /> Supports JPG, PNG.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full h-px bg-gray-100 dark:bg-slate-800" />

                                {/* Contact Info */}
                                <div className="space-y-5">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-indigo-500" />
                                        Contact Details
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    name="contact.email"
                                                    value={formData.contact.email}
                                                    onChange={handleChange}
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                                    placeholder="contact@example.com"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Phone Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    name="contact.phone"
                                                    value={formData.contact.phone}
                                                    onChange={handleChange}
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                                    placeholder="+1 (555) 000-0000"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-end gap-3 sticky bottom-0 z-10">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-bold text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving || isSaved}
                        className={`
                            px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2
                            ${isSaved
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98]"
                            }
                            ${isSaving ? "opacity-80 cursor-wait" : ""}
                        `}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : isSaved ? (
                            <>
                                <Check className="w-4 h-4" />
                                Saved!
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default EditProfileModal;
