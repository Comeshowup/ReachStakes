import { useState, useEffect, useCallback } from "react";
import api from "../../../api/axios";
import { useGoogleLogin } from "@react-oauth/google";

/**
 * useSocialAccounts — Manages social account connections/disconnections.
 * Preserves all existing OAuth flows from the original SocialAccounts.jsx.
 */
const useSocialAccounts = () => {
  const [socialData, setSocialData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get current user info from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id;

  const fetchAccounts = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await api.get(`/social/${userId}`);
      setSocialData(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch social accounts", err);
    }
  }, [userId]);

  // Fetch on mount + handle OAuth redirect codes
  useEffect(() => {
    fetchAccounts();

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");

    if (code) {
      if (!userId) return;

      // Remove code from URL without refresh
      const newUrl =
        window.location.protocol +
        "//" +
        window.location.host +
        window.location.pathname;
      window.history.pushState({ path: newUrl }, "", newUrl);

      setLoading(true);

      if (state === "tiktok") {
        const linkTikTok = async () => {
          try {
            const currentRedirectUri = `${window.location.origin}/creator/settings/social`;
            await api.post("/social/tiktok/link", {
              code,
              userId,
              redirectUri: currentRedirectUri,
            });
            alert("TikTok account connected successfully!");
            fetchAccounts();
          } catch (err) {
            console.error("TikTok Link Error:", err);
            alert(
              "Failed to link TikTok: " +
                (err.response?.data?.message || err.message)
            );
          } finally {
            setLoading(false);
          }
        };
        linkTikTok();
      } else {
        const linkInstagram = async () => {
          try {
            const currentRedirectUri = `${window.location.origin}/creator/settings/social`;
            await api.post("/social/instagram/link", {
              code,
              userId,
              redirectUri: currentRedirectUri,
            });
            alert("Instagram account connected successfully!");
            fetchAccounts();
          } catch (err) {
            console.error("Instagram Link Error:", err);
            alert(
              "Failed to link Instagram: " +
                (err.response?.data?.message || err.message)
            );
          } finally {
            setLoading(false);
          }
        };
        linkInstagram();
      }
    }
  }, [userId, fetchAccounts]);

  const handleDisconnect = async (accountId) => {
    if (!confirm("Are you sure you want to disconnect this account?")) return;
    try {
      await api.delete(`/social/${accountId}`);
      fetchAccounts();
    } catch (err) {
      alert("Failed to disconnect account");
    }
  };

  // Google / YouTube Auth Flow
  const linkYoutube = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      setLoading(true);
      try {
        await api.post("/social/youtube/link", {
          code: codeResponse.code,
          userId,
        });
        alert("YouTube account connected successfully!");
        fetchAccounts();
      } catch (err) {
        console.error("YouTube Link Error:", err);
        alert(
          "Failed to link YouTube account. " +
            (err.response?.data?.message || "")
        );
      } finally {
        setLoading(false);
      }
    },
    onError: () => alert("YouTube connection failed"),
    flow: "auth-code",
    scope: "https://www.googleapis.com/auth/youtube.readonly",
    prompt: "consent",
  });

  const connectInstagram = () => {
    const clientId =
      import.meta.env.VITE_INSTAGRAM_CLIENT_ID || "YOUR_INSTAGRAM_CLIENT_ID";
    const redirectUri = `${window.location.origin}/creator/settings/social`;
    const scope =
      "instagram_business_basic,instagram_business_manage_insights";
    const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code`;
    window.location.href = authUrl;
  };

  const connectTikTok = () => {
    const clientKey = import.meta.env.VITE_TIKTOK_CLIENT_KEY;
    if (!clientKey || clientKey === "YOUR_TIKTOK_CLIENT_KEY") {
      alert(
        "TikTok Client Key is missing! Please check your .env file and RESTART the server."
      );
      return;
    }
    const redirectUri = `${window.location.origin}/creator/settings/social`;
    const scope = "user.info.basic,video.list";
    const state = "tiktok";
    const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&scope=${scope}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
    window.location.href = authUrl;
  };

  const connectTwitter = () => {
    alert("Twitter linking coming soon!");
  };

  const getAccountsFor = (platformName) => {
    return socialData
      .filter(
        (acc) => acc.platform.toLowerCase() === platformName.toLowerCase()
      )
      .map((acc) => ({
        id: acc.id,
        username: acc.username,
        handle: acc.handle,
        url: acc.profileUrl,
      }));
  };

  return {
    socialData,
    loading,
    getAccountsFor,
    handleDisconnect,
    connectInstagram,
    connectTikTok,
    connectTwitter,
    linkYoutube,
  };
};

export default useSocialAccounts;
