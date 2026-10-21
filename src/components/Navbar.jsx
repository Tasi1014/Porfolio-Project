/**
 * Navbar.jsx — Fixed navigation with scroll effects
 * Matches Stitch reference: logo left, centered nav links,
 * "Let's Talk" button right, mobile hamburger drawer
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiMenuAlt3, HiX } from "react-icons/hi";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const handleClick = (e, href) => {
    e.preventDefault();
    setMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-bg-primary/90 backdrop-blur-xl py-3 border-b border-border"
          : "bg-transparent py-4"
      }`}
    >
      <div className="container-max flex items-center justify-between">
        {/* Logo */}
        <a
          href="#home"
          onClick={(e) => handleClick(e, "#home")}
          className="text-xl font-bold font-[family-name:var(--font-heading)] shrink-0"
        >
          Madhav<span className="text-accent">.</span>
        </a>

        {/* Desktop: Centered Floating Animated Nav Bar */}
        <div className="hidden md:flex items-center">
          <div className="relative flex items-center gap-1 p-1.5 bg-[#141414]/80 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.slice(1);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleClick(e, link.href)}
                  className={`relative px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-200 z-10 ${
                    isActive
                      ? "text-accent font-semibold"
                      : "text-text-secondary hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="floating-nav-pill"
                      className="absolute inset-0 bg-accent/15 border border-accent/40 rounded-full shadow-[0_0_16px_rgba(245,166,35,0.25)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    )}
                    {link.label}
                  </span>
                </a>
              );
            })}
          </div>
        </div>

        {/* Desktop: Let's Talk button */}
        <motion.a
          href="#contact"
          onClick={(e) => handleClick(e, "#contact")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="hidden md:flex items-center px-5 py-2 bg-accent text-bg-primary font-bold rounded-full text-sm cursor-pointer hover:brightness-110 shadow-lg shadow-accent/25 transition-all shrink-0 animate-bounce"
        >
          Let&apos;s Talk
        </motion.a>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-2xl text-text-primary p-2 cursor-pointer relative z-[60]"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <HiX /> : <HiMenuAlt3 />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={{
                closed: { 
                  x: "100%",
                  opacity: 0,
                  transition: { 
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1]
                  }
                },
                open: { 
                  x: "0%",
                  opacity: 1,
                  transition: { 
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1]
                  }
                }
              }}
              style={{ 
                willChange: mobileOpen ? 'transform' : 'auto',
                transform: 'translateZ(0)'
              }}
              className="fixed top-0 right-0 w-3/4 max-w-xs h-screen bg-bg-card border-l border-border z-40 flex flex-col pt-20 px-8 gap-6 md:hidden"
            >
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleClick(e, link.href)}
                  className={`text-lg font-medium transition-colors ${
                    activeSection === link.href.slice(1)
                      ? "text-accent"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#contact"
                onClick={(e) => handleClick(e, "#contact")}
                className="mt-4 text-center px-6 py-3 bg-accent text-bg-primary font-bold rounded-full text-sm animate-bounce shadow-lg shadow-accent/20"
              >
                Let&apos;s Talk
              </a>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
