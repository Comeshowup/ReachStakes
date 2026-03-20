import React, { useState, useEffect } from "react";
import { Copy, ExternalLink, Check } from "lucide-react";
import SettingsCard from "../components/SettingsCard";
import FormField, { Input, Textarea, Select } from "../components/FormField";
import AvatarUpload from "../components/AvatarUpload";
import useProfile from "../hooks/useProfile";

const NICHE_OPTIONS = [
  "",
  "Fashion & Beauty",
  "Tech & Gaming",
  "Health & Fitness",
  "Food & Cooking",
  "Travel & Adventure",
  "Lifestyle",
  "Business & Finance",
  "Education",
  "Entertainment",
  "Music",
  "Sports",
  "Art & Design",
  "Parenting & Family",
  "Pets & Animals",
  "Photography",
  "Sustainability",
  "Other",
];

/**
 * ProfilePage — Creator identity settings (not a public profile).
 * Three card sections: Profile Information, Creator Category, Public Profile.
 */
const ProfilePage = () => {
  const { profile, setProfile, loading, updateProfile, uploadAvatar } = useProfile();
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null); // which card just saved
  const [savingCard, setSavingCard] = useState(null); // which card is currently saving

  const profileUrl = `${window.location.origin}/profile/@${profile.handle || profile.username}`;

  const handleChange = (field) => (e) => {
    setProfile((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleAvatarChange = async (file, previewUrl) => {
    // Show preview immediately
    setProfile((prev) => ({ ...prev, avatarUrl: previewUrl }));
    
    // Upload file to server
    const result = await uploadAvatar(file);
    if (!result.success) {
      console.error("Failed to upload avatar:", result.error);
      // Depending on requirements, we could revert the preview here
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async (card) => {
    setSavingCard(card);
    const fields = {
      info: {
        displayName: profile.displayName,
        username: profile.username,
        bio: profile.bio,
        location: profile.location,
      },
      category: {
        primaryNiche: profile.primaryNiche,
        secondaryNiche: profile.secondaryNiche,
      },
    };

    const result = await updateProfile(fields[card] || {});
    setSavingCard(null);
    if (result.success) {
      setSaveSuccess(card);
      setTimeout(() => setSaveSuccess(null), 2000);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-48 rounded-2xl animate-pulse"
            style={{ background: "var(--bd-surface-input)" }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Card 1: Profile Information */}
      <SettingsCard
        title="Profile Information"
        description="This information will be shown on your public creator profile."
        action={
          <SaveButton
            onClick={() => handleSave("info")}
            saving={savingCard === "info"}
            success={saveSuccess === "info"}
          />
        }
      >
        <div className="space-y-5">
          <AvatarUpload
            src={profile.avatarUrl}
            name={profile.displayName}
            onChange={handleAvatarChange}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Display name">
              <Input
                value={profile.displayName}
                onChange={handleChange("displayName")}
                placeholder="Your name"
              />
            </FormField>

            <FormField label="Username" hint="This is your unique handle.">
              <Input
                value={profile.username}
                onChange={handleChange("username")}
                placeholder="@username"
              />
            </FormField>
          </div>

          <FormField label="Bio" hint="A short description about you. Max 160 characters.">
            <Textarea
              value={profile.bio}
              onChange={handleChange("bio")}
              placeholder="Tell brands about yourself..."
              rows={3}
              maxLength={160}
            />
          </FormField>

          <FormField label="Location">
            <Input
              value={profile.location}
              onChange={handleChange("location")}
              placeholder="City, Country"
            />
          </FormField>
        </div>
      </SettingsCard>

      {/* Card 2: Creator Category */}
      <SettingsCard
        title="Creator Category"
        description="Help brands discover you by selecting your content niches."
        action={
          <SaveButton
            onClick={() => handleSave("category")}
            saving={savingCard === "category"}
            success={saveSuccess === "category"}
          />
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Primary niche">
            <Select
              value={profile.primaryNiche}
              onChange={handleChange("primaryNiche")}
            >
              {NICHE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n || "Select a niche..."}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Secondary niche" hint="Optional">
            <Select
              value={profile.secondaryNiche}
              onChange={handleChange("secondaryNiche")}
            >
              {NICHE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n || "None"}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
      </SettingsCard>

      {/* Card 3: Public Profile */}
      <SettingsCard
        title="Public Profile"
        description="Share your media kit and profile with brands."
      >
        <div className="space-y-4">
          {/* Profile URL */}
          <FormField label="Profile URL">
            <div className="flex items-center gap-2">
              <div
                className="flex-1 px-3.5 py-2.5 rounded-xl text-sm truncate"
                style={{
                  background: "var(--bd-surface-input)",
                  border: "1px solid var(--bd-border-subtle)",
                  color: "var(--bd-text-secondary)",
                }}
              >
                {profileUrl}
              </div>
              <button
                onClick={handleCopyUrl}
                className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: copied ? "var(--bd-success-muted)" : "var(--bd-surface-input)",
                  border: `1px solid ${copied ? "var(--bd-success-border)" : "var(--bd-border-subtle)"}`,
                  color: copied ? "var(--bd-success)" : "var(--bd-text-primary)",
                }}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </FormField>

          {/* Share media kit */}
          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-80"
            style={{ color: "var(--bd-accent)" }}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View public media kit
          </a>
        </div>
      </SettingsCard>
    </div>
  );
};

/**
 * SaveButton — Reusable save button with loading/success states.
 */
const SaveButton = ({ onClick, saving = false, success = false }) => (
  <button
    onClick={onClick}
    disabled={saving}
    className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
    style={{
      background: success ? "var(--bd-success)" : "var(--bd-primary)",
      color: "var(--bd-primary-fg)",
      boxShadow: "var(--bd-shadow-primary-btn)",
      opacity: saving ? 0.7 : 1,
    }}
  >
    {saving ? "Saving..." : success ? "Saved!" : "Save"}
  </button>
);

export default ProfilePage;
