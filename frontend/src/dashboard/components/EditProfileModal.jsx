import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Upload,
    Image as ImageIcon,
    Briefcase,
    MapPin,
    Globe,
    Instagram,
    Linkedin,
    Twitter,
    Check,
    Loader2,
    Camera,
    ExternalLink,
    AlertCircle
} from "lucide-react";

/* ─── Industry options ─── */
const INDUSTRIES = [
    "Select industry…",
    "Apparel & Fashion",
    "Beauty & Cosmetics",
    "Consumer Electronics",
    "Education & EdTech",
    "Entertainment & Media",
    "Finance & FinTech",
    "Food & Beverage",
    "Gaming",
    "Health & Wellness",
    "Home & Garden",
    "Luxury & Lifestyle",
    "Pet Care",
    "SaaS & Software",
    "Sports & Fitness",
    "Sustainability & Eco",
    "Travel & Hospitality",
    "Other",
];

/* ─── URL validator ─── */
const isValidUrl = (str) => {
    if (!str) return true;
    try { new URL(str); return true; } catch { return false; }
};

/* ─── Section header sub-component ─── */
const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <div style={{
        display: "flex", alignItems: "center", gap: "var(--bd-space-3)",
        paddingBottom: "var(--bd-space-4)",
        borderBottom: "1px solid var(--bd-border-muted)",
        marginBottom: "var(--bd-space-4)",
    }}>
        <div style={{
            width: 36, height: 36, borderRadius: "var(--bd-radius-lg)",
            background: "var(--bd-bg-secondary)", display: "flex",
            alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
            <Icon style={{ width: 16, height: 16, color: "var(--bd-text-secondary)" }} />
        </div>
        <div>
            <h3 style={{
                fontSize: "var(--bd-font-size-md)", fontWeight: "var(--bd-font-weight-semibold)",
                color: "var(--bd-text-primary)", margin: 0, lineHeight: 1.3,
            }}>{title}</h3>
            {subtitle && (
                <p style={{
                    fontSize: "var(--bd-font-size-xs)", color: "var(--bd-text-secondary)",
                    margin: 0, marginTop: 1,
                }}>{subtitle}</p>
            )}
        </div>
    </div>
);

/* ─── Field label sub-component ─── */
const FieldLabel = ({ children }) => (
    <label style={{
        display: "block", fontSize: "var(--bd-font-size-xs)",
        fontWeight: "var(--bd-font-weight-semibold)", color: "var(--bd-text-secondary)",
        textTransform: "uppercase", letterSpacing: "0.05em",
        marginBottom: "var(--bd-space-2)",
    }}>
        {children}
    </label>
);

/* ─── Input styles (shared) ─── */
const inputStyle = {
    width: "100%", padding: "8px 12px",
    fontSize: "var(--bd-font-size-sm)", fontFamily: "var(--bd-font-body)",
    color: "var(--bd-text-primary)", background: "var(--bd-surface-input)",
    border: "1px solid var(--bd-border-default)", borderRadius: "var(--bd-radius-lg)",
    outline: "none", transition: "border-color 150ms ease, box-shadow 150ms ease",
};

const inputWithIconStyle = { ...inputStyle, paddingLeft: 36 };

const inputErrorStyle = { ...inputStyle, borderColor: "var(--bd-danger)" };

/* ─── Social field sub-component ─── */
const SocialField = ({ icon: Icon, name, value, onChange, placeholder, error }) => (
    <div style={{ marginBottom: "var(--bd-space-4)" }}>
        <div style={{ position: "relative" }}>
            <div style={{
                position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--bd-text-muted)", pointerEvents: "none",
            }}>
                <Icon style={{ width: 16, height: 16 }} />
            </div>
            <input
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                style={error ? { ...inputWithIconStyle, borderColor: "var(--bd-danger)" } : inputWithIconStyle}
            />
        </div>
        {error && (
            <p style={{
                fontSize: "var(--bd-font-size-xs)", color: "var(--bd-danger)",
                marginTop: 4, display: "flex", alignItems: "center", gap: 4,
            }}>
                <AlertCircle style={{ width: 12, height: 12 }} /> {error}
            </p>
        )}
        {!error && value && isValidUrl(value) && (
            <p style={{
                fontSize: "var(--bd-font-size-xs)", color: "var(--bd-text-muted)",
                marginTop: 4, display: "flex", alignItems: "center", gap: 4,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
                <ExternalLink style={{ width: 10, height: 10, flexShrink: 0 }} />
                {value.replace(/^https?:\/\/(www\.)?/, "")}
            </p>
        )}
    </div>
);

/* ═══════════════════════════════════════════════════════════
   MAIN MODAL COMPONENT
   ═══════════════════════════════════════════════════════════ */
const EditProfileModal = ({ isOpen, onClose, profile, onSave }) => {
    const [formData, setFormData] = useState({
        name: "",
        tagline: "",
        industry: "",
        location: "",
        about: "",
        ...profile,
        contact: profile?.contact || { email: "" },
        socials: profile?.socials || { instagram: "", linkedin: "", twitter: "", website: "" },
    });

    const [socialErrors, setSocialErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [error, setError] = useState(null);

    const bannerInputRef = useRef(null);
    const logoInputRef = useRef(null);

    /* ─── Handlers ─── */
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        if (name.includes(".")) {
            const [parent, child] = name.split(".");
            setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));

            // Validate social URLs live
            if (parent === "socials") {
                setSocialErrors(prev => {
                    const next = { ...prev };
                    if (value && !isValidUrl(value)) next[child] = "Enter a valid URL";
                    else delete next[child];
                    return next;
                });
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    }, []);

    /* ─── Image compression ─── */
    const compressImage = (file, maxWidth, maxHeight, quality = 0.8) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    let { width, height } = img;
                    if (width > maxWidth) { height = (height * maxWidth) / width; width = maxWidth; }
                    if (height > maxHeight) { width = (width * maxHeight) / height; height = maxHeight; }
                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = "high";
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL("image/jpeg", quality));
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;
        // File size validation
        if (file.size > 2 * 1024 * 1024) {
            setError("Image must be under 2MB.");
            return;
        }
        try {
            const maxW = field === "banner" ? 1600 : 800;
            const maxH = field === "banner" ? 400 : 800;
            const compressed = await compressImage(file, maxW, maxH, 0.8);
            setFormData(prev => ({ ...prev, [field]: compressed }));
        } catch (err) {
            console.error("Compression error:", err);
            const reader = new FileReader();
            reader.onloadend = () => setFormData(prev => ({ ...prev, [field]: reader.result }));
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();

        // Validate social URLs before save
        const errs = {};
        ["website", "instagram", "linkedin", "twitter"].forEach((key) => {
            if (formData.socials?.[key] && !isValidUrl(formData.socials[key])) {
                errs[key] = "Enter a valid URL";
            }
        });
        if (Object.keys(errs).length) { setSocialErrors(errs); return; }

        setIsSaving(true);
        setError(null);
        try {
            const submissionData = { ...formData };
            // Clean out any leftover skills to not break backend
            delete submissionData.skills;
            await onSave(submissionData);
            setIsSaved(true);
            setTimeout(() => { setIsSaved(false); onClose(); }, 800);
        } catch (err) {
            console.error("Error saving profile:", err);
            setError(err.response?.data?.message || "Failed to save. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 100,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "var(--bd-space-4)",
        }}>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{
                    position: "absolute", inset: 0,
                    background: "var(--bd-overlay)",
                    backdropFilter: "blur(4px)",
                }}
            />

            {/* Modal */}
            <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 16 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 16 }}
                transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{
                    position: "relative", width: "100%", maxWidth: 680,
                    background: "var(--bd-surface)",
                    borderRadius: "var(--bd-radius-2xl)",
                    boxShadow: "var(--bd-shadow-xl)",
                    overflow: "hidden", display: "flex", flexDirection: "column",
                    maxHeight: "90vh",
                    border: "1px solid var(--bd-border-subtle)",
                }}
            >
                {/* ─── Header ─── */}
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "var(--bd-space-4) var(--bd-space-5)",
                    borderBottom: "1px solid var(--bd-border-muted)",
                    background: "var(--bd-surface)",
                }}>
                    <h2 style={{
                        fontSize: "var(--bd-font-size-lg)",
                        fontWeight: "var(--bd-font-weight-bold)",
                        color: "var(--bd-text-primary)", margin: 0,
                    }}>
                        Edit Profile
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            padding: 6, borderRadius: "var(--bd-radius-lg)",
                            border: "none", background: "transparent",
                            color: "var(--bd-text-muted)", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "background 150ms ease, color 150ms ease",
                        }}
                        aria-label="Close modal"
                    >
                        <X style={{ width: 20, height: 20 }} />
                    </button>
                </div>

                {/* ─── Scrollable Body ─── */}
                <div style={{ flex: 1, overflowY: "auto", padding: "var(--bd-space-5)" }}>
                    <form onSubmit={handleSubmit}>

                        {/* ════════════════════════════════════════
                            SECTION 1 — Brand Identity
                           ════════════════════════════════════════ */}
                        <SectionHeader
                            icon={Briefcase}
                            title="Brand Identity"
                            subtitle="Core information about your brand"
                        />

                        <div style={{ display: "flex", flexDirection: "column", gap: "var(--bd-space-4)", marginBottom: "var(--bd-space-6)" }}>
                            {/* Brand Name */}
                            <div>
                                <FieldLabel>Brand Name</FieldLabel>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    style={inputStyle}
                                    placeholder="e.g. Acme Co."
                                />
                            </div>

                            {/* Tagline */}
                            <div>
                                <FieldLabel>Tagline</FieldLabel>
                                <input
                                    name="tagline"
                                    value={formData.tagline}
                                    onChange={handleChange}
                                    style={inputStyle}
                                    placeholder="Short & catchy brand positioning"
                                    maxLength={120}
                                />
                            </div>

                            {/* Industry & Location — side by side */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--bd-space-4)" }}>
                                <div>
                                    <FieldLabel>Industry</FieldLabel>
                                    <select
                                        name="industry"
                                        value={formData.industry || ""}
                                        onChange={handleChange}
                                        style={{
                                            ...inputStyle,
                                            appearance: "none",
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239898a8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                            backgroundRepeat: "no-repeat",
                                            backgroundPosition: "right 10px center",
                                            backgroundSize: 12,
                                            paddingRight: 32,
                                            cursor: "pointer",
                                        }}
                                    >
                                        {INDUSTRIES.map(ind => (
                                            <option key={ind} value={ind === "Select industry…" ? "" : ind}>
                                                {ind}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <FieldLabel>Location</FieldLabel>
                                    <div style={{ position: "relative" }}>
                                        <div style={{
                                            position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                                            display: "flex", color: "var(--bd-text-muted)", pointerEvents: "none",
                                        }}>
                                            <MapPin style={{ width: 14, height: 14 }} />
                                        </div>
                                        <input
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            style={inputWithIconStyle}
                                            placeholder="City, Country"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Website */}
                            <div>
                                <FieldLabel>Website</FieldLabel>
                                <div style={{ position: "relative" }}>
                                    <div style={{
                                        position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                                        display: "flex", color: "var(--bd-text-muted)", pointerEvents: "none",
                                    }}>
                                        <Globe style={{ width: 14, height: 14 }} />
                                    </div>
                                    <input
                                        name="socials.website"
                                        value={formData.socials?.website || ""}
                                        onChange={handleChange}
                                        style={socialErrors.website ? { ...inputWithIconStyle, borderColor: "var(--bd-danger)" } : inputWithIconStyle}
                                        placeholder="https://yourwebsite.com"
                                    />
                                </div>
                                {socialErrors.website && (
                                    <p style={{ fontSize: "var(--bd-font-size-xs)", color: "var(--bd-danger)", marginTop: 4 }}>
                                        {socialErrors.website}
                                    </p>
                                )}
                            </div>

                            {/* Brand Story */}
                            <div>
                                <FieldLabel>Brand Story</FieldLabel>
                                <textarea
                                    name="about"
                                    value={formData.about}
                                    onChange={handleChange}
                                    rows={5}
                                    style={{
                                        ...inputStyle, resize: "vertical", minHeight: 120,
                                        lineHeight: 1.6,
                                    }}
                                    placeholder="Tell us about your brand..."
                                />
                                <p style={{
                                    fontSize: "var(--bd-font-size-xs)", color: "var(--bd-text-muted)",
                                    marginTop: "var(--bd-space-1)", lineHeight: 1.4,
                                }}>
                                    Tell creators who you are, your brand tone, and what campaigns typically look like.
                                </p>
                            </div>
                        </div>

                        {/* ════════════════════════════════════════
                            SECTION 2 — Visual Identity
                           ════════════════════════════════════════ */}
                        <SectionHeader
                            icon={ImageIcon}
                            title="Visual Identity"
                            subtitle="Brand logo and cover imagery"
                        />

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--bd-space-5)", marginBottom: "var(--bd-space-6)" }}>
                            {/* Logo */}
                            <div>
                                <FieldLabel>Brand Logo</FieldLabel>
                                <div
                                    onClick={() => logoInputRef.current?.click()}
                                    style={{
                                        position: "relative", width: "100%", aspectRatio: "1",
                                        maxWidth: 160, borderRadius: "var(--bd-radius-xl)",
                                        border: "2px dashed var(--bd-border-default)",
                                        background: "var(--bd-bg-tertiary)",
                                        overflow: "hidden", cursor: "pointer",
                                        transition: "border-color 150ms ease",
                                    }}
                                >
                                    {formData.logo ? (
                                        <>
                                            <img
                                                src={formData.logo} alt="Logo"
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            />
                                            <div style={{
                                                position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                opacity: 0, transition: "opacity 150ms ease",
                                            }}
                                                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                                onMouseLeave={e => e.currentTarget.style.opacity = 0}
                                            >
                                                <Camera style={{ width: 20, height: 20, color: "#fff" }} />
                                            </div>
                                        </>
                                    ) : (
                                        <div style={{
                                            position: "absolute", inset: 0, display: "flex",
                                            flexDirection: "column", alignItems: "center", justifyContent: "center",
                                            color: "var(--bd-text-muted)", gap: "var(--bd-space-2)",
                                        }}>
                                            <Upload style={{ width: 20, height: 20 }} />
                                            <span style={{ fontSize: "var(--bd-font-size-xs)", fontWeight: "var(--bd-font-weight-medium)" }}>
                                                Upload Logo
                                            </span>
                                        </div>
                                    )}
                                    <input
                                        type="file" ref={logoInputRef} hidden accept="image/*"
                                        onChange={e => handleFileChange(e, "logo")}
                                    />
                                </div>
                                <p style={{
                                    fontSize: "var(--bd-font-size-xs)", color: "var(--bd-text-muted)",
                                    marginTop: "var(--bd-space-2)",
                                }}>
                                    400×400 recommended · JPG, PNG
                                </p>
                            </div>

                            {/* Cover Banner */}
                            <div>
                                <FieldLabel>Cover Banner</FieldLabel>
                                <div
                                    onClick={() => bannerInputRef.current?.click()}
                                    style={{
                                        position: "relative", width: "100%", height: 120,
                                        borderRadius: "var(--bd-radius-xl)",
                                        border: "2px dashed var(--bd-border-default)",
                                        background: "var(--bd-bg-tertiary)",
                                        overflow: "hidden", cursor: "pointer",
                                        transition: "border-color 150ms ease",
                                    }}
                                >
                                    {formData.banner ? (
                                        <>
                                            <img
                                                src={formData.banner} alt="Banner"
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            />
                                            <div style={{
                                                position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                opacity: 0, transition: "opacity 150ms ease",
                                            }}
                                                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                                onMouseLeave={e => e.currentTarget.style.opacity = 0}
                                            >
                                                <span style={{
                                                    color: "#fff", fontSize: "var(--bd-font-size-xs)",
                                                    fontWeight: "var(--bd-font-weight-semibold)",
                                                    display: "flex", alignItems: "center", gap: 4,
                                                    background: "rgba(0,0,0,0.5)", padding: "4px 10px",
                                                    borderRadius: "var(--bd-radius-md)",
                                                }}>
                                                    <Upload style={{ width: 12, height: 12 }} /> Replace
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <div style={{
                                            position: "absolute", inset: 0, display: "flex",
                                            flexDirection: "column", alignItems: "center", justifyContent: "center",
                                            color: "var(--bd-text-muted)", gap: "var(--bd-space-2)",
                                        }}>
                                            <ImageIcon style={{ width: 20, height: 20 }} />
                                            <span style={{ fontSize: "var(--bd-font-size-xs)", fontWeight: "var(--bd-font-weight-medium)" }}>
                                                Upload Banner
                                            </span>
                                        </div>
                                    )}
                                    <input
                                        type="file" ref={bannerInputRef} hidden accept="image/*"
                                        onChange={e => handleFileChange(e, "banner")}
                                    />
                                </div>
                                <p style={{
                                    fontSize: "var(--bd-font-size-xs)", color: "var(--bd-text-muted)",
                                    marginTop: "var(--bd-space-2)",
                                }}>
                                    1200×400 recommended · JPG, PNG
                                </p>
                            </div>
                        </div>

                        {/* ════════════════════════════════════════
                            SECTION 3 — Social Presence
                           ════════════════════════════════════════ */}
                        <SectionHeader
                            icon={Globe}
                            title="Social Presence"
                            subtitle="Optional trust signals — no OAuth required"
                        />

                        <div>
                            <SocialField
                                icon={Instagram}
                                name="socials.instagram"
                                value={formData.socials?.instagram || ""}
                                onChange={handleChange}
                                placeholder="https://instagram.com/yourbrand"
                                error={socialErrors.instagram}
                            />
                            <SocialField
                                icon={Linkedin}
                                name="socials.linkedin"
                                value={formData.socials?.linkedin || ""}
                                onChange={handleChange}
                                placeholder="https://linkedin.com/company/yourbrand"
                                error={socialErrors.linkedin}
                            />
                            <SocialField
                                icon={Twitter}
                                name="socials.twitter"
                                value={formData.socials?.twitter || ""}
                                onChange={handleChange}
                                placeholder="https://x.com/yourbrand"
                                error={socialErrors.twitter}
                            />
                        </div>
                    </form>
                </div>

                {/* ─── Footer ─── */}
                <div style={{
                    display: "flex", flexDirection: "column",
                    borderTop: "1px solid var(--bd-border-muted)",
                    padding: "var(--bd-space-4) var(--bd-space-5)",
                    background: "var(--bd-surface)",
                }}>
                    {error && (
                        <div style={{
                            padding: "var(--bd-space-3)", marginBottom: "var(--bd-space-3)",
                            borderRadius: "var(--bd-radius-lg)",
                            background: "var(--bd-danger-muted)",
                            border: "1px solid var(--bd-danger-border)",
                            color: "var(--bd-danger)",
                            fontSize: "var(--bd-font-size-sm)", display: "flex",
                            alignItems: "center", gap: "var(--bd-space-2)",
                        }}>
                            <AlertCircle style={{ width: 14, height: 14, flexShrink: 0 }} />
                            {error}
                        </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "var(--bd-space-3)" }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="bp-btn bp-btn--ghost"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSaving || isSaved}
                            className={`bp-btn ${isSaved ? "bp-btn--success" : "bp-btn--primary"}`}
                            style={{
                                minWidth: 120,
                                opacity: isSaving ? 0.7 : 1,
                                cursor: isSaving ? "wait" : "pointer",
                            }}
                        >
                            {isSaving ? (
                                <><Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} /> Saving...</>
                            ) : isSaved ? (
                                <><Check style={{ width: 14, height: 14 }} /> Saved</>
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default EditProfileModal;
