import React from "react";
import { Navigate, Outlet } from "react-router-dom";

/**
 * AdminGuard — protects all /admin/* routes.
 *
 * Rules:
 *  - No token or no userInfo  → redirect to /admin/login
 *  - Logged in but role !== 'admin' → redirect to /auth (wrong portal)
 *  - Admin user → render <Outlet /> (children routes)
 */
const AdminGuard = () => {
    const token = localStorage.getItem("token");
    const raw = localStorage.getItem("userInfo");

    // Not logged in at all
    if (!token || !raw) {
        return <Navigate to="/admin/login" replace />;
    }

    let user = null;
    try {
        user = JSON.parse(raw);
    } catch {
        // Malformed userInfo → treat as unauthenticated
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
        return <Navigate to="/admin/login" replace />;
    }

    // Logged in but wrong role
    if (user?.role !== "admin") {
        return <Navigate to="/auth" replace />;
    }

    // Authorized admin
    return <Outlet />;
};

export default AdminGuard;
