import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

/**
 * ConfirmationModal — generic destructive/critical action confirmation.
 * Props:
 *   isOpen: boolean
 *   title: string
 *   description: string
 *   confirmLabel: string (default "Confirm")
 *   cancelLabel: string (default "Cancel")
 *   onConfirm: () => void
 *   onCancel: () => void
 *   variant: "default" | "danger"
 *   isLoading: boolean
 */
const ConfirmationModal = ({
    isOpen,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
    variant = "default",
    isLoading = false,
    icon: Icon,
}) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div
                className="bp-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onCancel}
                aria-modal="true"
                role="dialog"
                aria-labelledby="bp-confirm-title"
            >
                <motion.div
                    className="bp-modal"
                    style={{ maxWidth: 400 }}
                    initial={{ scale: 0.94, opacity: 0, y: 8 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.94, opacity: 0, y: 8 }}
                    transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="bp-modal__header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--bd-space-3)" }}>
                            {Icon && (
                                <div style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: "var(--bd-radius-lg)",
                                    background: variant === "danger" ? "var(--bd-danger-muted)" : "var(--bd-warning-muted)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    color: variant === "danger" ? "var(--bd-danger)" : "var(--bd-warning)"
                                }}>
                                    <Icon style={{ width: 18, height: 18 }} />
                                </div>
                            )}
                            <h3 className="bp-modal__title" id="bp-confirm-title">{title}</h3>
                        </div>
                        <button
                            className="bp-btn bp-btn--ghost"
                            style={{ padding: 6, marginLeft: "var(--bd-space-2)" }}
                            onClick={onCancel}
                            aria-label="Close"
                        >
                            <X style={{ width: 16, height: 16 }} />
                        </button>
                    </div>
                    <div className="bp-modal__body">{description}</div>
                    <div className="bp-modal__footer">
                        <button
                            className="bp-btn bp-btn--ghost"
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            {cancelLabel}
                        </button>
                        <button
                            className={`bp-btn ${variant === "danger" ? "bp-btn--danger" : "bp-btn--primary"}`}
                            onClick={onConfirm}
                            disabled={isLoading}
                        >
                            {isLoading ? "Processing..." : confirmLabel}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

export default ConfirmationModal;
