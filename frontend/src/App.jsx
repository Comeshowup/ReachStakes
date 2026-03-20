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
import CampaignsPage from "./dashboard/pages/creator/CampaignsPage";
import CampaignWorkspacePage from "./dashboard/pages/creator/CampaignWorkspacePage";
import MySubmissions from "./dashboard/pages/creator/MySubmissions";
import ExploreCampaigns from "./dashboard/pages/creator/ExploreCampaigns";
import AnalyticsPage from "./dashboard/pages/creator/AnalyticsPage";
import EarningsPage from "./dashboard/pages/creator/EarningsPage";
import EarningsOverview from "./features/earnings/pages/EarningsOverview";
import TransactionsPage from "./features/earnings/pages/TransactionsPage";
import PayoutSettingsPage from "./features/earnings/pages/PayoutSettingsPage";
import SettingsLayout from "./features/settings/components/SettingsLayout";
import SettingsProfilePage from "./features/settings/pages/ProfilePage";
import SocialAccountsPage from "./features/settings/pages/SocialAccountsPage";
import PayoutsPage from "./features/settings/pages/PayoutsPage";
import OnboardingStatusPage from "./dashboard/pages/creator/OnboardingStatusPage";
import BrandProfile from "./dashboard/pages/BrandProfile";
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
import SupportCenterPage from "./dashboard/pages/SupportCenterPage";
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
        <Route path="payment/:transactionId" element={<PaymentStatus />} />

        <Route path="support" element={<SupportCenterPage />} />
        <Route path="contact" element={<Navigate to="/brand/support" replace />} />
        <Route path="content-hub" element={<ContentHub />} />
      </Route>

      {/* Creator Dashboard Routes — Workflow-based architecture */}
      <Route path="/creator" element={<CreatorLayout />}>
        <Route index element={<CreatorDashboardHome />} />

        {/* Campaigns — flat layout (no nested tabs) */}
        <Route path="campaigns" element={<CampaignsPage />} />
        <Route path="campaigns/:campaignId" element={<CampaignWorkspacePage />} />

        {/* Analytics */}
        <Route path="analytics" element={<AnalyticsPage />} />

        {/* Earnings — Overview / Transactions / Payout Settings */}
        <Route path="earnings" element={<EarningsPage />}>
          <Route index element={<EarningsOverview />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="settings" element={<PayoutSettingsPage />} />
          {/* Legacy redirects — keep so old bookmarks don't 404 */}
          <Route path="payouts" element={<Navigate to="/creator/earnings" replace />} />
          <Route path="invoices" element={<Navigate to="/creator/earnings/transactions" replace />} />
          <Route path="tax" element={<Navigate to="/creator/earnings" replace />} />
          <Route path="balance" element={<Navigate to="/creator/earnings" replace />} />
        </Route>

        {/* Settings — tabbed layout */}
        <Route path="settings" element={<SettingsLayout />}>
          <Route index element={<Navigate to="/creator/settings/profile" replace />} />
          <Route path="profile" element={<SettingsProfilePage />} />
          <Route path="social" element={<SocialAccountsPage />} />
          <Route path="payouts" element={<PayoutsPage />} />
        </Route>

        {/* Support */}
        <Route path="support" element={<SupportCenterPage />} />
        <Route path="onboarding-status" element={<OnboardingStatusPage />} />

        {/* Discovery & Navigation */}
        <Route path="explore" element={<ExploreCampaigns />} />
        <Route path="submissions" element={<Navigate to="/creator/campaigns" replace />} />
        <Route path="financials" element={<Navigate to="/creator/earnings" replace />} />
        <Route path="invoices" element={<Navigate to="/creator/earnings/transactions" replace />} />
        <Route path="video-stats" element={<Navigate to="/creator/analytics" replace />} />
        <Route path="profile" element={<Navigate to="/creator/settings/profile" replace />} />
        <Route path="social-accounts" element={<Navigate to="/creator/settings/social" replace />} />
        <Route path="documents" element={<Navigate to="/creator/campaigns" replace />} />
        <Route path="contact" element={<Navigate to="/creator/support" replace />} />
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
