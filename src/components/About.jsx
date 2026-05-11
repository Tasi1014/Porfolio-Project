/**
 * About.jsx — About Me section
 * Features: decorative corner-bracket photo frame, bio text,
 * skill category cards with colored left borders
 */

import ReactGA from 'react-ga4';
import { motion } from "framer-motion";
import { HiDownload } from "react-icons/hi";
import { FaPaintBrush, FaVideo, FaPen } from "react-icons/fa";
import TextReveal from "./animations/TextReveal";

import SkillSphere from './SkillSphere'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

import useParallax from "../hooks/useParallax";

export default function About() {
  const { ref: parallaxRef, style: parallaxStyle } = useParallax({ speed: 0.1 });

  return (
    <section id="about" className="section-padding border-t border-border">
      <div className="container-max">
        {/* Section Label */}
        <motion.p
          className="section-label"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          01 / About Me
        </motion.p>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          {/* ---- LEFT: Photo ---- */}
          <motion.div
            className="lg:w-[38%] flex flex-col items-center lg:items-start gap-5"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Corner-bracket frame */}
            <div className="relative w-56 h-64 sm:w-64 sm:h-72">
              {/* Top-left corner */}
              <span className="absolute top-0 left-0 w-7 h-7 border-t-2 border-l-2 border-accent rounded-tl" />
              {/* Top-right corner */}
              <span className="absolute top-0 right-0 w-7 h-7 border-t-2 border-r-2 border-accent rounded-tr" />
              {/* Bottom-left corner */}
              <span className="absolute bottom-0 left-0 w-7 h-7 border-b-2 border-l-2 border-accent rounded-bl" />
              {/* Bottom-right corner */}
              <span className="absolute bottom-0 right-0 w-7 h-7 border-b-2 border-r-2 border-accent rounded-br" />
              {/* Image Container for Parallax */}
              <div ref={parallaxRef} className="w-full h-full p-2.5">
                <div className="w-full h-full overflow-hidden rounded-lg">
                  <motion.img
                    src="/about-image.png"
                    alt="About Madhav"
                    loading="lazy"
                    className="w-full h-full object-cover origin-top"
                    style={{ ...parallaxStyle, scale: 1.2 }}
                  />
                </div>
              </div>
            </div>

            {/* Download CV ghost button */}
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href="/resume.pdf"
              download
              onClick={() => {
                ReactGA.event({
                  category: 'Engagement',
                  action: 'CV Downloaded',
                  label: 'About Section'
                });
              }}
              className="flex items-center gap-2 px-5 py-2.5 border border-border text-text-secondary rounded-full text-sm font-medium hover:border-accent hover:text-accent transition-all"
            >
              <HiDownload /> Download CV
            </motion.a>
          </motion.div>

          {/* ---- RIGHT: Bio + Skills ---- */}
          <motion.div
            className="lg:w-[62%]"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <TextReveal
              text="Turning ideas into visual experiences"
              tag="h2"
              className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl lg:text-4xl font-bold mb-5 leading-tight"
            />

            <p className="text-text-secondary text-sm sm:text-base mb-3 leading-relaxed">
              I'm a multi-disciplinary creative based in Kathmandu, Nepal. With
              over a year of experience, I specialize in graphic design,
              video editing, and content writing — helping brands communicate
              their stories through compelling visuals and words.
            </p>
            <p className="text-text-secondary text-sm sm:text-base mb-8 leading-relaxed">
              Whether it's crafting a brand identity, producing a scroll-stopping
              reel, or writing copy that converts — I bring passion, precision,
              and a deep understanding of digital culture to every project.
            </p>

            {/* Skill Sphere Replacement */}
            <div className="mt-8">
              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '13px',
                fontFamily: 'JetBrains Mono',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                Tools & Skills — Drag to explore
              </p>
              <SkillSphere />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
