import { motion, useScroll, useSpring, useTransform } from "framer-motion";

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  
  // Smooth spring physics for the scroll bar filling
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001
  });

  // Calculate the X position of the dot (from 0% to 100% of viewport width)
  const dotX = useTransform(scaleX, [0, 1], ["0vw", "100vw"]);

  return (
    <>
      {/* Filled bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-accent z-[9999]"
        style={{ scaleX, transformOrigin: "0%" }}
      />
      
      {/* Glowing dot moving along the edge */}
      <motion.div
        className="fixed top-0 h-[3px] w-[6px] rounded-full bg-accent z-[9999]"
        style={{ 
          x: dotX,
          // Shift left by 3px so the center of the dot aligns with the edge
          translateX: "-3px",
          boxShadow: "0 0 10px 2px rgba(245, 166, 35, 0.8), 0 0 4px 1px rgba(245, 166, 35, 1)"
        }}
      />
    </>
  );
}
