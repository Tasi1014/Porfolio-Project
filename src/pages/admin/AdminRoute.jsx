/**
 * AdminRoute.jsx — Auth-protected wrapper for admin pages
 * Shows loading spinner → login page → dashboard based on auth state
 */

import { useAuth } from "../../hooks/useAuth";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import { RiAdminLine } from "react-icons/ri";

export default function AdminRoute() {
  const { user, loading, isConfigured } = useAuth();

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mb-4">
          <RiAdminLine className="text-amber-400 text-3xl" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Firebase Not Configured on Vercel</h2>
        <p className="text-text-muted text-sm max-w-md mb-6 leading-relaxed">
          The Firebase environment variables have not been added to your Vercel Project Settings yet. Once you add them, the admin panel will activate.
        </p>
        <a
          href="/"
          className="px-5 py-2.5 rounded-xl bg-accent text-black font-semibold text-sm hover:opacity-90 transition"
        >
          Return to Portfolio
        </a>
      </div>
    );
  }

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
