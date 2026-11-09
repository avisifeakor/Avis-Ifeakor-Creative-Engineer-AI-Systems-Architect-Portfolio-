import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavTab, ThemeMode, Project } from './types';
import { Navigation } from './components/Navigation';
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { DynamicReactiveCursor } from './components/DynamicReactiveCursor';
import { AnimatedBackgroundSun } from './components/AnimatedBackgroundSun';
import { HeroSection } from './components/HeroSection';
import { ClientMarquee } from './components/ClientMarquee';
import { WorkGrid } from './components/WorkGrid';
import { CaseStudyModal } from './components/CaseStudyModal';
import { AboutView } from './components/AboutView';
import { PlaygroundView } from './components/PlaygroundView';
import { TestimonialsSection } from './components/TestimonialsSection';
import { SignatureFooter } from './components/SignatureFooter';
import { ContactModal } from './components/ContactModal';
import { pageTransitionVariants } from './lib/animationVariants';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('work');
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Sync theme to root class & document background
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.style.backgroundColor = '#070A10';
      document.body.style.color = '#F3F4F6';
    } else {
      root.classList.remove('dark');
      document.body.style.backgroundColor = '#F4EFE6';
      document.body.style.color = '#111827';
    }
  }, [theme]);

  // Ensure body scroll is never blocked when no modal is open
  useEffect(() => {
    if (!selectedProject && !isContactOpen) {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
  }, [selectedProject, isContactOpen]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const scrollToWork = () => {
    const workElem = document.getElementById('work');
    if (workElem) {
      workElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col font-sans transition-colors duration-500 bg-[#F4EFE6] dark:bg-[#070A10] text-neutral-900 dark:text-neutral-100 selection:bg-neutral-900/10 selection:text-neutral-900 dark:selection:bg-indigo-500/30 dark:selection:text-indigo-200">
      {/* Dynamic Reactive Cursor System with Spring-Inertia Dual-Coordinate Motion */}
      <DynamicReactiveCursor isDark={theme === 'dark'} />

      {/* Slim progress bar tracking scroll position at the very top */}
      <ScrollProgressBar isDark={theme === 'dark'} />

      {/* 2D Animated Sun that tracks scroll, moves closer to screen, and triggers solar apogee event at 50% */}
      <AnimatedBackgroundSun isDark={theme === 'dark'} />

      {/* Floating Header Capsule Navigation */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenContact={() => setIsContactOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Tab Views with Framer Motion Route Transitions */}
      <main className="flex-1 w-full relative z-20">
        <AnimatePresence mode="wait">
          {currentTab === 'work' && (
            <motion.div
              key="work-tab"
              variants={pageTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              {/* Hero Section */}
              <HeroSection isDark={theme === 'dark'} onExploreWork={scrollToWork} />

              {/* Monochromatic Client Logos Marquee */}
              <ClientMarquee />

              {/* Featured Case Studies Grid */}
              <WorkGrid onSelectProject={setSelectedProject} />

              {/* Authentic Client & Collaborator Testimonials */}
              <TestimonialsSection />

              {/* Interactive Signature Footer with Wave Horizon */}
              <SignatureFooter onOpenContact={() => setIsContactOpen(true)} />
            </motion.div>
          )}

          {currentTab === 'about' && (
            <motion.div
              key="about-tab"
              variants={pageTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <AboutView />
              <TestimonialsSection />
              <SignatureFooter onOpenContact={() => setIsContactOpen(true)} />
            </motion.div>
          )}

          {currentTab === 'playground' && (
            <motion.div
              key="playground-tab"
              variants={pageTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <PlaygroundView isDark={theme === 'dark'} />
              <SignatureFooter onOpenContact={() => setIsContactOpen(true)} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Interactive Case Study Reader Modal */}
      <CaseStudyModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      {/* Engineering Commission Inquiry Sheet */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </div>
  );
}
