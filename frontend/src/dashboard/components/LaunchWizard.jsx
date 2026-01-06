import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, ChevronRight, Check } from "lucide-react";

const WizardStep = ({ children }) => {
    return (
        <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {children}
        </motion.div>
    );
};

const LaunchWizard = ({ onClose }) => {
    const [step, setStep] = useState(1);

    const nextStep = () => setStep((s) => Math.min(s + 1, 3));
    const prevStep = () => setStep((s) => Math.max(s - 1, 1));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 dark:border-slate-800"
            >
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Launch New Campaign</h2>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Step {step} of 3</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar">
                    <div className="flex items-center justify-between mb-8 relative px-4">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 dark:bg-slate-800 -z-10 rounded-full"></div>
                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 transition-all duration-500 -z-10 rounded-full`} style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ring-4 ring-white dark:ring-slate-900 ${step >= s ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400"
                                    }`}
                            >
                                {s}
                            </div>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <WizardStep key="step1">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Campaign Details</h3>
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Campaign Title</label>
                                        <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium" placeholder="e.g., Summer Launch 2025" autoFocus />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Description</label>
                                        <textarea className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium resize-none" rows="3" placeholder="Describe your campaign goals..."></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Total Budget</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 font-bold">$</span>
                                            <input type="number" className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold" placeholder="5000" />
                                        </div>
                                    </div>
                                </div>
                            </WizardStep>
                        )}

                        {step === 2 && (
                            <WizardStep key="step2">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Requirements</h3>
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Platform</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['YouTube', 'Instagram', 'TikTok'].map(platform => (
                                                <button key={platform} className="py-3 border-2 border-gray-100 dark:border-slate-800 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all text-sm font-bold text-gray-600 dark:text-slate-400">
                                                    {platform}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Video Type</label>
                                        <div className="relative">
                                            <select className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium appearance-none cursor-pointer">
                                                <option>Review</option>
                                                <option>Tutorial</option>
                                                <option>Unboxing</option>
                                                <option>Vlog Integration</option>
                                            </select>
                                            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 rotate-90 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Reference Assets</label>
                                        <div className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 dark:text-slate-400 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all cursor-pointer group">
                                            <div className="p-3 bg-gray-100 dark:bg-slate-800 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                                <Upload className="w-6 h-6 text-gray-400 group-hover:text-indigo-500" />
                                            </div>
                                            <span className="text-sm font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Click to upload brand assets</span>
                                            <span className="text-xs text-gray-400 mt-1">PDF, JPG, MP4 up to 50MB</span>
                                        </div>
                                    </div>
                                </div>
                            </WizardStep>
                        )}

                        {step === 3 && (
                            <WizardStep key="step3">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Review & Launch</h3>
                                <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-6 space-y-4 text-sm border border-gray-100 dark:border-slate-800">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 dark:text-slate-400">Title</span>
                                        <span className="font-bold text-gray-900 dark:text-white">Summer Launch 2025</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 dark:text-slate-400">Budget</span>
                                        <span className="font-bold text-gray-900 dark:text-white">$5,000</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 dark:text-slate-400">Platform</span>
                                        <span className="font-bold text-gray-900 dark:text-white">YouTube</span>
                                    </div>
                                    <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                                        <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg text-blue-700 dark:text-blue-400 text-xs leading-relaxed">
                                            <div className="mt-0.5 min-w-[16px]">ℹ️</div>
                                            <p>By launching this campaign, you agree to our terms of service. Funds will be held in escrow until creator deliverables are approved.</p>
                                        </div>
                                    </div>
                                </div>
                            </WizardStep>
                        )}
                    </AnimatePresence>
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex justify-between bg-white dark:bg-slate-900 sticky bottom-0 z-10">
                    {step > 1 ? (
                        <button onClick={prevStep} className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                            Back
                        </button>
                    ) : (
                        <div></div>
                    )}

                    {step < 3 ? (
                        <button onClick={nextStep} className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5">
                            Next Step
                        </button>
                    ) : (
                        <button onClick={onClose} className="px-8 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/40 hover:-translate-y-0.5 flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            Launch Campaign
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default LaunchWizard;
