/**
 * AdminRoute.jsx — Auth-protected wrapper for admin pages
 * Shows loading spinner → login page → dashboard based on auth state
 */

import { useAuth } from "../../hooks/useAuth";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import { RiAdminLine } from "react-icons/ri";

export default function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center">
          <RiAdminLine className="text-accent text-2xl" />
        </div>
        <div className="w-6 h-6 border-2 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return user ? <AdminDashboard /> : <AdminLogin />;
}
