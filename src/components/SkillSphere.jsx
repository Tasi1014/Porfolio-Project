import { useEffect, useRef, useState } from 'react';

const skills = [
  { name: 'Photoshop',    icon: '/photoshop.png' },
  { name: 'Illustrator',  icon: '/illustrator.png' },
  { name: 'Figma',        icon: '/figma.png' },
  { name: 'Premiere',     icon: '/premiere.png' },
  { name: 'After Effects',icon: '/aftereffects.png' },
  { name: 'DaVinci',      icon: '/davinci.png' },
  { name: 'Canva',        icon: '/canva.png' },
];

const DEG2RAD = Math.PI / 180;

export default function SkillSphere() {
  const containerRef = useRef(null);
  const iconRefs = useRef([]);
  const rotationRef = useRef({ x: -15, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);
  const animationCompleteRef = useRef(false);
  const [isMobile, setIsMobile] = useState(false);

  const N = skills.length;
  const radius = isMobile ? 130 : 180;
  const iconSize = isMobile ? 32 : 48;
  const size = radius * 2;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const basePositions = useRef([]);
  useEffect(() => {
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const angleIncrement = Math.PI * 2 * goldenRatio;
    const positions = [];

    for (let i = 0; i < N; i++) {
      const t = i / N;
      const inclination = Math.acos(1 - 2 * t);
      const azimuth = angleIncrement * i;

      const x = Math.sin(inclination) * Math.cos(azimuth);
      const y = Math.sin(inclination) * Math.sin(azimuth);
      const z = Math.cos(inclination);

      positions.push({ x: x * radius, y: y * radius, z: z * radius });
    }
    basePositions.current = positions;
  }, [N, radius]);

  const updateIcons = () => {
    if (!basePositions.current.length || !animationCompleteRef.current) return;

    const rotX = rotationRef.current.x;
    const rotY = rotationRef.current.y;

    const cosX = Math.cos(rotX * DEG2RAD);
    const sinX = Math.sin(rotX * DEG2RAD);
    const cosY = Math.cos(rotY * DEG2RAD);
    const sinY = Math.sin(rotY * DEG2RAD);

    basePositions.current.forEach((pos, i) => {
      const iconEl = iconRefs.current[i];
      if (!iconEl) return;

      const x1 = pos.x * cosY + pos.z * sinY;
      const y1 = pos.y;
      const z1 = -pos.x * sinY + pos.z * cosY;

      const x2 = x1;
      const y2 = y1 * cosX - z1 * sinX;
      const z2 = y1 * sinX + z1 * cosX;

      const depth = z2;
      const depthFactor = (depth + radius) / (radius * 2);

      const opacity = 0.15 + depthFactor * 0.85;
      const scale = 0.55 + depthFactor * 0.55;
      const zIndex = Math.round(depth + radius);

      iconEl.style.transform = `translate3d(${x2}px, ${y2}px, 0px) scale(${scale})`;
      iconEl.style.opacity = opacity;
      iconEl.style.zIndex = zIndex;

      const label = iconEl.querySelector('.skill-label');
      if (label) {
        label.style.opacity = depthFactor > 0.75 ? (depthFactor - 0.75) * 4 : 0;
      }
    });
  };

  const animate = () => {
    if (!isDraggingRef.current && animationCompleteRef.current) {
      velocityRef.current.y += 0.005;
      velocityRef.current.x += 0.0003;
    }

    velocityRef.current.x *= 0.97;
    velocityRef.current.y *= 0.97;

    rotationRef.current.x += velocityRef.current.x;
    rotationRef.current.y += velocityRef.current.y;

    updateIcons();
    rafRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          triggerEntryAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [radius]);

  const triggerEntryAnimation = () => {
    iconRefs.current.forEach((el, i) => {
      if (!el) return;
      
      const startX = (Math.random() - 0.5) * 800;
      const startY = (Math.random() - 0.5) * 800;
      const delay = Math.random() * 800;

      el.style.transition = 'none';
      el.style.transform = `translate3d(${startX}px, ${startY}px, 0px) scale(0.1)`;
      el.style.opacity = '0';

      setTimeout(() => {
        el.style.transition = 'transform 900ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 700ms ease';
        
        const pos = basePositions.current[i];
        const rotX = rotationRef.current.x;
        const rotY = rotationRef.current.y;
        const cosX = Math.cos(rotX * DEG2RAD);
        const sinX = Math.sin(rotX * DEG2RAD);
        const cosY = Math.cos(rotY * DEG2RAD);
        const sinY = Math.sin(rotY * DEG2RAD);

        const x1 = pos.x * cosY + pos.z * sinY;
        const y1 = pos.y;
        const z1 = -pos.x * sinY + pos.z * cosY;
        const x2 = x1;
        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;
        
        const depthFactor = (z2 + radius) / (radius * 2);
        const opacity = 0.15 + depthFactor * 0.85;
        const scale = 0.55 + depthFactor * 0.55;

        el.style.transform = `translate3d(${x2}px, ${y2}px, 0px) scale(${scale})`;
        el.style.opacity = opacity;
      }, delay);
    });

    setTimeout(() => {
      animationCompleteRef.current = true;
      iconRefs.current.forEach(el => { if (el) el.style.transition = 'none'; });
      rafRef.current = requestAnimationFrame(animate);
    }, 1700);
  };

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const handleStart = (clientX, clientY) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: clientX, y: clientY };
  };

  const handleMove = (clientX, clientY, e) => {
    if (!isDraggingRef.current) return;
    if (e.cancelable) e.preventDefault();
    
    const deltaX = clientX - lastMousePosRef.current.x;
    const deltaY = clientY - lastMousePosRef.current.y;
    
    velocityRef.current.y += deltaX * 0.05;
    velocityRef.current.x -= deltaY * 0.05;
    
    lastMousePosRef.current = { x: clientX, y: clientY };
  };

  const handleEnd = () => { isDraggingRef.current = false; };

  return (
    <div 
      ref={containerRef}
      className="skill-sphere-container"
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        margin: '0 auto',
        cursor: isDraggingRef.current ? 'grabbing' : 'grab',
        touchAction: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY, e)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY, e)}
      onTouchEnd={handleEnd}
    >
      <style>{`
        .skill-icon-wrapper {
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .skill-sphere-item:hover .skill-icon-wrapper {
          transform: scale(1.3);
        }
        .skill-sphere-item:hover .skill-label {
          transform: scale(1.1) translateY(4px);
        }
        .skill-badge {
          display: inline-block;
          background: #f5a623;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          margin-right: 6px;
          box-shadow: 0 0 10px #f5a623, 0 0 20px rgba(245, 166, 35, 0.5);
        }
      `}</style>

      {/* SVG Mesh Overlay */}
      <svg
        width={size}
        height={size}
        style={{ position: 'absolute', pointerEvents: 'none', zIndex: 0, overflow: 'visible' }}
      >
        <defs>
          <radialGradient id="sphereGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="rgba(245, 166, 35, 0.05)" />
            <stop offset="100%" stopColor="rgba(245, 166, 35, 0)" />
          </radialGradient>
          <filter id="orangeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Sphere Glow & Background */}
        <circle 
          cx={radius} cy={radius} r={radius} 
          fill="url(#sphereGradient)" 
          stroke="rgba(245, 166, 35, 0.25)" 
          strokeWidth="1.5"
          filter="url(#orangeGlow)"
        />

        {/* Latitude lines - Brighter and with glow */}
        {[0.15, 0.35, 0.5, 0.65, 0.85].map((v, i) => {
          const r = Math.sin(Math.acos(1 - 2 * v)) * radius;
          const y = radius - Math.cos(Math.acos(1 - 2 * v)) * radius;
          return (
            <ellipse
              key={`lat-${i}`} cx={radius} cy={y} rx={r} ry={r * 0.15}
              fill="none" stroke="rgba(245, 166, 35, 0.15)" strokeWidth="0.8"
            />
          );
        })}

        {/* Longitude lines - Brighter */}
        {[0, 30, 60, 90, 120, 150].map((angle) => (
          <ellipse
            key={`long-${angle}`} cx={radius} cy={radius} rx={radius * 0.2} ry={radius}
            fill="none" stroke="rgba(245, 166, 35, 0.12)" strokeWidth="0.8"
            transform={`rotate(${angle}, ${radius}, ${radius})`}
          />
        ))}
      </svg>

      {/* Icons */}
      {skills.map((skill, i) => (
        <div
          key={skill.name}
          ref={(el) => (iconRefs.current[i] = el)}
          className="skill-sphere-item"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: `-${iconSize / 2}px`,
            marginLeft: `-${iconSize / 2}px`,
            width: `${iconSize}px`,
            height: `${iconSize}px`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
            willChange: 'transform, opacity',
            opacity: 0,
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
        >
          <div className="skill-icon-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img
              src={skill.icon}
              alt={skill.name}
              width={isMobile ? 32 : 40}
              height={isMobile ? 32 : 40}
              onDragStart={(e) => e.preventDefault()}
              style={{
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 12px rgba(245,166,35,0.4))',
                userSelect: 'none',
                WebkitUserDrag: 'none'
              }}
              draggable="false"
            />
            <div 
              className="skill-label"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '9px',
                color: 'var(--text-primary)',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                marginTop: '10px',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                transition: 'transform 0.3s ease, opacity 0.3s ease',
                textShadow: '0 0 8px rgba(0,0,0,0.8)'
              }}
            >
              <span className="skill-badge"></span>
              {skill.name}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
