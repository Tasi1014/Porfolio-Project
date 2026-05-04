/**
 * App.jsx — Root application component
 * Assembles all sections into a single-page scroll layout
 */

import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import ScrollProgressBar from "./components/ScrollProgressBar";
import IntroScreen from "./components/IntroScreen";

export default function App() {
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem("intro-shown");
  });

  const [introComplete, setIntroComplete] = useState(() => {
    // If intro won't show, animations should work immediately
    return sessionStorage.getItem("intro-shown") === "true";
  });

  const handleIntroComplete = () => {
    setShowIntro(false);
    setIntroComplete(true);
  };

  return (
    <>
      {showIntro && <IntroScreen onComplete={handleIntroComplete} />}
      <ScrollProgressBar />
      
      <Navbar />
      <main>
        <Hero introComplete={introComplete} />

        <About />
        <Projects />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
