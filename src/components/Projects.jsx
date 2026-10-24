/**
 * Projects.jsx — Projects section with filter tabs
 * Features: real-time Firestore data, category filter with AnimatePresence transitions,
 * responsive grid, opens VideoModal or ImageLightbox
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProjects } from "../hooks/useProjects";
import ProjectCard from "./ProjectCard";
import VideoModal from "./VideoModal";
import ImageLightbox from "./ImageLightbox";
import TextReveal from "./animations/TextReveal";

const tabs = ["All", "Graphic Design", "Video Editing"];

export default function Projects() {
  const [activeTab, setActiveTab] = useState("All");
  const [videoModal, setVideoModal] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // ── Real-time Firestore data ────────────────────────────────────────────────
  const { projects, loading } = useProjects();

  // Filtered projects
  const filtered = useMemo(() => {
    if (activeTab === "All") return projects;
    return projects.filter((p) => p.category === activeTab);
  }, [activeTab, projects]);

  // All graphic projects (for lightbox navigation)
  const graphicProjects = useMemo(
    () => projects.filter((p) => p.type === "graphic"),
    [projects]
  );

  // Handle card click
  const handleCardClick = (project) => {
    if (project.type === "video") {
      setVideoModal(project);
    } else {
      const idx = graphicProjects.findIndex((p) => p.id === project.id);
      setLightboxIndex(idx >= 0 ? idx : 0);
    }
  };

  return (
    <section id="projects" className="section-padding border-t border-border">
      <div className="container-max">
        {/* Section Label */}
        <motion.p
          className="section-label"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          02 / Projects
        </motion.p>

        <TextReveal
          text="Selected Works"
          tag="h2"
          className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl lg:text-4xl font-bold mb-8"
        />

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === tab
                  ? "bg-accent text-bg-primary"
                  : "bg-bg-card text-text-secondary border border-border hover:text-text-primary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-bg-card border border-border rounded-xl overflow-hidden animate-pulse"
              >
                <div className="aspect-video bg-bg-elevated" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-bg-elevated rounded w-1/3" />
                  <div className="h-4 bg-bg-elevated rounded w-2/3" />
                  <div className="h-3 bg-bg-elevated rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Project Grid */}
        {!loading && (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((project, i) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={handleCardClick}
                  index={i}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <p className="text-center text-text-secondary py-20 font-[family-name:var(--font-mono)] text-sm">
            No projects in this category yet.
          </p>
        )}
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {videoModal && (
          <VideoModal
            project={videoModal}
            onClose={() => setVideoModal(null)}
          />
        )}
      </AnimatePresence>

      {/* Image Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <ImageLightbox
            graphicProjects={graphicProjects}
            currentIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNavigate={(i) => setLightboxIndex(i)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
