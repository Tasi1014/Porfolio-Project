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

        {/* Desktop: Centered Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleClick(e, link.href)}
              className={`relative text-sm font-medium transition-colors duration-200 hover:text-text-primary ${
                activeSection === link.href.slice(1)
                  ? "text-accent"
                  : "text-text-secondary"
              }`}
            >
              {link.label}
              {activeSection === link.href.slice(1) && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute -bottom-1 left-0 w-full h-0.5 bg-accent rounded-full"
                />
              )}
            </a>
          ))}
        </div>

        {/* Desktop: Let's Talk button */}
        <motion.a
          href="#contact"
          onClick={(e) => handleClick(e, "#contact")}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="hidden md:flex items-center px-5 py-2 bg-accent text-bg-primary font-semibold rounded-full text-sm cursor-pointer hover:brightness-110 transition-all shrink-0"
        >
          Let&apos;s Talk
        </motion.a>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-2xl text-text-primary p-2 cursor-pointer"
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
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
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
                className="mt-4 text-center px-6 py-3 bg-accent text-bg-primary font-semibold rounded-full text-sm"
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
