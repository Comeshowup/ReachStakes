import React from "react";

const SettingsField = ({
    label,
    hint,
    type = "text",
    value,
    onChange,
    disabled,
    error,
    placeholder,
    children,
    checked,
    onToggle,
    readOnly
}) => {
    if (type === "toggle") {
        return (
            <div className="bp-field" role="group" aria-label={label}>
                <div className="bp-field__label-group">
                    <div className="bp-field__label">{label}</div>
                    {hint && <div className="bp-field__hint">{hint}</div>}
                </div>
                <div className="bp-field__control">
                    <button
                        type="button"
                        className={`bp-toggle ${checked ? "bp-toggle--active" : ""}`}
                        onClick={onToggle}
                        disabled={disabled}
                        role="switch"
                        aria-checked={checked}
                        aria-label={label}
                    >
                        <span className="bp-toggle__knob" />
                    </button>
                </div>
            </div>
        );
    }

    if (type === "display") {
        return (
            <div className="bp-field" role="group" aria-label={label}>
                <div className="bp-field__label-group">
                    <div className="bp-field__label">{label}</div>
                    {hint && <div className="bp-field__hint">{hint}</div>}
                </div>
                <div className="bp-field__control">
                    <div className="bp-field__value">{value || "—"}</div>
                </div>
            </div>
        );
    }

    if (type === "custom") {
        return (
            <div className="bp-field" role="group" aria-label={label}>
                <div className="bp-field__label-group">
                    <div className="bp-field__label">{label}</div>
                    {hint && <div className="bp-field__hint">{hint}</div>}
                </div>
                <div className="bp-field__control">
                    {children}
                </div>
            </div>
        );
    }

    return (
        <div className="bp-field" role="group" aria-label={label}>
            <div className="bp-field__label-group">
                <label className="bp-field__label">{label}</label>
                {hint && <div className="bp-field__hint">{hint}</div>}
            </div>
            <div className="bp-field__control">
                <input
                    type={type}
                    className={`bp-field__input ${error ? "bp-field__input--error" : ""}`}
                    value={value || ""}
                    onChange={onChange}
                    disabled={disabled}
                    placeholder={placeholder}
                    readOnly={readOnly}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${label}-error` : undefined}
                />
                {error && <div className="bp-field__error" id={`${label}-error`}>{error}</div>}
            </div>
        </div>
    );
};

export default SettingsField;
