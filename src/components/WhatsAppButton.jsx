/**
 * WhatsAppButton.jsx — Floating WhatsApp bubble
 * Features: pulsing green ring, hover tooltip, opens WhatsApp chat
 * Replace the phone number below with your real number
 */

import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";

// --- Replace this with your real WhatsApp number (with country code, no + sign) ---
const PHONE_NUMBER = "9779742841740";
const MESSAGE = encodeURIComponent(
  "Hi Madhav! I saw your portfolio and I'd love to discuss a project."
);
const WA_URL = `https://wa.me/${PHONE_NUMBER}?text=${MESSAGE}`;

export default function WhatsAppButton() {
  return (
    <motion.a
      href={WA_URL}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.5, type: "spring" }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="group fixed bottom-6 right-6 z-50 w-14 h-14 flex items-center justify-center rounded-full bg-whatsapp text-white text-2xl shadow-lg cursor-pointer"
      style={{ animation: "whatsapp-pulse 2s infinite" }}
      aria-label="Chat on WhatsApp"
    >
      <FaWhatsapp />

      {/* Tooltip */}
      <span className="absolute right-full mr-3 px-3 py-1.5 bg-bg-card border border-border rounded-lg text-xs text-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Chat on WhatsApp
      </span>
    </motion.a>
  );
}
