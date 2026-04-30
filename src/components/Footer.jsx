/**
 * Footer.jsx — Minimal dark footer
 * Features: nav anchor links, copyright, back-to-top button
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiArrowUp } from "react-icons/hi";
import { FaHeart } from "react-icons/fa";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

export default function Footer() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  const handleClick = (e, href) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <footer className="border-t border-border bg-bg-card/30">
        <div className="container-max py-10">
          {/* Desktop row */}
          <div className="hidden md:flex items-center justify-between">
            {/* Left */}
            <p className="font-[family-name:var(--font-heading)] text-text-primary text-sm font-semibold">
              Madhav<span className="text-accent">.</span>{" "}
              <span className="text-text-secondary font-[family-name:var(--font-body)] font-normal ml-1">
                Creative Portfolio
              </span>
            </p>

            {/* Center: Nav links */}
            <div className="flex gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleClick(e, link.href)}
                  className="text-text-secondary text-sm hover:text-accent transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Right */}
            <p className="flex items-center gap-1.5 text-text-secondary/50 text-xs">
              © 2025 · Made with{" "}
              <FaHeart className="text-red-500 text-[10px]" /> in React
            </p>
          </div>

          {/* Mobile stacked */}
          <div className="flex flex-col items-center gap-5 md:hidden text-center">
            <p className="font-[family-name:var(--font-heading)] text-text-primary text-sm font-semibold">
              Madhav<span className="text-accent">.</span>{" "}
              <span className="text-text-secondary font-[family-name:var(--font-body)] font-normal">
                Creative Portfolio
              </span>
            </p>
            <div className="flex gap-5">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleClick(e, link.href)}
                  className="text-text-secondary text-sm hover:text-accent transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <p className="flex items-center gap-1.5 text-text-secondary/50 text-xs">
              © 2025 · Made with{" "}
              <FaHeart className="text-red-500 text-[10px]" /> in React
            </p>
          </div>
        </div>
      </footer>

      {/* Back-to-Top Button */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-20 z-40 w-10 h-10 flex items-center justify-center rounded-full bg-bg-card border border-border text-text-secondary hover:text-accent hover:border-accent transition-all cursor-pointer"
            aria-label="Back to top"
          >
            <HiArrowUp className="text-lg" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
