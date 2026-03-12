import React from "react";
import {
    CheckCircle,
    Clock,
    AlertCircle,
    MapPin,
    Briefcase,
    Globe,
    ExternalLink,
    ListChecks
} from "lucide-react";

const VERIFICATION_STATES = {
    verified: { label: "Verified", className: "bp-badge--verified", Icon: CheckCircle },
    pending: { label: "Pending", className: "bp-badge--pending", Icon: Clock },
    unverified: { label: "Not Verified", className: "bp-badge--unverified", Icon: AlertCircle },
};

export const computeCompleteness = (profile) => {
    const fields = [
        profile?.name,
        profile?.tagline,
        profile?.about,
        profile?.industry,
        profile?.location,
        profile?.logo,
        profile?.banner,
        profile?.contact?.email,
        profile?.socials?.website,
        profile?.socials?.instagram || profile?.socials?.linkedin || profile?.socials?.twitter,
        profile?.mediaKit || profile?.brandGuidelines,
        profile?.kycStatus === "verified",
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
};

const BrandProfileHeader = ({ profile, onCompleteProfile }) => {
    if (!profile) return null;

    const verification = profile.verificationStatus || "verified";
    const verState = VERIFICATION_STATES[verification] || VERIFICATION_STATES.unverified;
    const completeness = profile.profileStrength ?? computeCompleteness(profile);
    const isIncomplete = completeness < 100;

    return (
        <div className="bp-header">
            <div className="bp-header__banner">
                {profile.banner ? (
                    <img
                        src={profile.banner}
                        alt="Cover"
                        className="bp-header__banner-img"
                    />
                ) : (
                    <div className="bp-header__banner-pattern" />
                )}
            </div>

            <div className="bp-header__content">
                <div className="bp-header__identity">
                    <div className="bp-header__avatar">
                        {profile.logo ? (
                            <img src={profile.logo} alt={profile.name} />
                        ) : (
                            <div className="bp-header__avatar-fallback">
                                {profile.name?.charAt(0) || "B"}
                            </div>
                        )}
                    </div>

                    <div className="bp-header__info">
                        <div className="bp-header__name-row">
                            <h1 className="bp-header__name">{profile.name}</h1>
                            <span
                                className={`bp-badge ${verState.className}`}
                                title={
                                    verification === "verified"
                                        ? "Identity has been verified by ReachStakes"
                                        : verification === "pending"
                                            ? "Verification documents are under review"
                                            : "Complete KYC to verify your account"
                                }
                            >
                                <verState.Icon style={{ width: 11, height: 11 }} />
                                {verState.label}
                            </span>
                        </div>

                        <div className="bp-header__meta">
                            {profile.industry && (
                                <span className="bp-header__meta-item">
                                    <Briefcase style={{ width: 13, height: 13 }} />
                                    {profile.industry}
                                </span>
                            )}
                            {profile.location && (
                                <>
                                    <span className="bp-header__meta-dot">•</span>
                                    <span className="bp-header__meta-item">
                                        <MapPin style={{ width: 13, height: 13 }} />
                                        {profile.location}
                                    </span>
                                </>
                            )}
                            {profile.socials?.website && (
                                <>
                                    <span className="bp-header__meta-dot">•</span>
                                    <a
                                        href={profile.socials.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bp-header__meta-link"
                                    >
                                        <Globe style={{ width: 13, height: 13 }} />
                                        Website
                                        <ExternalLink style={{ width: 10, height: 10 }} />
                                    </a>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="bp-header__actions">
                        {isIncomplete && (
                            <button
                                className="bp-btn bp-btn--secondary"
                                onClick={onCompleteProfile}
                                aria-label="Complete profile checklist"
                                title="See steps to complete your profile"
                            >
                                <ListChecks style={{ width: 14, height: 14 }} />
                                Complete Profile
                            </button>
                        )}
                    </div>
                </div>

                <div className="bp-header__bottom">
                    <div
                        className="bp-completeness"
                        role="progressbar"
                        aria-valuenow={completeness}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Profile ${completeness}% complete`}
                    >
                        <span className="bp-completeness__label">Profile Strength</span>
                        <div className="bp-completeness__track">
                            <div
                                className="bp-completeness__fill"
                                style={{
                                    width: `${completeness}%`,
                                    background: completeness === 100
                                        ? "var(--bd-success)"
                                        : completeness >= 60
                                            ? "var(--bd-accent)"
                                            : "var(--bd-warning)"
                                }}
                            />
                        </div>
                        <span className="bp-completeness__value">{completeness}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandProfileHeader;
