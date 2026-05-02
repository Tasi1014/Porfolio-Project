import { useEffect } from "react";
import { motion } from "framer-motion";

export default function IntroScreen({ onComplete }) {
  useEffect(() => {
    // Prevent scrolling while intro is playing
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[99999] bg-[#0f0f0f] flex flex-col items-center justify-center pointer-events-none"
      initial={{ y: "0%" }}
      animate={{ y: "-100%" }}
      transition={{ delay: 1.4, duration: 0.5, ease: "easeInOut" }}
      onAnimationComplete={onComplete}
    >
      {/* Content wrapper to hold elements centered */}
      <div className="flex flex-col items-center relative">
        {/* Name: 0ms -> 400ms */}
        <motion.h1
          className="font-[family-name:var(--font-heading)] font-bold text-white tracking-tight"
          style={{ fontSize: "clamp(48px, 8vw, 80px)" }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          Madhav<span className="text-accent">.</span>
        </motion.h1>

        {/* Orange Line: 400ms -> 900ms */}
        <motion.div
          className="absolute -bottom-2 md:-bottom-4 left-0 right-0 h-[2px] bg-[#f5a623]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.4, duration: 0.5, ease: "circOut" }}
          style={{ transformOrigin: "center" }}
        />
      </div>
    </motion.div>
  );
}
