/**
 * projects.js — All portfolio project data
 * ============================================================
 * Replace thumbnails with your own images in /src/assets/images/
 * Replace TikTok/Instagram URLs with your real content URLs
 * ============================================================
 */

const projects = [
  // ==================== VIDEO PROJECTS ====================

  // --- TikTok Videos (3) ---
  {
    id: 1,
    type: "video",
    category: "Video Editing",
    platform: "tiktok",
    title: "TVS Ntorq",
    brand: "TVS Motors",
    description:
      "This video serves as a digital advertisement for TVS Gyaneshwor, featuring the TVS Ntorq Disc Fi.",
    thumbnail: "/image.png",
    tiktokUrl: "https://www.tiktok.com/embed/v2/7616601414961302791",
    instagramUrl: null,
    tags: ["tvsntorq5", "scooter", "jagadambamotors"],
    tools: ["Premiere Pro", "After Effects"],
  },
  {
    id: 2,
    type: "video",
    category: "Video Editing",
    platform: "tiktok",
    title: "Transform Your Body",
    brand: "FitEdge Gym",
    description:
      "High-energy gym promo featuring quick cuts, beat-synced transitions, and motivational text overlays.",
    thumbnail: "https://placehold.co/640x360/1a1a1a/3b82f6?text=FitEdge+Gym",
    tiktokUrl: "https://www.tiktok.com/embed/v2/7000000000000000002",
    instagramUrl: null,
    tags: ["Motion Graphics", "Brand Video", "Fast Cuts"],
    tools: ["Premiere Pro", "After Effects"],
  },
  {
    id: 3,
    type: "video",
    category: "Video Editing",
    platform: "tiktok",
    title: "Street Style Drop",
    brand: "Urban Threads",
    description:
      "A trendy lookbook-style video with smooth slow-mo shots and urban typography overlays.",
    thumbnail: "https://placehold.co/640x360/1a1a1a/22c55e?text=Urban+Threads",
    tiktokUrl: "https://www.tiktok.com/embed/v2/7000000000000000003",
    instagramUrl: null,
    tags: ["Fashion", "Lookbook", "Typography"],
    tools: ["Premiere Pro", "DaVinci Resolve"],
  },

  // --- Instagram Videos (2) ---
  {
    id: 4,
    type: "video",
    category: "Video Editing",
    platform: "instagram",
    title: "Glow Up Series",
    brand: "LumiSkin",
    description:
      "A satisfying skincare routine reel with soft lighting, ASMR-style audio, and clean graphics.",
    thumbnail: "https://placehold.co/640x360/1a1a1a/e1306c?text=LumiSkin",
    tiktokUrl: null,
    instagramUrl: "https://www.instagram.com/reel/PLACEHOLDER1/",
    tags: ["Beauty", "Reel", "ASMR"],
    tools: ["Premiere Pro", "After Effects"],
  },
  {
    id: 5,
    type: "video",
    category: "Video Editing",
    platform: "instagram",
    title: "Product Launch Teaser",
    brand: "Zeno Tech",
    description:
      "A sleek tech product reveal with 3D text animations, lens flares, and cinematic sound design.",
    thumbnail: "https://placehold.co/640x360/1a1a1a/8b5cf6?text=Zeno+Tech",
    tiktokUrl: null,
    instagramUrl: "https://www.instagram.com/reel/PLACEHOLDER2/",
    tags: ["Tech", "Product Launch", "3D Text"],
    tools: ["After Effects", "Cinema 4D"],
  },

  // ==================== GRAPHIC DESIGN PROJECTS ====================
  {
    id: 6,
    type: "graphic",
    category: "Graphic Design",
    platform: null,
    title: "Brand Identity Kit",
    brand: "NovaBrew Coffee",
    description:
      "Complete brand identity including logo, color palette, typography system, and packaging mockups.",
    thumbnail: "https://placehold.co/800x600/1a1a1a/f5a623?text=NovaBrew+Brand+Kit",
    tiktokUrl: null,
    instagramUrl: null,
    tags: ["Branding", "Logo Design", "Packaging"],
    tools: ["Illustrator", "Photoshop"],
  },
  {
    id: 7,
    type: "graphic",
    category: "Graphic Design",
    platform: null,
    title: "Fitness Campaign Poster",
    brand: "FitEdge Gym",
    description:
      "A bold, typographic poster series for a seasonal fitness campaign with a dark & energetic aesthetic.",
    thumbnail: "https://placehold.co/800x600/1a1a1a/3b82f6?text=FitEdge+Poster",
    tiktokUrl: null,
    instagramUrl: null,
    tags: ["Poster", "Typography", "Campaign"],
    tools: ["Photoshop", "InDesign"],
  },
  {
    id: 8,
    type: "graphic",
    category: "Graphic Design",
    platform: null,
    title: "App UI Concept",
    brand: "Zeno Tech",
    description:
      "A modern mobile app UI concept with glassmorphism elements and a futuristic dark mode interface.",
    thumbnail: "https://placehold.co/800x600/1a1a1a/8b5cf6?text=Zeno+App+UI",
    tiktokUrl: null,
    instagramUrl: null,
    tags: ["UI/UX", "Mobile App", "Dark Mode"],
    tools: ["Figma", "Illustrator"],
  },
  {
    id: 9,
    type: "graphic",
    category: "Graphic Design",
    platform: null,
    title: "Social Media Templates",
    brand: "Aura Studios",
    description:
      "A cohesive set of Instagram post and story templates with a minimalist, editorial feel.",
    thumbnail: "https://placehold.co/800x600/1a1a1a/ec4899?text=Aura+Social+Kit",
    tiktokUrl: null,
    instagramUrl: null,
    tags: ["Social Media", "Templates", "Instagram"],
    tools: ["Figma", "Photoshop"],
  },
  {
    id: 10,
    type: "graphic",
    category: "Graphic Design",
    platform: null,
    title: "Travel Brochure Design",
    brand: "Peak Travels",
    description:
      "A tri-fold brochure design featuring breathtaking Himalayan landscapes with clean layout and bold type.",
    thumbnail: "https://placehold.co/800x600/1a1a1a/06b6d4?text=Peak+Travels",
    tiktokUrl: null,
    instagramUrl: null,
    tags: ["Print", "Brochure", "Layout"],
    tools: ["InDesign", "Photoshop"],
  },
  {
    id: 11,
    type: "graphic",
    category: "Graphic Design",
    platform: null,
    title: "Bakery Packaging Set",
    brand: "Bloom Bakery",
    description:
      "Artisan bakery packaging design with hand-drawn illustrations, warm tones, and a rustic charm.",
    thumbnail: "https://placehold.co/800x600/1a1a1a/f59e0b?text=Bloom+Packaging",
    tiktokUrl: null,
    instagramUrl: null,
    tags: ["Packaging", "Illustration", "Branding"],
    tools: ["Illustrator", "Photoshop"],
  },
];

export default projects;
