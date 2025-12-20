import { Routes, Route } from "react-router-dom";
import LandingPage from "./LandingPage/LandingPage";
import NewLandingPage from "./NewLandingPage/NewLandingPage";
import HomePage from "./Homepage/HomePage";
import DashboardLayout from "./dashboard/layout/DashboardLayout";
import DashboardHome from "./dashboard/pages/DashboardHome";
import CampaignManagement from "./dashboard/pages/CampaignManagement";
import CreatorDiscovery from "./dashboard/pages/CreatorDiscovery";
import CommunityHub from "./dashboard/pages/CommunityHub";
import VideoApprovalPanel from "./dashboard/pages/VideoApprovalPanel";
import FinancialManagementPanel from "./dashboard/pages/FinancialManagementPanel";
import MessagingPanel from "./dashboard/pages/MessagingPanel";
import CreatorLayout from "./dashboard/layout/CreatorLayout";
import CreatorDashboardHome from "./dashboard/pages/creator/CreatorDashboardHome";
import ExploreCampaigns from "./dashboard/pages/creator/ExploreCampaigns";
import CreatorFinancials from "./dashboard/pages/creator/CreatorFinancials";
import DiscoveryHub from "./dashboard/pages/creator/DiscoveryHub";
import MySubmissions from "./dashboard/pages/creator/MySubmissions";
import ProfilePage from "./dashboard/pages/ProfilePage";
import AuthPage from "./AuthPage/AuthPage";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/new-landing" element={<NewLandingPage />} />
      <Route path="/brand" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="campaigns" element={<CampaignManagement />} />
        <Route path="discovery" element={<CreatorDiscovery />} />
        <Route path="profile" element={<ProfilePage type="brand" />} />
        <Route path="community" element={<CommunityHub />} />
        <Route path="approvals" element={<VideoApprovalPanel />} />
        <Route path="financials" element={<FinancialManagementPanel />} />
        <Route path="messages" element={<MessagingPanel />} />
      </Route>
      <Route path="/creator" element={<CreatorLayout />}>
        <Route index element={<CreatorDashboardHome />} />
        <Route path="explore" element={<ExploreCampaigns />} />
        <Route path="discovery" element={<DiscoveryHub />} />
        <Route path="submissions" element={<MySubmissions />} />
        <Route path="profile" element={<ProfilePage type="creator" />} />
        <Route path="community" element={<CommunityHub />} />
        <Route path="messages" element={<MessagingPanel />} />
        <Route path="financials" element={<CreatorFinancials />} />
      </Route>

      {/* Public Profile Routes */}
      <Route path="/profile/brand/:id" element={<ProfilePage type="brand" />} />
      <Route path="/profile/creator/:id" element={<ProfilePage type="creator" />} />
    </Routes>
  );
}

export default App;
