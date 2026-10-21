/**
 * App.jsx — Root application component
 * Assembles all sections into a single-page scroll layout.
 * /admin route renders the separate Admin Panel.
 */

import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import ReactGA from 'react-ga4';
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import ScrollProgressBar from "./components/ScrollProgressBar";
import IntroScreen from "./components/IntroScreen";
import AdminRoute from "./pages/admin/AdminRoute";

// ── Portfolio (main public page) ──────────────────────────────────────────────
function Portfolio() {
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem("intro-shown");
  });

  const [introComplete, setIntroComplete] = useState(() => {
    return sessionStorage.getItem("intro-shown") === "true";
  });

  const handleIntroComplete = () => {
    setShowIntro(false);
    setIntroComplete(true);
  };

  // Track page views
  useEffect(() => {
    ReactGA.send({ 
      hitType: 'pageview', 
      page: window.location.pathname 
    })
  }, [])

  // Track section views (Scroll Depth)
  useEffect(() => {
    const sections = [
      { id: 'about', label: 'About Section' },
      { id: 'projects', label: 'Projects Section' },
      { id: 'contact', label: 'Contact Section' }
    ]

    const observers = sections.map(({ id, label }) => {
      const element = document.getElementById(id)
      if (!element) return null

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              ReactGA.event({
                category: 'Scroll Depth',
                action: 'Section Viewed',
                label: label
              })
              observer.unobserve(element)
            }
          })
        },
        { threshold: 0.3 }
      )

      observer.observe(element)
      return observer
    })

    return () => {
      observers.forEach(obs => obs?.disconnect())
    }
  }, [])

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

// ── Root with routing ─────────────────────────────────────────────────────────
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Portfolio />} />
      <Route path="/admin" element={<AdminRoute />} />
      {/* Catch all — redirect to home */}
      <Route path="*" element={<Portfolio />} />
    </Routes>
  );
}
