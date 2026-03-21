import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import {
  Loader2,
  Share2,
  Copy,
  Check,
  Twitter,
  Linkedin,
} from "lucide-react";

// Media Kit Components
import HeroSection from "./mediakit/components/HeroSection";
import AboutSection from "./mediakit/components/AboutSection";
import PerformanceSection from "./mediakit/components/PerformanceSection";
import SocialProofSection from "./mediakit/components/SocialProofSection";
import ServicesSection from "./mediakit/components/ServicesSection";
import PlatformsInline from "./mediakit/components/PlatformsInline";
import FinalCTA from "./mediakit/components/FinalCTA";
import StickyCTA from "./mediakit/components/StickyCTA";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const PublicMediaKit = () => {
  const { handle } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Auth state
  const isLoggedIn = !!localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isBrand = currentUser?.role === "brand";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const cleanHandle = handle.startsWith("@")
          ? handle.substring(1)
          : handle;
        const response = await axios.get(
          `${API_BASE_URL}/media-kit/${cleanHandle}`
        );
        const data = response.data.data;

        setProfile({
          // Identity
          name: data.profile.name,
          handle: data.profile.handle,
          avatar: data.profile.avatar,
          location: data.profile.location,
          verificationTier: data.profile.verificationTier,
          niches: data.profile.tags || [],
          bio: data.profile.bio,

          // Stats
          stats: {
            totalReach: data.stats.followersTotal,
            avgViews: data.stats.avgViews || null,
            engagementRate: data.stats.engagementRate,
            primaryPlatform: data.stats.primaryPlatform || null,
          },

          // Platforms / socials
          platforms: (data.socials || []).map((s) => ({
            platform: s.platform,
            username: s.username,
            profileUrl: s.profileUrl,
            followers: s.followers || null,
          })),

          // Services
          services: data.services || [],

          // Demographics
          demographics: data.demographics || null,

          // Brand collaborations
          collaborations: data.brandAffiliations || [],
        });
      } catch (err) {
        console.error("Failed to fetch public profile", err);
        setError(err.response?.data?.message || "Profile not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [handle]);

  // Share
  const shareUrl = window.location.href;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnTwitter = () => {
    const text = `Check out ${profile.name}'s creator profile on ReachStakes!`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  const shareOnLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  // Booking
  const handleBookMe = () => {
    if (isBrand) {
      navigate(`/dashboard/campaigns/create?creator=${handle}`);
    } else if (isLoggedIn) {
      alert("Sign in as a brand to book this creator!");
    } else {
      navigate(`/register?role=brand&creator=${handle}`);
    }
  };

  // ------- LOADING -------
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  // ------- ERROR -------
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-slate-400">{error}</p>
        <Link
          to="/"
          className="px-6 py-2 bg-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-500 transition-colors"
        >
          Go Home
        </Link>
      </div>
    );
  }

  // ------- PAGE -------
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30 font-sans">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-[1100px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="text-lg font-bold tracking-tight text-white"
          >
            REACHSTAKES
            <span className="text-indigo-500">.</span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Share */}
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm font-medium hover:bg-white/10 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
              </button>

              <AnimatePresence>
                {showShareMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-44 py-1.5 bg-slate-900 border border-white/10 rounded-xl shadow-xl z-50"
                  >
                    <button
                      onClick={handleCopyLink}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-white/80 hover:bg-white/5 transition-colors"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      {copied ? "Copied!" : "Copy Link"}
                    </button>
                    <button
                      onClick={shareOnTwitter}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-white/80 hover:bg-white/5 transition-colors"
                    >
                      <Twitter className="w-3.5 h-3.5" />
                      Share on Twitter
                    </button>
                    <button
                      onClick={shareOnLinkedIn}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-white/80 hover:bg-white/5 transition-colors"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                      Share on LinkedIn
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="pt-20 pb-28 sm:pb-20 px-6 max-w-[1100px] mx-auto space-y-12">
        <HeroSection
          profile={{
            name: profile.name,
            handle: profile.handle,
            avatar: profile.avatar,
            location: profile.location,
            verificationTier: profile.verificationTier,
            niches: profile.niches,
          }}
          stats={profile.stats}
          platforms={profile.platforms}
          onBook={handleBookMe}
        />

        <AboutSection bio={profile.bio} niches={profile.niches} />

        <PerformanceSection
          stats={profile.stats}
          demographics={profile.demographics}
          platforms={profile.platforms}
        />

        <SocialProofSection collaborations={profile.collaborations} />

        <ServicesSection services={profile.services} />

        <PlatformsInline platforms={profile.platforms} />

        <FinalCTA onBook={handleBookMe} />
      </main>

      {/* Sticky mobile CTA */}
      <StickyCTA onBook={handleBookMe} />
    </div>
  );
};

export default PublicMediaKit;
