import React, { useState } from "react";
import {
    BookOpen,
    Image as ImageIcon,
    Globe,
    Instagram,
    Linkedin,
    Twitter,
    Upload,
    FileText,
    Plus,
    X
} from "lucide-react";
import SectionCard from "./SectionCard";
import SettingsField from "./SettingsField";
import EmptyState from "./EmptyState";

const IdentityTab = ({ profile, onSave }) => {
    const [editMode, setEditMode] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        tagline: profile?.tagline || "",
        about: profile?.about || "",
        brandValues: profile?.brandValues || profile?.skills || [],
        socials: {
            website: profile?.socials?.website || "",
            instagram: profile?.socials?.instagram || "",
            linkedin: profile?.socials?.linkedin || "",
            twitter: profile?.socials?.twitter || "",
        }
    });
    const [errors, setErrors] = useState({});

    const validateUrl = (url) => {
        if (!url) return true;
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const handleSocialChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            socials: { ...prev.socials, [key]: value }
        }));
        if (value && !validateUrl(value)) {
            setErrors(prev => ({ ...prev, [key]: "Enter a valid URL" }));
        } else {
            setErrors(prev => {
                const next = { ...prev };
                delete next[key];
                return next;
            });
        }
    };

    const handleSaveSocials = async () => {
        const urlFields = ["website", "instagram", "linkedin", "twitter"];
        const newErrors = {};
        urlFields.forEach(key => {
            if (formData.socials[key] && !validateUrl(formData.socials[key])) {
                newErrors[key] = "Enter a valid URL";
            }
        });
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setSaving(true);
        try {
            await onSave({ socials: formData.socials });
            setEditMode(null);
        } catch (err) {
            console.error("Failed to save socials:", err);
        } finally {
            setSaving(false);
        }
    };

    const hasBrandStory = profile?.tagline || profile?.about;

    return (
        <div className="bp-tab-content" role="tabpanel" id="panel-identity" aria-labelledby="tab-identity">
            {/* Brand Story */}
            <SectionCard
                icon={BookOpen}
                title="Brand Story"
                subtitle="How creators see your brand"
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
                            }}>
                                {profile.tagline}
                            </p>
                        )}
                        {profile.about && (
                            <p style={{
                                fontSize: "var(--bd-font-size-sm)",
                                color: "var(--bd-text-secondary)",
                                lineHeight: 1.6,
                                marginBottom: "var(--bd-space-4)"
                            }}>
                                {profile.about}
                            </p>
                        )}
                        {(profile.brandValues || profile.skills) && (
                            <div className="bp-tags">
                                {(profile.brandValues || profile.skills || []).map(tag => (
                                    <span key={tag} className="bp-tag">{tag}</span>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <EmptyState
                        icon={BookOpen}
                        title="No brand story added yet"
                        description="Creators are more likely to apply when brands provide context about their mission and values."
                        actionLabel="Add Brand Story"
                        onAction={() => setEditMode("story")}
                    />
                )}
            </SectionCard>

            {/* Brand Assets */}
            <SectionCard
                icon={ImageIcon}
                title="Brand Assets"
                subtitle="Logo, cover image, and guidelines"
            >
                <div className="bp-two-col">
                    <div>
                        <p style={{
                            fontSize: "var(--bd-font-size-xs)",
                            fontWeight: "var(--bd-font-weight-medium)",
                            color: "var(--bd-text-secondary)",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                            marginBottom: "var(--bd-space-3)"
                        }}>Logo</p>
                        {profile?.logo ? (
                            <div style={{
                                width: 80,
                                height: 80,
                                borderRadius: "var(--bd-radius-xl)",
                                border: "1px solid var(--bd-border-subtle)",
                                overflow: "hidden",
                                background: "var(--bd-bg-secondary)"
                            }}>
                                <img
                                    src={profile.logo}
                                    alt="Brand logo"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            </div>
                        ) : (
                            <label className="bp-upload" style={{ maxWidth: 200, padding: "var(--bd-space-4)" }}>
                                <Upload style={{ width: 20, height: 20, color: "var(--bd-text-muted)" }} />
                                <span className="bp-upload__text">Upload Logo</span>
                                <span className="bp-upload__hint">PNG, JPG up to 2MB</span>
                                <input type="file" accept="image/png,image/jpeg" hidden />
                            </label>
                        )}
                    </div>
                    <div>
                        <p style={{
                            fontSize: "var(--bd-font-size-xs)",
                            fontWeight: "var(--bd-font-weight-medium)",
                            color: "var(--bd-text-secondary)",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                            marginBottom: "var(--bd-space-3)"
                        }}>Cover Image</p>
                        {profile?.banner ? (
                            <div style={{
                                width: "100%",
                                height: 80,
                                borderRadius: "var(--bd-radius-xl)",
                                border: "1px solid var(--bd-border-subtle)",
                                overflow: "hidden",
                                background: "var(--bd-bg-secondary)"
                            }}>
                                <img
                                    src={profile.banner}
                                    alt="Cover"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            </div>
                        ) : (
                            <label className="bp-upload" style={{ padding: "var(--bd-space-4)" }}>
                                <ImageIcon style={{ width: 20, height: 20, color: "var(--bd-text-muted)" }} />
                                <span className="bp-upload__text">Upload Cover</span>
                                <span className="bp-upload__hint">1200×400 recommended</span>
                                <input type="file" accept="image/png,image/jpeg" hidden />
                            </label>
                        )}
                    </div>
                </div>

                <div style={{ marginTop: "var(--bd-space-5)" }}>
                    <p style={{
                        fontSize: "var(--bd-font-size-xs)",
                        fontWeight: "var(--bd-font-weight-medium)",
                        color: "var(--bd-text-secondary)",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        marginBottom: "var(--bd-space-3)"
                    }}>Documents</p>
                    <div className="bp-two-col">
                        <label className="bp-upload" style={{ padding: "var(--bd-space-4)" }}>
                            <FileText style={{ width: 20, height: 20, color: "var(--bd-text-muted)" }} />
                            <span className="bp-upload__text">Brand Guidelines</span>
                            <span className="bp-upload__hint">PDF up to 10MB</span>
                            <input type="file" accept=".pdf" hidden />
                        </label>
                        <label className="bp-upload" style={{ padding: "var(--bd-space-4)" }}>
                            <FileText style={{ width: 20, height: 20, color: "var(--bd-text-muted)" }} />
                            <span className="bp-upload__text">Media Kit</span>
                            <span className="bp-upload__hint">PDF up to 10MB</span>
                            <input type="file" accept=".pdf" hidden />
                        </label>
                    </div>
                </div>
            </SectionCard>

            {/* Social Links */}
            <SectionCard
                icon={Globe}
                title="Social Links"
                subtitle="Connect your online presence"
                action={
                    editMode === "socials" ? (
                        <div style={{ display: "flex", gap: "var(--bd-space-2)" }}>
                            <button
                                className="bp-btn bp-btn--ghost bp-btn--sm"
                                onClick={() => { setEditMode(null); setErrors({}); }}
                            >
                                Cancel
                            </button>
                            <button
                                className="bp-btn bp-btn--primary bp-btn--sm"
                                onClick={handleSaveSocials}
                                disabled={saving || Object.keys(errors).length > 0}
                            >
                                {saving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    ) : (
                        <button
                            className="bp-btn bp-btn--ghost bp-btn--sm"
                            onClick={() => setEditMode("socials")}
                        >
                            Edit
                        </button>
                    )
                }
            >
                {editMode === "socials" ? (
                    <div>
                        <div className="bp-social-row">
                            <div className="bp-social-row__icon"><Globe style={{ width: 16, height: 16 }} /></div>
                            <div className="bp-social-row__input">
                                <input
                                    className={`bp-field__input ${errors.website ? "bp-field__input--error" : ""}`}
                                    value={formData.socials.website}
                                    onChange={e => handleSocialChange("website", e.target.value)}
                                    placeholder="https://yourwebsite.com"
                                    aria-label="Website URL"
                                />
                                {errors.website && <div className="bp-field__error">{errors.website}</div>}
                            </div>
                        </div>
                        <div className="bp-social-row">
                            <div className="bp-social-row__icon"><Instagram style={{ width: 16, height: 16 }} /></div>
                            <div className="bp-social-row__input">
                                <input
                                    className={`bp-field__input ${errors.instagram ? "bp-field__input--error" : ""}`}
                                    value={formData.socials.instagram}
                                    onChange={e => handleSocialChange("instagram", e.target.value)}
                                    placeholder="https://instagram.com/handle"
                                    aria-label="Instagram URL"
                                />
                                {errors.instagram && <div className="bp-field__error">{errors.instagram}</div>}
                            </div>
                        </div>
                        <div className="bp-social-row">
                            <div className="bp-social-row__icon"><Linkedin style={{ width: 16, height: 16 }} /></div>
                            <div className="bp-social-row__input">
                                <input
                                    className={`bp-field__input ${errors.linkedin ? "bp-field__input--error" : ""}`}
                                    value={formData.socials.linkedin}
                                    onChange={e => handleSocialChange("linkedin", e.target.value)}
                                    placeholder="https://linkedin.com/company/name"
                                    aria-label="LinkedIn URL"
                                />
                                {errors.linkedin && <div className="bp-field__error">{errors.linkedin}</div>}
                            </div>
                        </div>
                        <div className="bp-social-row">
                            <div className="bp-social-row__icon"><Twitter style={{ width: 16, height: 16 }} /></div>
                            <div className="bp-social-row__input">
                                <input
                                    className={`bp-field__input ${errors.twitter ? "bp-field__input--error" : ""}`}
                                    value={formData.socials.twitter}
                                    onChange={e => handleSocialChange("twitter", e.target.value)}
                                    placeholder="https://twitter.com/handle"
                                    aria-label="Twitter URL"
                                />
                                {errors.twitter && <div className="bp-field__error">{errors.twitter}</div>}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        {[
                            { key: "website", Icon: Globe, label: "Website" },
                            { key: "instagram", Icon: Instagram, label: "Instagram" },
                            { key: "linkedin", Icon: Linkedin, label: "LinkedIn" },
                            { key: "twitter", Icon: Twitter, label: "Twitter" },
                        ].map(({ key, Icon, label }) => (
                            <div key={key} className="bp-social-row">
                                <div className="bp-social-row__icon"><Icon style={{ width: 16, height: 16 }} /></div>
                                <div style={{ flex: 1 }}>
                                    <span style={{ fontSize: "var(--bd-font-size-sm)", color: "var(--bd-text-primary)", fontWeight: "var(--bd-font-weight-medium)" }}>
                                        {label}
                                    </span>
                                </div>
                                {profile?.socials?.[key] ? (
                                    <a
                                        href={profile.socials[key]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            fontSize: "var(--bd-font-size-sm)",
                                            color: "var(--bd-accent)",
                                            textDecoration: "none",
                                            maxWidth: 240,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap"
                                        }}
                                    >
                                        {profile.socials[key]}
                                    </a>
                                ) : (
                                    <span style={{ fontSize: "var(--bd-font-size-sm)", color: "var(--bd-text-muted)" }}>
                                        Not connected
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </SectionCard>
        </div>
    );
};

export default IdentityTab;
