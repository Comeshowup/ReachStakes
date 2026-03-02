import React from "react";
import {
    CheckCircle,
    Clock,
    AlertCircle,
    MapPin,
    Briefcase,
    Globe,
    ExternalLink,
    Edit
} from "lucide-react";

const VERIFICATION_STATES = {
    verified: { label: "Verified", className: "bp-badge--verified", Icon: CheckCircle },
    pending: { label: "Pending", className: "bp-badge--pending", Icon: Clock },
    unverified: { label: "Not Verified", className: "bp-badge--unverified", Icon: AlertCircle },
};

const computeCompleteness = (profile) => {
    const fields = [
        profile?.name,
        profile?.tagline,
        profile?.about,
        profile?.industry,
        profile?.location,
        profile?.logo,
        profile?.banner,
        profile?.contact?.email,
        profile?.contact?.phone,
        profile?.socials?.website,
        profile?.socials?.instagram,
        profile?.socials?.linkedin,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
};

const BrandProfileHeader = ({ profile, onEditProfile }) => {
    if (!profile) return null;

    const verification = profile.verificationStatus || "verified";
    const verState = VERIFICATION_STATES[verification] || VERIFICATION_STATES.unverified;
    const completeness = computeCompleteness(profile);

    return (
        <div className="bp-header">
            <div className="bp-header__banner">
                <div className="bp-header__banner-pattern" />
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
                            <span className={`bp-badge ${verState.className}`}>
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
                        <button
                            className="bp-btn bp-btn--secondary"
                            onClick={onEditProfile}
                            aria-label="Edit Profile"
                        >
                            <Edit style={{ width: 14, height: 14 }} />
                            Edit Profile
                        </button>
                    </div>
                </div>

                <div className="bp-header__bottom">
                    <div className="bp-completeness" role="progressbar" aria-valuenow={completeness} aria-valuemin={0} aria-valuemax={100} aria-label="Profile completeness">
                        <span className="bp-completeness__label">Profile Completeness</span>
                        <div className="bp-completeness__track">
                            <div className="bp-completeness__fill" style={{ width: `${completeness}%` }} />
                        </div>
                        <span className="bp-completeness__value">{completeness}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandProfileHeader;
