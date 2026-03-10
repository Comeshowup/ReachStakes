import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const ICONS = {
    success: <CheckCircle style={{ width: 16, height: 16, color: "var(--bd-success)" }} />,
    error: <AlertCircle style={{ width: 16, height: 16, color: "var(--bd-danger)" }} />,
    warning: <AlertTriangle style={{ width: 16, height: 16, color: "var(--bd-warning)" }} />,
    info: <Info style={{ width: 16, height: 16, color: "var(--bd-accent)" }} />,
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const toast = useCallback((message, type = "info", duration = 3500) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const dismiss = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="bp-toast-container" aria-live="polite" aria-atomic="false">
                <AnimatePresence>
                    {toasts.map(({ id, message, type }) => (
                        <motion.div
                            key={id}
                            className={`bp-toast bp-toast--${type}`}
                            initial={{ opacity: 0, y: 16, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                            role="alert"
                        >
                            <span className="bp-toast__icon">{ICONS[type]}</span>
                            <span className="bp-toast__text">{message}</span>
                            <button
                                className="bp-toast__close"
                                onClick={() => dismiss(id)}
                                aria-label="Dismiss"
                            >
                                <X style={{ width: 14, height: 14 }} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within ToastProvider");
    return ctx;
};
