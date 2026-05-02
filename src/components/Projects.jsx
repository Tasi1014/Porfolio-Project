/**
 * Projects.jsx — Projects section with filter tabs
 * Features: category filter with AnimatePresence transitions,
 * responsive grid, opens VideoModal or ImageLightbox
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import projects from "../data/projects";
import ProjectCard from "./ProjectCard";
import VideoModal from "./VideoModal";
import ImageLightbox from "./ImageLightbox";
import TextReveal from "./animations/TextReveal";

const tabs = ["All", "Graphic Design", "Video Editing", "Content Writing"];

export default function Projects() {
  const [activeTab, setActiveTab] = useState("All");
  const [videoModal, setVideoModal] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Filtered projects
  const filtered = useMemo(() => {
    if (activeTab === "All") return projects;
    return projects.filter((p) => p.category === activeTab);
  }, [activeTab]);

  // All graphic projects (for lightbox navigation)
  const graphicProjects = useMemo(
    () => projects.filter((p) => p.type === "graphic"),
    []
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

        {/* Project Grid */}
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

        {/* Empty state */}
        {filtered.length === 0 && (
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
