import React from 'react';
import { createBrowserRouter, Outlet } from "react-router";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import EscrowVault from "@/app/pages/EscrowVault";

// Placeholder components for other routes
function Dashboard() {
  return <div className="p-8 text-gray-500">Dashboard Content</div>;
}

function Campaigns() {
  return <div className="p-8 text-gray-500">Active Campaigns Content</div>;
}

function Approvals() {
  return <div className="p-8 text-gray-500">Approvals Content</div>;
}

function NotFound() {
  return <div className="p-8 text-gray-500">404 Not Found</div>;
}

function Root() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: EscrowVault },
      { path: "dashboard", Component: Dashboard },
      { path: "campaigns", Component: Campaigns },
      { path: "approvals", Component: Approvals },
      { path: "*", Component: NotFound },
    ],
  },
]);
