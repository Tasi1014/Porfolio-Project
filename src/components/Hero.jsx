/**
 * Hero.jsx — Full viewport hero section
 * Matches Stitch "Kinetic Noir" design:
 * - Rectangular portrait with orange glow
 * - Large heading with line breaks
 * - Prominent CTA buttons
 * - Floating stat cards around image
 */

import { motion } from "framer-motion";
import { HiDownload, HiArrowRight } from "react-icons/hi";

const containerLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: "easeOut", staggerChildren: 0.15 },
  },
};
const childFade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
const containerRight = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, delay: 0.3, ease: "easeOut" },
  },
};
const statPop = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: 0.8 + i * 0.15, type: "spring", stiffness: 200 },
  }),
};

const stats = [
  { value: "50+", label: "PROJECTS DONE", pos: "-top-4 -right-4 lg:-right-8" },
  { value: "1+", label: "YEARS EXP", pos: "bottom-28 -left-8 lg:-left-14" },
  { value: "100%", label: "HAPPY CLIENTS", pos: "-bottom-4 right-4 lg:right-2" },
];

export default function Hero() {
  const scrollTo = (id) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="min-h-[100dvh] flex items-end lg:items-center pb-12 pt-20 lg:pt-16 lg:pb-8"
    >
      <div className="container-max w-full flex flex-col-reverse lg:flex-row items-center lg:items-end gap-10 lg:gap-12">
        {/* ---- LEFT COLUMN ---- */}
        <motion.div
          className="w-full lg:w-[52%] pb-4"
          variants={containerLeft}
          initial="hidden"
          animate="visible"
        >
          {/* Availability Badge */}
          <motion.div variants={childFade} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-xs font-medium text-text-secondary font-[family-name:var(--font-mono)]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
              </span>
              Available for Freelance
            </span>
          </motion.div>

          {/* Heading — large, Syne, two lines */}
          <motion.h1
            variants={childFade}
            className="font-[family-name:var(--font-heading)] text-[2.75rem] sm:text-[3.5rem] lg:text-[4rem] xl:text-[4.5rem] font-extrabold leading-[1.05] tracking-tight mb-6"
          >
            I Design.{" "}
            <span className="text-accent">I</span>
            <br />
            <span className="text-accent">Edit.</span>{" "}
            I Write.
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={childFade}
            className="text-text-secondary text-sm sm:text-base lg:text-lg max-w-md mb-8 leading-relaxed"
          >
          I design things people actually stop to look at.<br />
          Edit videos that keep you watching till the end.<br />
          Write words that say exactly what needs to be said.<br />
          That's pretty much it.
          </motion.p>

          {/* CTA Buttons — large, prominent */}
          <motion.div variants={childFade} className="flex flex-wrap gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => scrollTo("#projects")}
              className="flex items-center gap-2 px-8 py-4 bg-accent text-bg-primary font-bold rounded-full text-sm cursor-pointer hover:brightness-110 transition-all"
            >
              View My Work <HiArrowRight />
            </motion.button>
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href="/resume.pdf"
              download
              className="flex items-center gap-2 px-8 py-4 border border-text-primary/30 text-text-primary rounded-full text-sm font-semibold hover:bg-text-primary/5 transition-all"
            >
              <HiDownload /> Download CV
            </motion.a>
          </motion.div>
        </motion.div>

        {/* ---- RIGHT COLUMN: Rectangular Portrait ---- */}
        <motion.div
          className="w-full lg:w-[48%] flex justify-center lg:justify-end"
          variants={containerRight}
          initial="hidden"
          animate="visible"
        >
          <div className="relative w-64 sm:w-72 lg:w-80 xl:w-[360px]">
            {/* Orange ambient glow behind image */}
            <div className="absolute -inset-4 bg-gradient-to-br from-accent/20 via-accent/5 to-transparent rounded-2xl blur-2xl" />

            {/* Portrait — rectangular with rounded corners */}
            <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border border-border/50 bg-bg-card">
              <img
                src="/hero-image.png"
                alt="Madhav portrait"
                loading="lazy"
                className="w-full h-full object-cover"
              />
              {/* Bottom gradient overlay for stat card legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/60 via-transparent to-transparent" />
            </div>

            {/* Floating Stat Cards */}
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                variants={statPop}
                initial="hidden"
                animate="visible"
                className={`absolute ${stat.pos} bg-bg-card/95 backdrop-blur-md border border-border rounded-xl px-4 py-3 text-center shadow-lg z-10`}
              >
                <p className="text-accent text-lg font-bold font-[family-name:var(--font-heading)]">
                  {stat.value}
                </p>
                <p className="text-[10px] text-text-secondary tracking-wider font-[family-name:var(--font-mono)] uppercase">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
