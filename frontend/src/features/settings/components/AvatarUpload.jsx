import React, { useRef } from "react";
import { Camera } from "lucide-react";

/**
 * AvatarUpload — Circular avatar preview with click-to-upload.
 * Shows fallback initial letter when no image is set.
 */
const AvatarUpload = ({ src, name = "", onChange, size = 80 }) => {
  const fileInputRef = useRef(null);
  const initial = name.charAt(0).toUpperCase() || "?";

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onChange) {
      onChange(file, URL.createObjectURL(file));
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="relative group rounded-full overflow-hidden shrink-0"
        style={{ width: size, height: size }}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-xl font-bold"
            style={{
              background: "var(--bd-sidebar-logo-bg)",
              color: "#ffffff",
            }}
          >
            {initial}
          </div>
        )}
        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <Camera className="w-5 h-5 text-white" />
        </div>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-sm font-medium transition-colors"
          style={{ color: "var(--bd-accent)" }}
        >
          Change avatar
        </button>
        <p className="text-xs mt-0.5" style={{ color: "var(--bd-text-muted)" }}>
          JPG, PNG or GIF. Max 2MB.
        </p>
      </div>
    </div>
  );
};

export default AvatarUpload;
