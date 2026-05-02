import { motion } from "framer-motion";

export default function TextReveal({ text, tag = "p", delay = 0, className = "" }) {
  if (!text) return null;
  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.08, 
        delayChildren: delay 
      },
    },
  };

  const child = {
    visible: {
      y: "0%",
      opacity: 1,
      rotate: 0,
      transition: {
        duration: 0.65,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    hidden: {
      y: "110%",
      opacity: 0,
      rotate: 8,
    },
  };

  const Tag = motion[tag] || motion.p;

  return (
    <Tag
      className={className}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      {words.map((word, index) => (
        <span
          key={index}
          className="inline-block overflow-hidden align-bottom"
          style={{ marginRight: "0.25em" }} // Space between words
        >
          <motion.span className="inline-block origin-bottom-left" variants={child}>
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
