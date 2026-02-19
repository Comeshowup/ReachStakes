import { Routes, Route, Navigate } from "react-router-dom";

import NewLandingPage from "./NewLandingPage/NewLandingPage";
import HomePage from "./Homepage/HomePage";
import DashboardLayout from "./dashboard/layout/DashboardLayout";
// CMODashboard removed — redirects to /brand
import BrandCommandCenter from "./dashboard/pages/BrandCommandCenter";
import CampaignManagement from "./dashboard/pages/CampaignManagement";
import CreateCampaignPage from "./dashboard/pages/CreateCampaignPage";
import CampaignDetailPage from "./dashboard/pages/CampaignDetailPage";

import CreatorDiscovery from "./dashboard/pages/CreatorDiscovery";
import CommunityHub from "./dashboard/pages/CommunityHub";
import ApprovalQueue from "./dashboard/components/ApprovalQueue";
import EscrowVault from "./dashboard/pages/EscrowVault";
import PaymentStatus from "./dashboard/pages/PaymentStatus";
import MessagingPanel from "./dashboard/pages/MessagingPanel";
import CreatorLayout from "./dashboard/layout/CreatorLayout";
import CreatorDashboardHome from "./dashboard/pages/creator/CreatorDashboardHome";
import ExploreCampaigns from "./dashboard/pages/creator/ExploreCampaigns";
import CreatorFinancials from "./dashboard/pages/creator/CreatorFinancials";
import DiscoveryHub from "./dashboard/pages/creator/DiscoveryHub";
import MySubmissions from "./dashboard/pages/creator/MySubmissions";
import SocialAccounts from "./dashboard/pages/creator/SocialAccounts";
import InvoiceCenter from "./dashboard/pages/creator/InvoiceCenter";
import VideoStatsPage from "./dashboard/pages/creator/VideoStatsPage";
import DocumentsPage from "./dashboard/pages/creator/DocumentsPage";
import OnboardingStatusPage from "./dashboard/pages/creator/OnboardingStatusPage";
import BrandProfile from "./dashboard/pages/BrandProfile";
import CreatorProfile from "./dashboard/pages/creator/CreatorProfile";
import ProfilePage from "./dashboard/pages/ProfilePage";
import AdminLayout from "./dashboard/layout/AdminLayout";
import AdminDashboardHome from "./dashboard/pages/admin/AdminDashboardHome";
import UserManagement from "./dashboard/pages/admin/UserManagement";
import CampaignManagementAdmin from "./dashboard/pages/admin/CampaignManagementAdmin";
import FinancialManagementAdmin from "./dashboard/pages/admin/FinancialManagementAdmin";
import AuthPage from "./AuthPage/AuthPage";
import MeetingPage from "./pages/MeetingPage/MeetingPage";
import CampaignPage from "./pages/CampaignPage/CampaignPage";
import PublicMediaKit from "./pages/PublicMediaKit";
import BrandWorkspace from "./dashboard/pages/BrandWorkspace";
import ContactUsPage from "./dashboard/pages/ContactUsPage";
import BrandOnboardingWizard from "./pages/BrandOnboardingWizard";
import CreatorOnboardingWizard from "./pages/CreatorOnboardingWizard";
import Pricing from "./pages/Pricing";
import ContentHub from "./dashboard/pages/ContentHub";
import "./App.css";

// Main App Component managing all application routes
// Uses React Router for navigation between public pages and dashboards

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/meetings" element={<MeetingPage />} />
      <Route path="/campaign/:id" element={<CampaignPage />} />
      <Route path="/profile/:handle" element={<PublicMediaKit />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/new-landing" element={<NewLandingPage />} />
      <Route path="/pricing" element={<Pricing />} />

      {/* Brand Onboarding Wizard */}
      <Route path="/brand/onboarding" element={<BrandOnboardingWizard />} />

      {/* Creator Onboarding Wizard */}
      <Route path="/creator/onboarding" element={<CreatorOnboardingWizard />} />

      {/* Brand Workspace - Standalone Layout */}
      <Route path="/brand/workspace" element={<BrandWorkspace />} />
      <Route path="/brand/workspace/:campaignId" element={<BrandWorkspace />} />

      <Route path="/brand" element={<DashboardLayout />}>
        <Route index element={<BrandCommandCenter />} />
        <Route path="executive" element={<Navigate to="/brand" replace />} />
        <Route path="campaigns/create" element={<CreateCampaignPage />} />
        <Route path="campaigns/:id" element={<CampaignDetailPage />} />
        <Route path="campaigns" element={<CampaignManagement />} />
        <Route path="profile" element={<BrandProfile />} />
        <Route path="approvals" element={<ApprovalQueue />} />
        <Route path="financials" element={<EscrowVault />} />
        <Route path="escrow" element={<EscrowVault />} />
        <Route path="payment-status/:transactionId" element={<PaymentStatus />} />
        <Route path="contact" element={<ContactUsPage />} />
        <Route path="content-hub" element={<ContentHub />} />
      </Route>

      {/* Creator Dashboard Routes - Protected Layout */}
      <Route path="/creator" element={<CreatorLayout />}>
        <Route index element={<CreatorDashboardHome />} />
        <Route path="explore" element={<ExploreCampaigns />} />
        <Route path="submissions" element={<MySubmissions />} />
        <Route path="profile" element={<CreatorProfile />} />
        <Route path="financials" element={<CreatorFinancials />} />
        <Route path="invoices" element={<InvoiceCenter />} />
        <Route path="social-accounts" element={<SocialAccounts />} />
        <Route path="video-stats" element={<VideoStatsPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="contact" element={<ContactUsPage />} />
        <Route path="onboarding-status" element={<OnboardingStatusPage />} />
      </Route>

      {/* Admin Dashboard Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardHome />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="campaigns" element={<CampaignManagementAdmin />} />
        <Route path="financials" element={<FinancialManagementAdmin />} />
      </Route>

      {/* Public Profile Routes (Shareable links) */}
      <Route path="/profile/brand/:id" element={<ProfilePage type="brand" />} />
      <Route path="/profile/creator/:id" element={<ProfilePage type="creator" />} />
    </Routes>
  );
}

export default App;
