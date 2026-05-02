import { motion } from "framer-motion";
import { HiX } from "react-icons/hi";
import { FaInstagram, FaExternalLinkAlt } from "react-icons/fa";

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};
const modal = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", damping: 25 } },
};

export default function VideoModal({ project, onClose }) {
  if (!project) return null;
  const isTikTok = project.platform === "tiktok";

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      variants={backdrop}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/85" />

      {/* Modal Content */}
      <motion.div
        variants={modal}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 bg-bg-card border border-border rounded-2xl overflow-hidden max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-bg-elevated/80 text-text-primary hover:text-accent transition cursor-pointer"
          aria-label="Close modal"
        >
          <HiX className="text-lg" />
        </button>

        {isTikTok ? (
          /* ---- TikTok: iframe embed ---- */
          <div>
            <div className="relative w-full h-[500px] sm:h-[650px] bg-bg-primary">
              <iframe
                src={project.tiktokUrl}
                title={project.title}
                className="w-full h-full"
                allowFullScreen
                allow="encrypted-media"
              />
            </div>
          </div>
        ) : (
          <div className="relative">
            <img
              src={project.thumbnail}
              alt={project.title}
              className="w-full aspect-video object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <span className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
                <FaInstagram className="text-white text-2xl" />
              </span>
            </div>
          </div>
        )}

        {/* Project Details */}
        <div className="p-6">
          <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold mb-1">
            {project.title}
          </h3>
          <p className="text-text-secondary text-sm mb-3">{project.brand}</p>
          <p className="text-text-secondary/80 text-sm mb-4 leading-relaxed">
            {project.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 bg-bg-elevated text-text-secondary text-[10px] rounded font-[family-name:var(--font-mono)]"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Tools */}
          <p className="text-xs text-text-secondary mb-5">
            <span className="text-text-secondary/50">Tools: </span>
            {project.tools.join(", ")}
          </p>

          {/* Instagram CTA */}
          {!isTikTok && project.instagramUrl && (
            <div>
              <a
                href={project.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white font-semibold rounded-xl text-sm hover:brightness-110 transition"
              >
                Watch on Instagram <FaExternalLinkAlt className="text-xs" />
              </a>
              <p className="text-center text-text-secondary/50 text-[10px] mt-2 font-[family-name:var(--font-mono)]">
                Opens in Instagram
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
