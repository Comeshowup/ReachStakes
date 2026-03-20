import React from "react";
import { Instagram, Youtube, Twitter, Link2 } from "lucide-react";
import SocialPlatformCard from "../components/SocialPlatformCard";
import useSocialAccounts from "../hooks/useSocialAccounts";

const TikTokIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
  </svg>
);

/**
 * SocialAccountsPage — Connect and manage social media platforms.
 */

const PLATFORMS = [
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    color: "text-pink-600",
    bg: "bg-pink-50 dark:bg-pink-900/20",
    maxAccounts: 5,
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-900/20",
    maxAccounts: 5,
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: TikTokIcon,
    color: "text-black dark:text-white",
    bg: "bg-slate-100 dark:bg-slate-800",
    maxAccounts: 5,
  },
  {
    id: "twitter",
    name: "Twitter",
    icon: Twitter,
    color: "text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    maxAccounts: 5,
  },
];

const SocialAccountsPage = () => {
  const {
    loading,
    getAccountsFor,
    handleDisconnect,
    connectInstagram,
    connectTikTok,
    connectTwitter,
    linkYoutube,
  } = useSocialAccounts();

  const connectActions = {
    instagram: connectInstagram,
    youtube: linkYoutube,
    tiktok: connectTikTok,
    twitter: connectTwitter,
  };

  const allAccounts = PLATFORMS.reduce((acc, p) => {
    return acc + getAccountsFor(p.name).length;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Platform cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PLATFORMS.map((platform) => (
          <SocialPlatformCard
            key={platform.id}
            platform={platform}
            accounts={getAccountsFor(platform.name)}
            maxAccounts={platform.maxAccounts}
            onConnect={connectActions[platform.id]}
            onDisconnect={handleDisconnect}
            loading={loading}
          />
        ))}
      </div>

      {/* Empty state — show when no accounts connected at all */}
      {allAccounts === 0 && !loading && (
        <div
          className="text-center py-10 px-6 rounded-2xl"
          style={{
            background: "var(--bd-surface)",
            border: "1px dashed var(--bd-border-default)",
          }}
        >
          <Link2
            className="w-10 h-10 mx-auto mb-3"
            style={{ color: "var(--bd-text-muted)" }}
          />
          <h4
            className="text-base font-medium mb-1"
            style={{ color: "var(--bd-text-primary)" }}
          >
            No social accounts connected
          </h4>
          <p
            className="text-sm max-w-sm mx-auto"
            style={{ color: "var(--bd-text-secondary)" }}
          >
            Connect your first platform to showcase your reach and unlock more
            campaign opportunities.
          </p>
        </div>
      )}

      {/* Info banner */}
      <div
        className="p-5 rounded-2xl"
        style={{
          background: "var(--bd-info-muted)",
          border: "1px solid var(--bd-info-border)",
        }}
      >
        <h4
          className="text-sm font-medium mb-1"
          style={{ color: "var(--bd-text-primary)" }}
        >
          Why connect accounts?
        </h4>
        <p className="text-sm" style={{ color: "var(--bd-text-secondary)" }}>
          Connected accounts let brands see your real-time analytics, audience
          demographics, and engagement rates — increasing your chances of
          getting hired for campaigns.
        </p>
      </div>
    </div>
  );
};

export default SocialAccountsPage;
