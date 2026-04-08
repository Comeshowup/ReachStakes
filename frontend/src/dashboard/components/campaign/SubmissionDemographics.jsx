import React from 'react';
import { Users, Globe, TrendingUp, Info } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pct(value) {
    return typeof value === 'number' ? `${value.toFixed(1)}%` : `${parseFloat(value || 0).toFixed(1)}%`;
}

const GENDER_COLORS = { Male: 'rgb(96, 165, 250)', Female: 'rgb(244, 114, 182)', Other: 'rgb(167, 139, 250)' };

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, color }) {
    return (
        <div className="flex items-center gap-2 mb-3">
            <Icon className="w-4 h-4" style={{ color }} />
            <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--bd-text-secondary)' }}>
                {title}
            </h4>
        </div>
    );
}

function BarRow({ label, value, maxValue, color }) {
    const width = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;
    return (
        <div className="flex items-center gap-3">
            <span
                className="text-[11px] font-medium w-20 flex-shrink-0 truncate"
                style={{ color: 'var(--bd-text-secondary)' }}
            >
                {label}
            </span>
            <div
                className="flex-1 rounded-full overflow-hidden"
                style={{ height: 6, background: 'var(--bd-border-subtle)' }}
            >
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${width}%`, background: color }}
                />
            </div>
            <span
                className="text-[11px] font-bold w-10 text-right flex-shrink-0"
                style={{ color: 'var(--bd-text-primary)' }}
            >
                {pct(value)}
            </span>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * Renders audience demographics data in a compact card layout.
 *
 * @param {{ demographics: { ageRanges: object, genderSplit: object, topCountries: object, note: string|null } }} props
 */
const SubmissionDemographics = ({ demographics }) => {
    if (!demographics) return null;

    const { ageRanges = {}, genderSplit = {}, topCountries = {}, note } = demographics;

    const hasAgeData = Object.keys(ageRanges).length > 0;
    const hasGenderData = Object.keys(genderSplit).length > 0;
    const hasCountryData = Object.keys(topCountries).length > 0;
    const hasAnyData = hasAgeData || hasGenderData || hasCountryData;

    // If no data but there's a note, show the limitation note
    if (!hasAnyData && note) {
        return (
            <div
                className="flex items-start gap-3 p-4 rounded-xl text-xs"
                style={{ background: 'rgba(96, 165, 250, 0.05)', border: '1px solid rgba(96, 165, 250, 0.1)' }}
            >
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-400" />
                <p style={{ color: 'var(--bd-text-secondary)' }}>{note}</p>
            </div>
        );
    }

    if (!hasAnyData) return null;

    // Compute max values for bar scaling
    const maxAge = hasAgeData ? Math.max(...Object.values(ageRanges)) : 1;
    const maxCountry = hasCountryData ? Math.max(...Object.values(topCountries)) : 1;
    const totalGender = hasGenderData ? Object.values(genderSplit).reduce((s, v) => s + v, 0) : 1;

    return (
        <div className="space-y-6">
            {/* Age Ranges */}
            {hasAgeData && (
                <div>
                    <SectionHeader icon={Users} title="Age Range" color="rgb(167, 139, 250)" />
                    <div className="space-y-2">
                        {Object.entries(ageRanges)
                            .sort(([, a], [, b]) => b - a)
                            .map(([label, value]) => (
                                <BarRow
                                    key={label}
                                    label={label}
                                    value={value}
                                    maxValue={maxAge}
                                    color="rgb(167, 139, 250)"
                                />
                            ))}
                    </div>
                </div>
            )}

            {/* Gender Split */}
            {hasGenderData && (
                <div>
                    <SectionHeader icon={TrendingUp} title="Gender Split" color="rgb(244, 114, 182)" />
                    <div className="space-y-2">
                        {Object.entries(genderSplit).map(([gender, value]) => (
                            <BarRow
                                key={gender}
                                label={gender}
                                value={value}
                                maxValue={totalGender}
                                color={GENDER_COLORS[gender] || 'rgb(167, 139, 250)'}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Top Countries */}
            {hasCountryData && (
                <div>
                    <SectionHeader icon={Globe} title="Top Countries" color="rgb(52, 211, 153)" />
                    <div className="space-y-2">
                        {Object.entries(topCountries)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 5)
                            .map(([country, value]) => (
                                <BarRow
                                    key={country}
                                    label={country}
                                    value={value}
                                    maxValue={maxCountry}
                                    color="rgb(52, 211, 153)"
                                />
                            ))}
                    </div>
                </div>
            )}

            {/* Optional limitation note */}
            {note && (
                <p className="text-[11px]" style={{ color: 'var(--bd-text-secondary)', opacity: 0.6 }}>
                    ℹ️ {note}
                </p>
            )}
        </div>
    );
};

export default SubmissionDemographics;
