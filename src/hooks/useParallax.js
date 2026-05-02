import { useState, useEffect, useRef } from "react";
import { useScroll, useTransform, useSpring } from "framer-motion";

export default function useParallax({ speed = 0.15 }) {
  const ref = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const activeSpeed = isMobile ? 0 : speed;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const yTransform = useTransform(
    scrollYProgress,
    [0, 1],
    activeSpeed >= 0
      ? ["0%", `${activeSpeed * 100}%`]
      : [`${activeSpeed * 100}%`, "0%"]
  );

  const y = useSpring(yTransform, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return { ref, style: { y } };
}
