/**
 * App.jsx — Root application component
 * Assembles all sections into a single-page scroll layout
 */

import { useState, useEffect } from "react";
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
              // Stop observing after first view
              observer.unobserve(element)
            }
          })
        },
        { threshold: 0.3 }   // fires when 30% of section is visible
      )

      observer.observe(element)
      return observer
    })

    // Cleanup
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
