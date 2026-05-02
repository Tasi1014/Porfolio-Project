import { useEffect, useRef, useState } from "react";

export default function SpotlightEffect() {
  const containerRef = useRef(null);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Check if it's a touch device
    if (navigator.maxTouchPoints > 0 || window.matchMedia("(hover: none)").matches) {
      setIsTouch(true);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight / 2;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let animationFrameId;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
    };

    const loop = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      container.style.background = `radial-gradient(
        600px circle at ${currentX}px ${currentY}px,
        rgba(245, 166, 35, 0.06),
        transparent 70%
      )`;

      animationFrameId = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", handleMouseMove);
    loop();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (isTouch) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
    />
  );
}
