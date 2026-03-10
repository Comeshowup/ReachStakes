import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    BookOpen,
    Image as ImageIcon,
    Globe,
    Instagram,
    Linkedin,
    Twitter,
    Upload,
    FileText,
    Edit,
    Check,
    X,
    ExternalLink,
    Info,
    ChevronRight,
    Building2,
    MapPin
} from "lucide-react";
import SectionCard from "./SectionCard";
import EmptyState from "./EmptyState";
import ConfirmationModal from "./ConfirmationModal";
import { uploadLogo, uploadCover, uploadDocument } from "../../../api/brandService";

/* ─── Drag & Drop Upload Card ─── */
const UploadCard = ({ label, hint, usageNote, accept, value, aspectClass, onFileSelect, previewSize }) => {
    const [dragging, setDragging] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef(null);

    const processFile = useCallback(async (file) => {
        if (!file) return;
        const maxMb = accept === ".pdf" ? 10 : 2;
        if (file.size > maxMb * 1024 * 1024) {
            alert(`File too large. Maximum size is ${maxMb}MB.`);
            return;
        }
        setUploading(true);
        setProgress(20);
        try {
            if (onFileSelect) {
                await onFileSelect(file);
            }
            setProgress(100);
        } catch (err) {
            console.error("Upload error:", err);
            alert("Upload failed. Please try again.");
        } finally {
            setTimeout(() => {
                setUploading(false);
                setProgress(0);
            }, 300);
        }
    }, [accept, onFileSelect]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    }, [processFile]);

    return (
        <div
            className={`bp-upload-card ${dragging ? "bp-upload-card--dragging" : ""}`}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
        >
            {value ? (
                <div className="bp-upload-card__preview" style={{ height: previewSize || 88 }}>
                    <img className="bp-upload-card__preview-img" src={value} alt={label} />
                    <div className="bp-upload-card__overlay">
                        <button
                            className="bp-btn bp-btn--secondary bp-btn--sm"
                            onClick={() => inputRef.current?.click()}
                        >
                            <Upload style={{ width: 12, height: 12 }} />
                            Replace
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    className="bp-upload-card__drop-zone"
                    onClick={() => inputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === "Enter" && inputRef.current?.click()}
                    aria-label={`Upload ${label}`}
                >
                    <Upload style={{ width: 20, height: 20, color: "var(--bd-text-muted)" }} />
                    <span style={{ fontSize: "var(--bd-font-size-sm)", fontWeight: "var(--bd-font-weight-medium)", color: "var(--bd-text-secondary)" }}>
                        {label}
                    </span>
                    <span className="bp-upload-card__hint">{hint}</span>
                    {usageNote && <span className="bp-upload-card__usage">{usageNote}</span>}
                </div>
            )}
            {uploading && (
                <div className="bp-upload-card__progress">
                    <div className="bp-upload-card__progress-fill" style={{ width: `${progress}%` }} />
                </div>
            )}
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                hidden
                onChange={e => processFile(e.target.files?.[0])}
            />
        </div>
    );
};

