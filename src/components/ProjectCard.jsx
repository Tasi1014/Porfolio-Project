/**
 * ProjectCard.jsx — Individual project card
 * Features: hover overlay with play/zoom icon, platform badge,
 * category pill, project info
 */

import { motion } from "framer-motion";
import { FaTiktok, FaInstagram, FaPlay, FaExpand } from "react-icons/fa";

// Category color map
const categoryColors = {
  "Graphic Design": "#f5a623",
  "Video Editing": "#3b82f6",
  "Content Writing": "#22c55e",
};

export default function ProjectCard({ project, onClick, index }) {
  const isVideo = project.type === "video";
  const catColor = categoryColors[project.category] || "#f5a623";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      onClick={() => onClick(project)}
      className="group cursor-pointer bg-bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(245,166,35,0.12)]"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={project.thumbnail}
          alt={project.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-bg-primary/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          {isVideo ? (
            <span className="w-14 h-14 rounded-full bg-accent/90 flex items-center justify-center text-bg-primary text-xl">
              <FaPlay />
            </span>
          ) : (
            <span className="w-14 h-14 rounded-full bg-text-primary/20 border border-text-primary/30 flex items-center justify-center text-text-primary text-xl">
              <FaExpand />
            </span>
          )}
        </div>

        {/* Platform Badge */}
        {project.platform === "tiktok" && (
          <span className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-tiktok text-white text-[10px] font-bold rounded-md font-[family-name:var(--font-mono)]">
            <FaTiktok className="text-xs" /> TikTok
          </span>
        )}
        {project.platform === "instagram" && (
          <span className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white text-[10px] font-bold rounded-md font-[family-name:var(--font-mono)]">
            <FaInstagram className="text-xs" /> Instagram
          </span>
        )}
      </div>

      {/* Card Info */}
      <div className="p-4">
        {/* Category Pill */}
        <span
          className="inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold mb-2.5 font-[family-name:var(--font-mono)]"
          style={{ backgroundColor: catColor + "18", color: catColor }}
        >
          {project.category}
        </span>

        <h3 className="font-semibold text-text-primary text-sm mb-1 line-clamp-1">
          {project.title}
        </h3>
        <p className="text-text-secondary text-xs mb-1.5">{project.brand}</p>
        <p className="text-text-secondary/70 text-xs line-clamp-2">
          {project.description}
        </p>
      </div>
    </motion.div>
  );
}
