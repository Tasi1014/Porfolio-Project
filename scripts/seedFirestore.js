/**
 * seedFirestore.js
 * Run this ONCE to migrate existing projects.js data into Firestore.
 * Usage: node seedFirestore.js  (from project root)
 *
 * Requires: npm install firebase dotenv (already installed)
 * Uses .env file for Firebase config.
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, writeBatch, doc } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ── Existing projects data (stripped of old url fields) ──────────────────────
const projects = [
  {
    order: 1,
    type: "video",
    category: "Video Editing",
    title: "Instagram Reel Edit",
    brand: "ktmevents.aus",
    description: "A Tour Promotion Instagram reel of Sushant KC.",
    thumbnail: "/SushantKC.png",
    videoUrl: null,
    tags: ["Reel", "Video Edit", "Transitions"],
    tools: ["Premiere Pro"],
  },
  {
    order: 2,
    type: "video",
    category: "Video Editing",
    title: "Logistic Company",
    brand: "Nakshatra Logistics",
    description: "A brand promotion video for Nakshatra Logistics.",
    thumbnail: "/NakshatraLogistics.png",
    videoUrl: null,
    tags: ["nakshatralogistics", "logistic"],
    tools: ["Premiere Pro"],
  },
  {
    order: 3,
    type: "video",
    category: "Video Editing",
    title: "Special Tattoo Offer",
    brand: "Chitwan Tattoo",
    description:
      "A promotional video for Chitwan Tattoo Ink showcasing their latest tattoo offers and artistic process.",
    thumbnail: "/Tatoo.png",
    videoUrl: null,
    tags: ["Tattoo", "Promo", "ChitwanTattooInk"],
    tools: ["Premiere Pro", "CapCut"],
  },
  {
    order: 4,
    type: "video",
    category: "Video Editing",
    title: "Brand promotion",
    brand: "Billin.space",
    description: "A brand promotion video for Billing Software.",
    thumbnail: "/billin_space.png",
    videoUrl: null,
    tags: ["Software", "Billing"],
    tools: ["Premiere Pro"],
  },
  {
    order: 5,
    type: "video",
    category: "Video Editing",
    title: "Brand promotion",
    brand: "Billin.space",
    description: "A brand promotion video for Billing Software.",
    thumbnail: "/billin.png",
    videoUrl: null,
    tags: ["Software", "Billing"],
    tools: ["Premiere Pro"],
  },
  {
    order: 6,
    type: "video",
    category: "Video Editing",
    title: "Brand promotion",
    brand: "Elite_damak",
    description: "A brand promotion video for accessories shop located in damak.",
    thumbnail: "/elite-damak.png",
    videoUrl: null,
    tags: ["accessories", "watches", "sunglasses"],
    tools: ["Premiere Pro"],
  },
  {
    order: 7,
    type: "video",
    category: "Video Editing",
    title: "TVS Ntorq",
    brand: "TVS Motors",
    description:
      "This video serves as a digital advertisement for TVS Gyaneshwor, featuring the TVS Ntorq Disc Fi.",
    thumbnail: "/image.png",
    videoUrl: null,
    tags: ["tvsntorq5", "scooter", "jagadambamotors"],
    tools: ["Premiere Pro", "After Effects"],
  },
  {
    order: 8,
    type: "video",
    category: "Video Editing",
    title: "Instagram Reel Edit",
    brand: "EasyMyLearning",
    description:
      "A dynamic Instagram Reel created by my friend, featuring smooth transitions and engaging pacing.",
    thumbnail: "/easylearn.png",
    videoUrl: null,
    tags: ["Reel", "Video Edit", "Transitions"],
    tools: ["Premiere Pro"],
  },
  {
    order: 9,
    type: "graphic",
    category: "Graphic Design",
    title: "Success Story",
    brand: "Sushi Training Nepal",
    description:
      "This thumbnail features a Success Story interview highlighting a 20-year-old who secured a job in Dubai.",
    thumbnail: "/thumbnail1.jpg",
    videoUrl: null,
    tags: ["Thumbnail Design"],
    tools: ["Illustrator", "Photoshop"],
  },
  {
    order: 10,
    type: "graphic",
    category: "Graphic Design",
    title: "Reaction Video",
    brand: "Bijay Gaming Yt",
    description:
      "A high-energy compilation thumbnail featuring a gamer reacting to funny moments and highlights.",
    thumbnail: "/thumbnail2.jpg",
    videoUrl: null,
    tags: ["Thumbnail Design", "Reaction Video"],
    tools: ["Photoshop", "InDesign"],
  },
  {
    order: 11,
    type: "graphic",
    category: "Graphic Design",
    title: "Sushi Making",
    brand: "Sushi Training Nepal",
    description:
      "This thumbnail shows a culinary team behind a large sushi spread with the bold text FINAL DAY.",
    thumbnail: "/thumbnail3.jpg",
    videoUrl: null,
    tags: ["Thumbnail Design", "Culinary"],
    tools: ["Illustrator"],
  },
  {
    order: 12,
    type: "graphic",
    category: "Graphic Design",
    title: "Gaming Video",
    brand: "Mahishah Gaming Yt",
    description:
      "A vibrant PUBG Mobile livestream thumbnail showcasing the NEW UPDATE 3.6 with fantasy-themed character wings.",
    thumbnail: "/thumbnail4.jpg",
    videoUrl: null,
    tags: ["Thumbnail Design"],
    tools: ["Photoshop"],
  },
  {
    order: 13,
    type: "graphic",
    category: "Graphic Design",
    title: "PUBG Live",
    brand: "Mahishah Gaming Yt",
    description:
      "A striking PUBG livestream thumbnail featuring a VENOM UPDATE with a dramatic split-face effect.",
    thumbnail: "/thumbnail5.jpg",
    videoUrl: null,
    tags: ["PUBG", "LIVE"],
    tools: ["Photoshop"],
  },
  {
    order: 14,
    type: "graphic",
    category: "Graphic Design",
    title: "Reaction Video on Jholay Gang",
    brand: "Bijay Gaming Yt",
    description:
      "This reaction-style thumbnail uses humor and satire to comment on political protests.",
    thumbnail: "/thumbnail6.jpg",
    videoUrl: null,
    tags: ["Packaging", "Illustration", "Branding"],
    tools: ["Illustrator", "Photoshop"],
  },
  {
    order: 15,
    type: "graphic",
    category: "Graphic Design",
    title: "Reaction Video",
    brand: "Bijay Gaming Yt",
    description:
      "This comedy-themed thumbnail highlights Mahabir Pun with a Thug Life motif.",
    thumbnail: "/thumbnail7.jpg",
    videoUrl: null,
    tags: ["Packaging", "Illustration", "Branding"],
    tools: ["Illustrator", "Photoshop"],
  },
  {
    order: 16,
    type: "graphic",
    category: "Graphic Design",
    title: "LaMio's Pizza Offer Pamphlet",
    brand: "LaMio's Pizza",
    description:
      "A vibrant, high-conversion promotional poster designed for a restaurant's FIFA World Cup combo special.",
    thumbnail: "/Pizza_shop.jpeg",
    videoUrl: null,
    tags: ["Packaging", "Illustration", "Branding"],
    tools: ["Illustrator", "Photoshop"],
  },
];

async function seed() {
  console.log(`🌱 Seeding ${projects.length} projects to Firestore...`);

  // Batch writes for efficiency (max 500 per batch)
  const batch = writeBatch(db);
  const colRef = collection(db, "projects");

  projects.forEach((project) => {
    const docRef = doc(colRef); // auto-generate ID
    batch.set(docRef, {
      ...project,
      createdAt: new Date().toISOString(),
    });
  });

  await batch.commit();
  console.log("✅ Done! All projects seeded to Firestore.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