/* ─── Brand Story Modal ─── */
const BrandStoryModal = ({ isOpen, initialData, onSave, onClose }) => {
    const [form, setForm] = useState({
        positioning: initialData?.tagline || "",
        audience: initialData?.audience || "",
        goals: initialData?.goals || "",
        tone: initialData?.tone || "",
        guidelines: initialData?.guidelines || "",
        about: initialData?.about || "",
    });
    const [saving, setSaving] = useState(false);

    const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

    const handleSave = async () => {
        setSaving(true);
        // Store structured fields; concatenate into `about` for backend
        const composedAbout = [
            form.about,
            form.audience ? `Target Audience: ${form.audience}` : "",
            form.goals ? `Campaign Goals: ${form.goals}` : "",
            form.tone ? `Brand Tone: ${form.tone}` : "",
            form.guidelines ? `Creator Guidelines: ${form.guidelines}` : "",
        ].filter(Boolean).join("\n\n");

        try {
            await onSave({
                tagline: form.positioning,
                about: composedAbout,
            });
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="bp-modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="story-modal-title"
                >
                    <motion.div
                        className="bp-modal bp-story-modal"
                        initial={{ scale: 0.95, opacity: 0, y: 12 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 12 }}
                        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="bp-modal__header">
                            <h3 className="bp-modal__title" id="story-modal-title">
                                {initialData?.tagline ? "Edit Brand Story" : "Add Brand Story"}
                            </h3>
                        </div>
                        <div className="bp-modal__body" style={{ maxHeight: "60vh", overflowY: "auto" }}>
                            <div className="bp-story-fields">
                                <div>
                                    <p className="bp-story-field__label">One-line positioning *</p>
                                    <input
                                        className="bp-field__input"
                                        value={form.positioning}
                                        onChange={set("positioning")}
                                        placeholder="e.g. The sustainable sportswear brand for everyday athletes"
                                        maxLength={120}
                                    />
                                    <p className="bp-story-field__hint">Appears as your brand tagline on campaign pages.</p>
                                </div>
                                <div>
                                    <p className="bp-story-field__label">Brand description</p>
                                    <textarea
                                        value={form.about}
                                        onChange={set("about")}
                                        placeholder="What does your brand do? What problem do you solve?"
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <p className="bp-story-field__label">Target audience</p>
                                    <input
                                        className="bp-field__input"
                                        value={form.audience}
                                        onChange={set("audience")}
                                        placeholder="e.g. Women 25–35 interested in fitness and sustainability"
                                    />
                                </div>
                                <div>
                                    <p className="bp-story-field__label">Campaign goals</p>
                                    <input
                                        className="bp-field__input"
                                        value={form.goals}
                                        onChange={set("goals")}
                                        placeholder="e.g. Brand awareness, product launches, UGC content"
                                    />
                                </div>
                                <div>
                                    <p className="bp-story-field__label">Brand tone</p>
                                    <input
                                        className="bp-field__input"
                                        value={form.tone}
                                        onChange={set("tone")}
                                        placeholder="e.g. Authentic, energetic, community-driven"
                                    />
                                </div>
                                <div>
                                    <p className="bp-story-field__label">Creator guidelines</p>
                                    <textarea
                                        value={form.guidelines}
                                        onChange={set("guidelines")}
                                        placeholder="What should creators know before applying? Any content restrictions?"
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="bp-modal__footer">
                            <button className="bp-btn bp-btn--ghost" onClick={onClose} disabled={saving}>Cancel</button>
                            <button
                                className="bp-btn bp-btn--primary"
                                onClick={handleSave}
                                disabled={saving || !form.positioning.trim()}
                            >
                                {saving ? "Saving..." : "Save Story"}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

/* ─── Social Platform Config ─── */
const SOCIALS = [
    { key: "website", Icon: Globe, label: "Website", placeholder: "https://yourwebsite.com", importance: "Primary trust signal for creators" },
    { key: "instagram", Icon: Instagram, label: "Instagram", placeholder: "https://instagram.com/handle", importance: "Most relevant for creator collaborations" },
    { key: "linkedin", Icon: Linkedin, label: "LinkedIn", placeholder: "https://linkedin.com/company/name", importance: "Validates business legitimacy" },
    { key: "twitter", Icon: Twitter, label: "Twitter / X", placeholder: "https://x.com/handle", importance: "Audience reach signal" },
];

const INDUSTRIES = [
    "E-commerce / DTC", "SaaS / Tech", "Health & Wellness", "Beauty & Skincare",
    "Fashion & Apparel", "Food & Beverage", "Finance / Fintech", "Travel & Hospitality",
    "Education / EdTech", "Gaming & Entertainment", "Home & Living", "Automotive",
    "Sustainability / Green", "Media & Publishing", "Sports & Fitness", "Other"
];

const validateUrl = (url) => {
    if (!url) return true;
    try { new URL(url); return true; } catch { return false; }
};

/* ─── Main Component ─── */
const IdentityTab = ({ profile, onSave }) => {
    const [storyModalOpen, setStoryModalOpen] = useState(false);
    const [socialsEdit, setSocialsEdit] = useState(false);
    const [savingSocials, setSavingSocials] = useState(false);
    const [socialForm, setSocialForm] = useState({
        website: profile?.socials?.website || "",
        instagram: profile?.socials?.instagram || "",
        linkedin: profile?.socials?.linkedin || "",
        twitter: profile?.socials?.twitter || "",
    });
    const [socialErrors, setSocialErrors] = useState({});

    /* ── Brand Details inline edit state ── */
    const [detailsEdit, setDetailsEdit] = useState(false);
    const [savingDetails, setSavingDetails] = useState(false);
    const [detailsForm, setDetailsForm] = useState({
        name: profile?.name || "",
        industry: profile?.industry || "",
        location: profile?.location || "",
    });

    const handleSaveDetails = async () => {
        if (!detailsForm.name.trim()) return;
        setSavingDetails(true);
        try {
            await onSave(detailsForm);
            setDetailsEdit(false);
        } catch (e) {
            console.error(e);
        } finally {
            setSavingDetails(false);
        }
    };

    const handleDiscardDetails = () => {
        setDetailsForm({
            name: profile?.name || "",
            industry: profile?.industry || "",
            location: profile?.location || "",
        });
        setDetailsEdit(false);
    };

    const hasBrandStory = profile?.tagline || profile?.about;

    const handleSocialChange = (key, val) => {
        setSocialForm(prev => ({ ...prev, [key]: val }));
        setSocialErrors(prev => {
            const next = { ...prev };
            if (val && !validateUrl(val)) next[key] = "Enter a valid URL";
            else delete next[key];
            return next;
        });
    };

    const handleSaveSocials = async () => {
        const errs = {};
        SOCIALS.forEach(({ key }) => {
            if (socialForm[key] && !validateUrl(socialForm[key])) errs[key] = "Enter a valid URL";
        });
        if (Object.keys(errs).length) { setSocialErrors(errs); return; }
        setSavingSocials(true);
        try {
            await onSave({ socials: socialForm });
            setSocialsEdit(false);
        } catch (e) {
            console.error(e);
        } finally {
            setSavingSocials(false);
        }
    };

    const handleDiscardSocials = () => {
        setSocialForm({
            website: profile?.socials?.website || "",
            instagram: profile?.socials?.instagram || "",
            linkedin: profile?.socials?.linkedin || "",
            twitter: profile?.socials?.twitter || "",
        });
        setSocialErrors({});
        setSocialsEdit(false);
    };

    return (
        <div className="bp-tab-content" role="tabpanel" id="panel-identity" aria-labelledby="tab-identity">

            {/* ── Brand Details ── */}
            <SectionCard
                icon={Building2}
                title="Brand Details"
                subtitle="Core information about your brand"
                action={
                    detailsEdit ? (
                        <div style={{ display: "flex", gap: "var(--bd-space-2)" }}>
                            <button className="bp-btn bp-btn--ghost bp-btn--sm" onClick={handleDiscardDetails} disabled={savingDetails}>
                                Cancel
                            </button>
                            <button
                                className="bp-btn bp-btn--primary bp-btn--sm"
                                onClick={handleSaveDetails}
                                disabled={savingDetails || !detailsForm.name.trim()}
                            >
                                {savingDetails ? "Saving..." : "Save"}
                            </button>
                        </div>
                    ) : (
                        <button className="bp-btn bp-btn--ghost bp-btn--sm" onClick={() => setDetailsEdit(true)}>
                            <Edit style={{ width: 13, height: 13 }} /> Edit
                        </button>
                    )
                }
            >
                {detailsEdit ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--bd-space-4)" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "var(--bd-font-size-xs)", fontWeight: "var(--bd-font-weight-semibold)", color: "var(--bd-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--bd-space-1)" }}>
                                Brand Name *
                            </label>
                            <input
                                className="bp-field__input"
                                value={detailsForm.name}
                                onChange={e => setDetailsForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Your brand name"
                            />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--bd-space-4)" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "var(--bd-font-size-xs)", fontWeight: "var(--bd-font-weight-semibold)", color: "var(--bd-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--bd-space-1)" }}>
                                    Industry
                                </label>
                                <select
                                    className="bp-field__input"
                                    value={detailsForm.industry}
                                    onChange={e => setDetailsForm(prev => ({ ...prev, industry: e.target.value }))}
                                    style={{ cursor: "pointer" }}
                                >
                                    <option value="">Select industry</option>
                                    {INDUSTRIES.map(ind => (
                                        <option key={ind} value={ind}>{ind}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "var(--bd-font-size-xs)", fontWeight: "var(--bd-font-weight-semibold)", color: "var(--bd-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--bd-space-1)" }}>
                                    Location
                                </label>
                                <input
                                    className="bp-field__input"
                                    value={detailsForm.location}
                                    onChange={e => setDetailsForm(prev => ({ ...prev, location: e.target.value }))}
                                    placeholder="e.g. New York, USA"
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--bd-space-5)" }}>
                        <div>
                            <p style={{ fontSize: "var(--bd-font-size-xs)", color: "var(--bd-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--bd-space-1)" }}>Brand Name</p>
                            <p style={{ fontSize: "var(--bd-font-size-sm)", fontWeight: "var(--bd-font-weight-semibold)", color: "var(--bd-text-primary)" }}>{profile?.name || "—"}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: "var(--bd-font-size-xs)", color: "var(--bd-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--bd-space-1)" }}>Industry</p>
                            <p style={{ fontSize: "var(--bd-font-size-sm)", fontWeight: "var(--bd-font-weight-medium)", color: "var(--bd-text-primary)" }}>{profile?.industry || "—"}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: "var(--bd-font-size-xs)", color: "var(--bd-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--bd-space-1)" }}>Location</p>
                            <p style={{ fontSize: "var(--bd-font-size-sm)", fontWeight: "var(--bd-font-weight-medium)", color: "var(--bd-text-primary)", display: "flex", alignItems: "center", gap: 4 }}>
                                {profile?.location ? <><MapPin style={{ width: 12, height: 12 }} />{profile.location}</> : "—"}
                            </p>
                        </div>
                    </div>
                )}
            </SectionCard>

            {/* ── Brand Story ── */}
            <SectionCard
                icon={BookOpen}
                title="Brand Story"
                subtitle="How your brand is presented to creators"
                action={hasBrandStory ? (
                    <button className="bp-btn bp-btn--ghost bp-btn--sm" onClick={() => setStoryModalOpen(true)}>
                        <Edit style={{ width: 13, height: 13 }} /> Edit
                    </button>
                ) : null}
            >
                {hasBrandStory ? (
                    <div>
                        {profile.tagline && (
                            <p style={{
                                fontSize: "var(--bd-font-size-lg)",
                                fontWeight: "var(--bd-font-weight-semibold)",
                                color: "var(--bd-text-primary)",
                                marginBottom: "var(--bd-space-3)",
                                lineHeight: 1.4
                            }}>{profile.tagline}</p>
                        )}
                        {profile.about && (
                            <p style={{
                                fontSize: "var(--bd-font-size-sm)",
                                color: "var(--bd-text-secondary)",
                                lineHeight: 1.65,
                                marginBottom: profile.skills?.length ? "var(--bd-space-4)" : 0,
                                whiteSpace: "pre-wrap"
                            }}>{profile.about}</p>
                        )}
                        {(profile.brandValues || profile.skills)?.length > 0 && (
                            <div className="bp-tags">
                                {(profile.brandValues || profile.skills).map(tag => (
                                    <span key={tag} className="bp-tag">{tag}</span>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <EmptyState
                        icon={BookOpen}
                        title="Tell creators who you are"
                        description="Brands with a clear story receive more creator applications. Add your positioning, brand voice, and campaign expectations."
                        actionLabel="Add Brand Story"
                        onAction={() => setStoryModalOpen(true)}
                    />
                )}
            </SectionCard>

            {/* ── Brand Assets ── */}
            <SectionCard
                icon={ImageIcon}
                title="Brand Assets"
                subtitle="Visual identity materials"
            >
                <div className="bp-two-col">
                    <div>
                        <p style={{ fontSize: "var(--bd-font-size-xs)", fontWeight: "var(--bd-font-weight-semibold)", color: "var(--bd-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--bd-space-2)" }}>
                            Logo
                        </p>
                        <UploadCard
                            label="Upload Logo"
                            hint="PNG, JPG up to 2MB"
                            usageNote="Shown on campaign pages and brand discovery"
                            accept="image/png,image/jpeg"
                            value={profile?.logo}
                            previewSize={88}
                            onFileSelect={async (file) => {
                                await uploadLogo(file);
                                if (onSave) await onSave({ _refresh: true });
                            }}
                        />
                    </div>
                    <div>
                        <p style={{ fontSize: "var(--bd-font-size-xs)", fontWeight: "var(--bd-font-weight-semibold)", color: "var(--bd-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--bd-space-2)" }}>
                            Cover Image
                        </p>
                        <UploadCard
                            label="Upload Cover"
                            hint="1200×400 recommended"
                            usageNote="Banner shown on your public brand profile"
                            accept="image/png,image/jpeg"
                            value={profile?.banner}
                            previewSize={88}
                            onFileSelect={async (file) => {
                                await uploadCover(file);
                                if (onSave) await onSave({ _refresh: true });
                            }}
                        />
                    </div>
                </div>

                <div style={{ marginTop: "var(--bd-space-5)" }}>
                    <p style={{ fontSize: "var(--bd-font-size-xs)", fontWeight: "var(--bd-font-weight-semibold)", color: "var(--bd-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--bd-space-3)" }}>
                        Documents
                    </p>
                    <div className="bp-two-col">
                        <UploadCard
                            label="Brand Guidelines"
                            hint="PDF up to 10MB"
                            usageNote="Helps creators understand your do's and don'ts"
                            accept=".pdf"
                            onFileSelect={async (file) => {
                                await uploadDocument(file, 'brandGuidelines');
                                if (onSave) await onSave({ _refresh: true });
                            }}
                        />
                        <UploadCard
                            label="Media Kit"
                            hint="PDF up to 10MB"
                            usageNote="Shared with creators upon campaign acceptance"
                            accept=".pdf"
                            onFileSelect={async (file) => {
                                await uploadDocument(file, 'mediaKit');
                                if (onSave) await onSave({ _refresh: true });
                            }}
                        />
                    </div>
                </div>
            </SectionCard>

            {/* ── Social Links ── */}
            <SectionCard
                icon={Globe}
                title="Social Links"
                subtitle="Platform · Status · Preview"
                action={
                    socialsEdit ? (
                        <div style={{ display: "flex", gap: "var(--bd-space-2)" }}>
                            <button className="bp-btn bp-btn--ghost bp-btn--sm" onClick={handleDiscardSocials} disabled={savingSocials}>
                                Cancel
                            </button>
                            <button
                                className="bp-btn bp-btn--primary bp-btn--sm"
                                onClick={handleSaveSocials}
                                disabled={savingSocials || Object.keys(socialErrors).length > 0}
                            >
                                {savingSocials ? "Saving..." : "Save"}
                            </button>
                        </div>
                    ) : (
                        <button className="bp-btn bp-btn--ghost bp-btn--sm" onClick={() => setSocialsEdit(true)}>
                            <Edit style={{ width: 13, height: 13 }} /> Edit
                        </button>
                    )
                }
            >
                {socialsEdit ? (
                    /* Edit mode — vertical fields */
                    <div>
                        {SOCIALS.map(({ key, Icon, label, placeholder }) => (
                            <div key={key} className="bp-social-row">
                                <div className="bp-social-row__icon"><Icon style={{ width: 16, height: 16 }} /></div>
                                <div style={{ flex: 1, fontWeight: "var(--bd-font-weight-medium)", fontSize: "var(--bd-font-size-sm)", color: "var(--bd-text-primary)", minWidth: 80, maxWidth: 80 }}>
                                    {label}
                                </div>
                                <div className="bp-social-row__input" style={{ flex: 1 }}>
                                    <input
                                        className={`bp-field__input ${socialErrors[key] ? "bp-field__input--error" : ""}`}
                                        value={socialForm[key]}
                                        onChange={e => handleSocialChange(key, e.target.value)}
                                        placeholder={placeholder}
                                        aria-label={`${label} URL`}
                                    />
                                    {socialErrors[key] && <div className="bp-field__error">{socialErrors[key]}</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Display mode — table layout */
                    <table className="bp-social-table" aria-label="Social accounts">
                        <thead>
                            <tr>
                                <th>Platform</th>
                                <th>Status</th>
                                <th>Preview</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {SOCIALS.map(({ key, Icon, label, importance }) => {
                                const url = profile?.socials?.[key];
                                return (
                                    <tr key={key}>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: "var(--bd-space-2)" }}>
                                                <div style={{ width: 28, height: 28, borderRadius: "var(--bd-radius-md)", background: "var(--bd-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                    <Icon style={{ width: 14, height: 14, color: "var(--bd-text-secondary)" }} />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: "var(--bd-font-size-sm)", fontWeight: "var(--bd-font-weight-medium)", color: "var(--bd-text-primary)" }}>{label}</div>
                                                    <div style={{ fontSize: "0.6875rem", color: "var(--bd-text-muted)" }}>{importance}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`bp-status ${url ? "bp-status--connected" : "bp-status--disconnected"}`}>
                                                <span className="bp-status__dot" />
                                                {url ? "Added" : "Not added"}
                                            </span>
                                        </td>
                                        <td>
                                            {url ? (
                                                <a
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 4,
                                                        fontSize: "var(--bd-font-size-xs)",
                                                        color: "var(--bd-accent)",
                                                        textDecoration: "none",
                                                        maxWidth: 180,
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap"
                                                    }}
                                                >
                                                    {url.replace(/^https?:\/\/(www\.)?/, "")}
                                                    <ExternalLink style={{ width: 10, height: 10, flexShrink: 0 }} />
                                                </a>
                                            ) : (
                                                <span style={{ fontSize: "var(--bd-font-size-xs)", color: "var(--bd-text-muted)" }}>—</span>
                                            )}
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            <button
                                                className="bp-btn bp-btn--ghost bp-btn--sm"
                                                onClick={() => setSocialsEdit(true)}
                                                aria-label={url ? `Edit ${label}` : `Add ${label}`}
                                                style={{ padding: "4px 8px" }}
                                            >
                                                {url ? "Edit" : "Add"}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </SectionCard>

            {/* Brand Story Modal */}
            <BrandStoryModal
                isOpen={storyModalOpen}
                initialData={profile}
                onSave={onSave}
                onClose={() => setStoryModalOpen(false)}
            />
        </div>
    );
};

export default IdentityTab;
