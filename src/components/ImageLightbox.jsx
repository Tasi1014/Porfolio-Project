/**
 * ImageLightbox.jsx — Fullscreen lightbox for graphic projects
 * Features: centered image, left/right navigation, keyboard support,
 * project info below image, smooth fade transitions
 */

import { useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { HiX, HiChevronLeft, HiChevronRight } from "react-icons/hi";

const overlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};
const imgAnim = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

export default function ImageLightbox({
  graphicProjects,
  currentIndex,
  onClose,
  onNavigate,
}) {
  const project = graphicProjects[currentIndex];

  // --- Keyboard navigation ---
  const handleKey = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && currentIndex > 0) onNavigate(currentIndex - 1);
      if (e.key === "ArrowRight" && currentIndex < graphicProjects.length - 1)
        onNavigate(currentIndex + 1);
    },
    [currentIndex, graphicProjects.length, onClose, onNavigate]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  if (!project) return null;

  return (
    <motion.div
      className="fixed inset-0 z-100 flex flex-col items-center justify-center p-4"
      variants={overlay}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/92" />

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-bg-elevated/80 text-text-primary hover:text-accent transition cursor-pointer"
        aria-label="Close lightbox"
      >
        <HiX className="text-xl" />
      </button>

      {/* Navigation Arrows */}
      {currentIndex > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(currentIndex - 1);
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-bg-elevated/60 text-text-primary hover:bg-accent hover:text-bg-primary transition cursor-pointer"
          aria-label="Previous image"
        >
          <HiChevronLeft className="text-2xl" />
        </button>
      )}
      {currentIndex < graphicProjects.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(currentIndex + 1);
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-bg-elevated/60 text-text-primary hover:bg-accent hover:text-bg-primary transition cursor-pointer"
          aria-label="Next image"
        >
          <HiChevronRight className="text-2xl" />
        </button>
      )}

      {/* Image */}
      <motion.div
        key={project.id}
        variants={imgAnim}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-[90vw] max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={project.thumbnail}
          alt={project.title}
          className="max-w-full max-h-[75vh] object-contain rounded-lg"
        />
      </motion.div>

      {/* Project Info */}
      <div
        className="relative z-10 mt-4 text-center max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-text-primary">
          {project.title}
        </h3>
        <p className="text-text-secondary text-sm mb-2">{project.brand}</p>
        <div className="flex flex-wrap justify-center gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-bg-elevated text-text-secondary text-[10px] rounded font-[family-name:var(--font-mono)]"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-text-secondary/40 text-xs mt-3 font-[family-name:var(--font-mono)]">
          {currentIndex + 1} / {graphicProjects.length}
        </p>
      </div>
    </motion.div>
  );
}
