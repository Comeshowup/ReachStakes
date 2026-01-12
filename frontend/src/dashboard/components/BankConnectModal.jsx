import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Building2,
    CreditCard,
    Globe,
    CheckCircle,
    AlertCircle,
    Loader2,
    Shield,
    Lock
} from "lucide-react";
import payoutService from "../../api/payoutService";

// Common countries with currencies
const COUNTRIES = [
    { code: 'US', name: 'United States', currency: 'USD', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', currency: 'GBP', flag: '🇬🇧' },
    { code: 'IN', name: 'India', currency: 'INR', flag: '🇮🇳' },
    { code: 'AU', name: 'Australia', currency: 'AUD', flag: '🇦🇺' },
    { code: 'CA', name: 'Canada', currency: 'CAD', flag: '🇨🇦' },
    { code: 'DE', name: 'Germany', currency: 'EUR', flag: '🇩🇪' },
    { code: 'FR', name: 'France', currency: 'EUR', flag: '🇫🇷' },
    { code: 'NL', name: 'Netherlands', currency: 'EUR', flag: '🇳🇱' },
    { code: 'ES', name: 'Spain', currency: 'EUR', flag: '🇪🇸' },
    { code: 'IT', name: 'Italy', currency: 'EUR', flag: '🇮🇹' },
    { code: 'SG', name: 'Singapore', currency: 'SGD', flag: '🇸🇬' },
    { code: 'BR', name: 'Brazil', currency: 'BRL', flag: '🇧🇷' },
    { code: 'PH', name: 'Philippines', currency: 'PHP', flag: '🇵🇭' },
    { code: 'ID', name: 'Indonesia', currency: 'IDR', flag: '🇮🇩' },
    { code: 'TH', name: 'Thailand', currency: 'THB', flag: '🇹🇭' },
    { code: 'MY', name: 'Malaysia', currency: 'MYR', flag: '🇲🇾' },
    { code: 'VN', name: 'Vietnam', currency: 'VND', flag: '🇻🇳' },
];

const BankConnectModal = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState(1); // 1: Country, 2: Bank Details, 3: Success
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [fieldConfig, setFieldConfig] = useState(null);
    const [formData, setFormData] = useState({
        bankName: '',
        bankCode: '',
        accountNumber: '',
        iban: '',
        pixKey: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch field config when country changes
    useEffect(() => {
        if (selectedCountry) {
            fetchFieldConfig(selectedCountry.code, selectedCountry.currency);
        }
    }, [selectedCountry]);

    const fetchFieldConfig = async (country, currency) => {
        try {
            const response = await payoutService.getBankFields(country, currency);
            if (response.success) {
                setFieldConfig(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch field config:', err);
        }
    };

    const handleCountrySelect = (country) => {
        setSelectedCountry(country);
        setFormData({ bankName: '', bankCode: '', accountNumber: '', iban: '', pixKey: '' });
        setError(null);
        setStep(2);
    };

    const handleInputChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = {
                country: selectedCountry.code,
                currency: selectedCountry.currency,
                bankName: formData.bankName,
                bankCode: formData.bankCode,
                bankCodeType: fieldConfig?.bankCodeType,
                accountNumber: fieldConfig?.useIban ? undefined : formData.accountNumber,
                iban: fieldConfig?.useIban ? formData.iban : undefined,
                pixKey: fieldConfig?.isPix ? formData.pixKey : undefined
            };

            const response = await payoutService.connectBank(payload);

            if (response.success) {
                setStep(3);
                if (onSuccess) {
                    onSuccess(response.data);
                }
            } else {
                setError(response.message || 'Failed to connect bank account');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to connect bank account');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep(1);
        setSelectedCountry(null);
        setFieldConfig(null);
        setFormData({ bankName: '', bankCode: '', accountNumber: '', iban: '', pixKey: '' });
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
                onClick={handleClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        background: 'linear-gradient(145deg, rgba(20, 20, 30, 0.95), rgba(10, 10, 20, 0.98))',
                        border: '1px solid rgba(0, 255, 136, 0.2)',
                        borderRadius: '20px',
                        boxShadow: '0 25px 80px -20px rgba(0, 255, 136, 0.15)',
                        backdropFilter: 'blur(20px)',
                    }}
                    className="w-full max-w-lg max-h-[85vh] overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl" style={{ background: 'rgba(0, 255, 136, 0.1)' }}>
                                <Building2 size={24} style={{ color: '#00FF88' }} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Connect Bank Account</h2>
                                <p className="text-sm text-white/50">
                                    {step === 1 && "Select your country"}
                                    {step === 2 && "Enter your bank details"}
                                    {step === 3 && "Successfully connected!"}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <X size={20} className="text-white/60" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 180px)' }}>
                        {/* Step 1: Country Selection */}
                        {step === 1 && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-3"
                            >
                                {COUNTRIES.map((country) => (
                                    <button
                                        key={country.code}
                                        onClick={() => handleCountrySelect(country)}
                                        className="w-full p-4 rounded-xl border border-white/10 hover:border-emerald-500/50 bg-white/5 hover:bg-white/10 transition-all flex items-center gap-4 group"
                                    >
                                        <span className="text-2xl">{country.flag}</span>
                                        <div className="flex-1 text-left">
                                            <p className="text-white font-medium">{country.name}</p>
                                            <p className="text-white/50 text-sm">{country.currency}</p>
                                        </div>
                                        <Globe size={18} className="text-white/30 group-hover:text-emerald-400 transition-colors" />
                                    </button>
                                ))}
                            </motion.div>
                        )}

                        {/* Step 2: Bank Details Form */}
                        {step === 2 && fieldConfig && (
                            <motion.form
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                onSubmit={handleSubmit}
                                className="space-y-5"
                            >
                                {/* Selected Country */}
                                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                                    <span className="text-2xl">{selectedCountry.flag}</span>
                                    <div>
                                        <p className="text-white font-medium">{selectedCountry.name}</p>
                                        <p className="text-emerald-400 text-sm">{selectedCountry.currency}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="ml-auto text-white/50 hover:text-white text-sm"
                                    >
                                        Change
                                    </button>
                                </div>

                                {error && (
                                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
                                        <AlertCircle size={20} className="text-red-400" />
                                        <p className="text-red-400 text-sm">{error}</p>
                                    </div>
                                )}

                                {/* Bank Name */}
                                {!fieldConfig.isPix && (
                                    <div className="space-y-2">
                                        <label className="text-white/70 text-sm font-medium">Bank Name</label>
                                        <input
                                            type="text"
                                            name="bankName"
                                            value={formData.bankName}
                                            onChange={handleInputChange}
                                            placeholder="e.g. Chase Bank, HDFC Bank"
                                            required
                                            className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500/50 text-white placeholder-white/30 outline-none transition-colors"
                                        />
                                    </div>
                                )}

                                {/* Bank Code (ABA, IFSC, Sort Code, etc.) */}
                                <div className="space-y-2">
                                    <label className="text-white/70 text-sm font-medium">
                                        {fieldConfig.bankCodeLabel}
                                    </label>
                                    <input
                                        type="text"
                                        name="bankCode"
                                        value={formData.bankCode}
                                        onChange={handleInputChange}
                                        placeholder={`Enter ${fieldConfig.bankCodeLabel}`}
                                        required={!fieldConfig.isPix}
                                        className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500/50 text-white placeholder-white/30 outline-none transition-colors"
                                    />
                                </div>

                                {/* Account Number / IBAN / PIX Key */}
                                {fieldConfig.isPix ? (
                                    <div className="space-y-2">
                                        <label className="text-white/70 text-sm font-medium">PIX Key</label>
                                        <input
                                            type="text"
                                            name="pixKey"
                                            value={formData.pixKey}
                                            onChange={handleInputChange}
                                            placeholder="Email, Phone, or CPF"
                                            required
                                            className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500/50 text-white placeholder-white/30 outline-none transition-colors"
                                        />
                                    </div>
                                ) : fieldConfig.useIban ? (
                                    <div className="space-y-2">
                                        <label className="text-white/70 text-sm font-medium">IBAN</label>
                                        <input
                                            type="text"
                                            name="iban"
                                            value={formData.iban}
                                            onChange={handleInputChange}
                                            placeholder="e.g. DE89370400440532013000"
                                            required
                                            className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500/50 text-white placeholder-white/30 outline-none transition-colors"
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-white/70 text-sm font-medium">
                                            {fieldConfig.accountLabel}
                                        </label>
                                        <input
                                            type="text"
                                            name="accountNumber"
                                            value={formData.accountNumber}
                                            onChange={handleInputChange}
                                            placeholder="Enter account number"
                                            required
                                            className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500/50 text-white placeholder-white/30 outline-none transition-colors"
                                        />
                                    </div>
                                )}

                                {/* Security Notice */}
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                                    <Shield size={20} className="text-emerald-400 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="text-white/70">Your bank details are securely transmitted using bank-grade encryption.</p>
                                        <p className="text-white/50 mt-1">We only store a reference ID, not your full account details.</p>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                                    style={{
                                        background: loading ? 'rgba(0, 255, 136, 0.3)' : 'linear-gradient(135deg, #00FF88, #00CC6A)',
                                        color: '#000'
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            Connecting...
                                        </>
                                    ) : (
                                        <>
                                            <Lock size={18} />
                                            Connect Bank Account
                                        </>
                                    )}
                                </button>
                            </motion.form>
                        )}

                        {/* Step 3: Success */}
                        {step === 3 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8"
                            >
                                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle size={40} className="text-emerald-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Bank Connected!</h3>
                                <p className="text-white/60 mb-6">
                                    Your bank account has been successfully connected. You're now ready to receive payouts.
                                </p>
                                <button
                                    onClick={handleClose}
                                    className="px-8 py-3 rounded-xl font-semibold transition-all"
                                    style={{
                                        background: 'linear-gradient(135deg, #00FF88, #00CC6A)',
                                        color: '#000'
                                    }}
                                >
                                    Done
                                </button>
                            </motion.div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-white/10 flex items-center justify-center gap-2 text-white/40 text-xs">
                        <Lock size={12} />
                        <span>Secured by Tazapay • PCI DSS Compliant</span>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default BankConnectModal;
