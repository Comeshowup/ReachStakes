import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Save, X } from "lucide-react";

/**
 * UnsavedSaveBar — Sticky bottom bar shown when user has unsaved changes.
 * Props:
 *   isDirty: boolean — whether there are unsaved changes
 *   isSaving: boolean — save in progress
 *   onSave: () => void
 *   onDiscard: () => void
 */
const UnsavedSaveBar = ({ isDirty, isSaving, onSave, onDiscard }) => (
    <AnimatePresence>
        {isDirty && (
            <motion.div
                className="bp-save-bar"
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 80, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                role="status"
                aria-live="polite"
            >
                <div className="bp-save-bar__message">
                    <AlertCircle style={{ width: 16, height: 16 }} />
                    You have unsaved changes
                </div>
                <div className="bp-save-bar__actions">
                    <button
                        className="bp-btn bp-btn--ghost bp-btn--sm"
                        onClick={onDiscard}
                        disabled={isSaving}
                        aria-label="Discard changes"
                    >
                        <X style={{ width: 13, height: 13 }} />
                        Discard
                    </button>
                    <button
                        className="bp-btn bp-btn--primary bp-btn--sm"
                        onClick={onSave}
                        disabled={isSaving}
                        aria-label="Save changes"
                    >
                        <Save style={{ width: 13, height: 13 }} />
                        {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

export default UnsavedSaveBar;
