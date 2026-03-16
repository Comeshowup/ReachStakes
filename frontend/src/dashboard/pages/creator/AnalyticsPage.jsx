import React from "react";
import VideoStatsPage from "./VideoStatsPage";

// Analytics page — wraps VideoStatsPage for now.
// Designed to be extended with campaign performance, audience insights, etc.
const AnalyticsPage = () => {
  return (
    <div>
      <div className="mb-6">
        <h1
          className="text-2xl font-bold tracking-tight mb-1"
          style={{ color: "var(--bd-text-primary)" }}
        >
          Analytics
        </h1>
        <p
          className="text-sm"
          style={{ color: "var(--bd-text-secondary)" }}
        >
          Track your video performance, campaign metrics, and audience insights
        </p>
      </div>
      <VideoStatsPage />
    </div>
  );
};

export default AnalyticsPage;
