/**
 * AdminLogin.jsx — Floating glassmorphism login card
 * Mobile-first, uses Firebase Email/Password Auth
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { HiMail, HiLockClosed, HiEye, HiEyeOff } from "react-icons/hi";
import { RiAdminLine } from "react-icons/ri";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged in App will handle the redirect
    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 200 }}
        className="w-full max-w-sm"
      >
        {/* Glass Card */}
        <div className="bg-bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center">
              <RiAdminLine className="text-accent text-3xl" />
            </div>
          </div>

          <h1 className="text-center text-2xl font-bold font-[family-name:var(--font-heading)] text-text-primary mb-1">
            Admin Panel
          </h1>
          <p className="text-center text-text-secondary text-sm mb-8">
            Sign in to manage portfolio content
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-lg" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3.5 bg-bg-elevated border border-border rounded-xl text-text-primary placeholder:text-text-secondary/50 text-sm focus:outline-none focus:border-accent transition"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-lg" />
              <input
                type={showPw ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-12 py-3.5 bg-bg-elevated border border-border rounded-xl text-text-primary placeholder:text-text-secondary/50 text-sm focus:outline-none focus:border-accent transition"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition cursor-pointer"
              >
                {showPw ? <HiEyeOff className="text-lg" /> : <HiEye className="text-lg" />}
              </button>
            </div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-xs text-center font-[family-name:var(--font-mono)]"
              >
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-accent text-bg-primary font-semibold rounded-xl text-sm hover:brightness-110 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-text-secondary/30 text-xs mt-6 font-[family-name:var(--font-mono)]">
          Portfolio Admin • Restricted Access
        </p>
      </motion.div>
    </div>
  );
}
