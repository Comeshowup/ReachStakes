import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * useProfile — Fetches and manages creator profile data for the settings profile page.
 */
const useProfile = () => {
  const [profile, setProfile] = useState({
    displayName: "",
    username: "",
    bio: "",
    location: "",
    avatarUrl: null,
    email: "",
    primaryNiche: "",
    secondaryNiche: "",
    handle: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/users/me/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.status === "success") {
          const d = res.data.data;
          setProfile({
            displayName: d.displayName || d.name || "",
            username: d.username || d.handle || "",
            bio: d.bio || d.about || "",
            location: d.location || "",
            avatarUrl: d.avatarUrl || null,
            email: d.email || "",
            primaryNiche: d.primaryNiche || d.niche || "",
            secondaryNiche: d.secondaryNiche || "",
            handle: d.handle || d.username || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("userInfo");
          window.location.href = "/auth";
        } else {
          setError("Failed to load profile data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const updateProfile = async (updates) => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/users/me/profile`, updates, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile((prev) => ({ ...prev, ...updates }));
      return { success: true };
    } catch (err) {
      console.error("Failed to update profile:", err);
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (file) => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(`${API_BASE_URL}/users/me/avatar`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data" 
        },
      });

      if (res.data.status === "success" && res.data.data?.avatarUrl) {
        setProfile((prev) => ({ ...prev, avatarUrl: res.data.data.avatarUrl }));
        return { success: true, url: res.data.data.avatarUrl };
      }
      return { success: false, error: "Failed to upload" };
    } catch (err) {
      console.error("Failed to upload avatar:", err);
      return { success: false, error: err.response?.data?.message || err.message };
    } finally {
      setSaving(false);
    }
  };

  return { profile, setProfile, loading, saving, error, updateProfile, uploadAvatar };
};

export default useProfile;
