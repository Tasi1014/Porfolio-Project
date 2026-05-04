/**
 * Hero.jsx — Full viewport hero section
 * Matches Stitch "Kinetic Noir" design:
 * - Rectangular portrait with orange glow
 * - Large heading with line breaks
 * - Prominent CTA buttons
 * - Floating stat cards around image
 */

import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { HiDownload, HiArrowRight } from "react-icons/hi";
import CountUp from "./animations/CountUp";
import SplitText from "./animations/SplitText";
import SpotlightEffect from "./animations/SpotlightEffect";

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

import useParallax from "../hooks/useParallax";

const stats = [
  { value: 50, suffix: "+", label: "PROJECTS DONE", pos: "-top-4 -right-4 lg:-right-8" },
  { value: 1, suffix: "+", label: "YEARS EXP", pos: "bottom-28 -left-8 lg:-left-14" },
  { value: 100, suffix: "%", label: "HAPPY CLIENTS", pos: "-bottom-4 -right-6 lg:-right-12" },
];

export default function Hero({ introComplete }) {
  const { ref: parallaxRef, style: parallaxStyle } = useParallax({ speed: 0.12 });
  const heroControls = useAnimation();

  useEffect(() => {
    if (introComplete) {
      const timer = setTimeout(() => {
        heroControls.start("visible");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [introComplete, heroControls]);

  const scrollTo = (id) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };


  return (
    <section
      id="home"
      className="relative min-h-[100dvh] flex items-end lg:items-center pb-12 pt-20 lg:pt-16 lg:pb-8"
    >
      <SpotlightEffect />
      <div className="container-max w-full flex flex-col-reverse lg:flex-row items-center lg:items-end gap-10 lg:gap-12">
        {/* ---- LEFT COLUMN ---- */}
        <motion.div
          className="w-full lg:w-[52%] flex flex-col items-center text-center lg:items-start lg:text-left z-10"
          variants={containerLeft}
          initial="hidden"
          animate={heroControls}
        >
          {/* Top accent badge */}
          <motion.div
            variants={childFade}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-elevated border border-border mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest text-text-secondary font-[family-name:var(--font-mono)]">
              Available for Freelance
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={childFade}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold leading-[1.05] tracking-tight mb-6 font-[family-name:var(--font-heading)]"
          >
            <SplitText text="I Design." color="white" delay={0} /><br />
            <SplitText text="I Edit." color="accent" delay={0.3} /><br />
            <SplitText text="I Write." color="white" delay={0.6} />
          </motion.h1>

          {/* Bio paragraph */}
          <motion.p
            variants={childFade}
            className="text-text-secondary md:text-lg max-w-md lg:max-w-xl mb-8 leading-relaxed font-light"
          >
            I am a multidisciplinary creative based in Kathmandu. I craft compelling visual stories,
            engaging video content, and copy that connects.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={childFade}
            className="flex flex-wrap items-center justify-center lg:justify-start gap-4"
          >
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href="#projects"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("#projects");
              }}
              className="flex items-center gap-2 px-8 py-4 bg-accent text-bg-primary rounded-full text-sm font-semibold hover:brightness-110 transition-colors"
            >
              See My Work <HiArrowRight />
            </motion.a>
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
          animate={heroControls}
        >
          <div className="relative w-64 sm:w-72 lg:w-80 xl:w-[360px]">
            {/* Orange ambient glow behind image */}
            <div className="absolute -inset-4 bg-gradient-to-br from-accent/20 via-accent/5 to-transparent rounded-2xl blur-2xl" />

            {/* Portrait — rectangular with rounded corners */}
            <div ref={parallaxRef} className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border border-border/50 bg-bg-card">
              <motion.img
                src="/hero-image.png"
                alt="Madhav portrait"
                loading="lazy"
                className="w-full h-full object-cover origin-top"
                style={{ ...parallaxStyle, scale: 1.2 }}
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
                animate={heroControls}
                className={`absolute ${stat.pos} bg-bg-card/95 backdrop-blur-md border border-border rounded-xl px-4 py-3 text-center shadow-lg z-10`}
              >
                <p className="text-accent text-lg font-bold font-[family-name:var(--font-heading)]">
                  <CountUp end={stat.value} suffix={stat.suffix} />
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
