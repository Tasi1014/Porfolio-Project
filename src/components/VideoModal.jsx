/**
 * VideoModal.jsx — Responsive Video Player Modal
 * Supports Google Drive preview embeds (iframe) and fallback direct video playback.
 * Fully responsive, keyboard-accessible, dark-themed UI matching existing design.
 */

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { HiX } from "react-icons/hi";
import { FaPlay } from "react-icons/fa";
import { extractDriveFileId, getDrivePreviewUrl } from "../services/projectService";

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};
const modal = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", damping: 26, stiffness: 300 },
  },
};

export default function VideoModal({ project, onClose }) {
  const videoRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Pause HTML5 video if running
  useEffect(() => {
    return () => {
      if (videoRef.current) videoRef.current.pause();
    };
  }, []);

  if (!project) return null;

  // Resolve Drive File ID or Video URL
  const driveFileId =
    project.driveFileId ||
    extractDriveFileId(project.driveUrl) ||
    extractDriveFileId(project.videoUrl);

  const hasVideo = Boolean(driveFileId || project.videoUrl);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
      variants={backdrop}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

      {/* Modal */}
      <motion.div
        variants={modal}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 bg-bg-card border border-border rounded-2xl overflow-hidden w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-black/60 text-white hover:text-accent hover:bg-black/90 transition cursor-pointer border border-white/10"
          aria-label="Close video"
        >
          <HiX className="text-lg" />
        </button>

        {/* ── Video Player (Google Drive Iframe or Native Video) ─────────── */}
        {driveFileId ? (
          <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden flex-shrink-0">
            <iframe
              src={getDrivePreviewUrl(driveFileId)}
              title={project.title}
              className="border-none rounded-xl w-full h-full aspect-video"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        ) : hasVideo ? (
          <div className="relative w-full bg-black flex-shrink-0">
            <video
              ref={videoRef}
              src={project.videoUrl}
              poster={project.thumbnail}
              controls
              autoPlay
              playsInline
              className="w-full max-h-[50vh] sm:max-h-[55vh] object-contain"
              style={{ background: "#000" }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        ) : (
          /* ── No video yet: show thumbnail placeholder ─────────────── */
          <div className="relative w-full aspect-video bg-black flex-shrink-0">
            <img
              src={project.thumbnail}
              alt={project.title}
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <span className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <FaPlay className="text-white/60 text-2xl ml-1" />
              </span>
              <p className="text-white/50 text-xs font-[family-name:var(--font-mono)] text-center px-4">
                Google Drive video link not added yet.
                <br />
                Add link from the admin panel.
              </p>
            </div>
          </div>
        )}

        {/* ── Project Info ─────────────────────────────────────────────── */}
        <div className="p-5 overflow-y-auto flex-1">
          <h3 className="font-[family-name:var(--font-heading)] text-lg sm:text-xl font-bold mb-1 text-text-primary">
            {project.title}
          </h3>
          <p className="text-text-secondary text-sm mb-3">{project.brand}</p>
          <p className="text-text-secondary/80 text-sm mb-4 leading-relaxed">
            {project.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {(project.tags || []).map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 bg-bg-elevated text-text-secondary text-[10px] rounded font-[family-name:var(--font-mono)]"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Tools */}
          <p className="text-xs text-text-secondary">
            <span className="text-text-secondary/50">Tools: </span>
            {(project.tools || []).join(", ")}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
