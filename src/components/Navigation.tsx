import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  ArrowRight,
  Menu,
  X,
  Sparkles,
  Layers,
  Cpu,
  Feather,
  Github,
  Linkedin,
  MessageCircle,
} from 'lucide-react';
import { NavTab, ThemeMode } from '../types';
import { soundManager } from '../lib/soundEffects';

interface NavigationProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenContact: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  onOpenContact,
  theme,
  onToggleTheme,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [forceExpand, setForceExpand] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [liveTime, setLiveTime] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dual GMT / BST clock
  useEffect(() => {
    const updateTime = () => {
      try {
        const timeStr = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Europe/London',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(new Date());
        setLiveTime(`${timeStr} BST`);
      } catch {
        setLiveTime('12:00:00 UTC');
      }
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 120) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSoundToggle = () => {
    soundManager.playClick();
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleTabClick = (tab: NavTab) => {
    soundManager.playClick();
    onSelectTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isCollapsed = scrolled && !forceExpand;

  const tabsConfig = [
    {
      id: 'work' as NavTab,
      fullLabel: 'Selected Work',
      shortLabel: 'Work',
      desc: 'Architecture & Case Studies',
      icon: Layers,
    },
    {
      id: 'about' as NavTab,
      fullLabel: 'Philosophy',
      shortLabel: 'Philosophy',
      desc: 'Ethos & Engineering Rigor',
      icon: Feather,
    },
    {
      id: 'playground' as NavTab,
      fullLabel: 'Engineering Lab',
      shortLabel: 'Lab',
      desc: 'Interactive 3D & Physics',
      icon: Cpu,
    },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 pointer-events-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
          {/* =========================================================================
              LEFT SECTION:
              - Mobile (< md): Monogram Badge & Live Availability Pulse
              - Tablet (md to lg): Compact Location Pill without long time string
              - Desktop (lg+): Full Telemetry Location & Live Precision Clock
             ========================================================================= */}
          {/* Desktop full clock (>= 1024px) */}
          <div className="hidden lg:flex items-center gap-2.5 text-[11px] font-mono tracking-widest uppercase text-neutral-600 dark:text-neutral-300 backdrop-blur-md bg-white/80 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800 px-3.5 py-2 rounded-full shadow-sm select-none">
            <Globe
              className="w-3.5 h-3.5 text-neutral-800 dark:text-indigo-400 animate-spin"
              style={{ animationDuration: '24s' }}
            />
            <span className="font-semibold text-neutral-900 dark:text-white">LON / SF</span>
            <span className="opacity-30">•</span>
            <span className="text-neutral-500 dark:text-neutral-400">{liveTime}</span>
          </div>

          {/* Tablet compact badge (768px - 1023px) */}
          <div className="hidden md:flex lg:hidden items-center gap-2 text-[11px] font-mono tracking-wider uppercase text-neutral-600 dark:text-neutral-300 backdrop-blur-md bg-white/80 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800 px-3 py-2 rounded-full shadow-sm select-none">
            <Globe
              className="w-3.5 h-3.5 text-neutral-800 dark:text-indigo-400 animate-spin"
              style={{ animationDuration: '24s' }}
            />
            <span className="font-semibold text-neutral-900 dark:text-white">LON / SF</span>
          </div>

          {/* Mobile monogram badge (< 768px) */}
          <button
            onClick={() => handleTabClick('work')}
            className="flex md:hidden items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md bg-white/85 dark:bg-neutral-900/85 border border-neutral-200/80 dark:border-neutral-800 shadow-sm active:scale-95 transition-transform"
            aria-label="Portfolio Home"
          >
            <div className="w-6 h-6 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center text-[10px] font-mono font-bold">
              AI
            </div>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-mono font-medium tracking-tight text-neutral-700 dark:text-neutral-300">
                Online
              </span>
            </div>
          </button>

          {/* =========================================================================
              CENTER SECTION:
              - Visible on Tablet & Desktop (>= md / >= 768px)
              - Single-line whitespace-nowrap tabs preventing awkward line breaks
             ========================================================================= */}
          <div
            onMouseEnter={() => setForceExpand(true)}
            onMouseLeave={() => setForceExpand(false)}
            className="hidden md:block relative"
          >
            <motion.nav
              layout
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="flex items-center gap-1 p-1.5 rounded-full bg-white/85 dark:bg-neutral-900/85 backdrop-blur-md border border-neutral-200/90 dark:border-neutral-800 shadow-lg shadow-neutral-900/5 text-sm font-medium"
            >
              <AnimatePresence mode="wait">
                {isCollapsed ? (
                  /* Collapsed state on scroll */
                  <motion.button
                    key="collapsed"
                    onClick={() => setForceExpand(true)}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-full text-neutral-800 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors whitespace-nowrap"
                    id="nav-status-pill"
                  >
                    <div className="w-5 h-5 rounded-full bg-neutral-900 dark:bg-gradient-to-tr dark:from-indigo-500 dark:to-purple-500 flex items-center justify-center text-[10px] text-white font-bold font-mono">
                      AI
                    </div>
                    <span className="text-xs font-mono font-medium tracking-tight">
                      Available for Work
                    </span>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                  </motion.button>
                ) : (
                  /* Expanded state with responsive single-line labels */
                  <motion.div
                    key="expanded"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-0.5 sm:gap-1"
                  >
                    {/* Monogram Badge */}
                    <div className="pl-1.5 pr-1 hidden lg:flex items-center">
                      <div className="w-6 h-6 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center text-[10px] font-mono font-bold">
                        AI
                      </div>
                    </div>

                    {/* Desktop & Tablet Tabs */}
                    {tabsConfig.map((item) => {
                      const isActive = currentTab === item.id;
                      return (
                        <button
                          key={item.id}
                          data-cursor="interact"
                          data-cursor-text="INTERACT"
                          onClick={() => handleTabClick(item.id)}
                          className={`relative px-3 lg:px-4 py-1.5 rounded-full text-xs lg:text-sm font-medium transition-all duration-200 whitespace-nowrap select-none ${
                            isActive
                              ? 'text-neutral-950 dark:text-white font-semibold'
                              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                          }`}
                          id={`nav-tab-${item.id}`}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="nav-active-pill"
                              className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 rounded-full -z-10 shadow-sm"
                              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                            />
                          )}
                          {/* Full label on desktop, concise on tablet */}
                          <span className="hidden lg:inline">{item.fullLabel}</span>
                          <span className="lg:hidden">{item.shortLabel}</span>
                        </button>
                      );
                    })}

                    {/* Contact Commission CTA */}
                    <button
                      data-cursor="open"
                      data-cursor-text="OPEN"
                      onClick={() => {
                        soundManager.playClick();
                        onOpenContact();
                      }}
                      className="flex items-center gap-1.5 px-3.5 lg:px-4 py-1.5 ml-1 rounded-full text-xs lg:text-sm font-medium bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 transition-all shadow-sm active:scale-95 whitespace-nowrap"
                      id="nav-contact-button"
                    >
                      <span>Inquire</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.nav>
          </div>

          {/* =========================================================================
              RIGHT SECTION:
              - Sound Synthesizer Toggle (min 44px touch target)
              - Theme Toggle (min 44px touch target)
              - Mobile Menu Trigger (< md)
             ========================================================================= */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* GitHub Profile */}
            <a
              href="https://github.com/avisifeakor"
              target="_blank"
              rel="noreferrer"
              data-cursor="open"
              data-cursor-text="GITHUB"
              onClick={() => soundManager.playClick()}
              className="hidden sm:flex w-10 h-10 sm:w-11 sm:h-11 items-center justify-center rounded-full backdrop-blur-md bg-white/80 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white transition-all shadow-sm active:scale-95"
              title="Avis Ifeakor on GitHub"
              aria-label="GitHub Profile"
              id="nav-github-link"
            >
              <Github className="w-4 h-4" />
            </a>

            {/* LinkedIn Profile */}
            <a
              href="https://www.linkedin.com/in/avisifeakor"
              target="_blank"
              rel="noreferrer"
              data-cursor="open"
              data-cursor-text="LINKEDIN"
              onClick={() => soundManager.playClick()}
              className="hidden sm:flex w-10 h-10 sm:w-11 sm:h-11 items-center justify-center rounded-full backdrop-blur-md bg-white/80 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-[#0A66C2] dark:hover:text-[#0A66C2] transition-all shadow-sm active:scale-95"
              title="Avis Ifeakor on LinkedIn"
              aria-label="LinkedIn Profile"
              id="nav-linkedin-link"
            >
              <Linkedin className="w-4 h-4 text-[#0A66C2]" />
            </a>

            {/* WhatsApp Quick Chat */}
            <a
              href="https://wa.me/2348150675245"
              target="_blank"
              rel="noreferrer"
              data-cursor="open"
              data-cursor-text="WHATSAPP"
              onClick={() => soundManager.playClick()}
              className="hidden sm:flex w-10 h-10 sm:w-11 sm:h-11 items-center justify-center rounded-full backdrop-blur-md bg-white/80 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-emerald-500 dark:hover:text-emerald-400 hover:border-emerald-500/40 transition-all shadow-sm active:scale-95"
              title="Chat on WhatsApp (+234 815 067 5245)"
              aria-label="WhatsApp (+234 815 067 5245)"
              id="nav-whatsapp-link"
            >
              <MessageCircle className="w-4 h-4 text-emerald-500" />
            </a>

            {/* Audio Synthesizer Toggle */}
            <button
              data-cursor="sound"
              data-cursor-text="SOUND / RESONATE"
              onClick={handleSoundToggle}
              className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full backdrop-blur-md bg-white/80 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white transition-all shadow-sm active:scale-95"
              title={isMuted ? 'Unmute harmonic synth' : 'Mute harmonic synth'}
              aria-label={isMuted ? 'Unmute audio synth' : 'Mute audio synth'}
              id="nav-sound-toggle"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <div className="flex items-end gap-0.5 h-4">
                  <Volume2 className="w-4 h-4 mr-0.5 text-neutral-800 dark:text-indigo-400" />
                  <span className="w-0.5 h-2 bg-neutral-800 dark:bg-indigo-400 animate-pulse" />
                  <span className="w-0.5 h-3.5 bg-neutral-950 dark:bg-indigo-500 animate-bounce" />
                </div>
              )}
            </button>

            {/* Theme Switcher */}
            <button
              data-cursor="interact"
              data-cursor-text="INTERACT"
              onClick={() => {
                soundManager.playClick();
                onToggleTheme();
              }}
              className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full backdrop-blur-md bg-white/80 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white transition-all shadow-sm active:scale-95"
              title="Toggle theme (Light / Dark)"
              aria-label="Toggle theme"
              id="nav-theme-toggle"
            >
              {theme === 'light' ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4 text-sky-400" />
              )}
            </button>

            {/* Mobile Menu Hamburger Trigger (< md only) */}
            <button
              onClick={() => {
                soundManager.playClick(640);
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-md bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border border-neutral-800 dark:border-neutral-200 shadow-sm active:scale-95 transition-all"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              id="nav-mobile-toggle"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          MOBILE NAVIGATION DRAWER & MODAL OVERLAY (< md)
          Provides effortless touch navigation without any horizontal crowding
         ========================================================================= */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40">
            {/* Backdrop blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Floating Navigation Card */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              className="absolute top-18 left-3 right-3 sm:left-6 sm:right-6 rounded-3xl p-4 sm:p-5 backdrop-blur-2xl bg-white/95 dark:bg-neutral-950/95 border border-neutral-200/90 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col gap-3"
            >
              {/* Header inside drawer */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center text-[10px] font-mono font-bold">
                    AI
                  </div>
                  <span className="font-mono text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    Avis Ifeakor
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-semibold tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>Available Q3/Q4</span>
                </div>
              </div>

              {/* Navigation Items (Touch Target >= 48px) */}
              <div className="flex flex-col gap-1.5">
                {tabsConfig.map((item) => {
                  const isActive = currentTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full min-h-[48px] px-4 py-3 rounded-2xl flex items-center justify-between text-left transition-all ${
                        isActive
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-md font-semibold'
                          : 'bg-neutral-50/80 dark:bg-neutral-900/60 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 ${
                            isActive
                              ? 'text-amber-400 dark:text-indigo-400'
                              : 'text-neutral-500 dark:text-neutral-400'
                          }`}
                        />
                        <div>
                          <div className="text-sm">{item.fullLabel}</div>
                          <div
                            className={`text-[10px] font-mono ${
                              isActive
                                ? 'text-neutral-300 dark:text-neutral-400'
                                : 'text-neutral-500 dark:text-neutral-400'
                            }`}
                          >
                            {item.desc}
                          </div>
                        </div>
                      </div>

                      {isActive && (
                        <div className="w-2 h-2 rounded-full bg-amber-400 dark:bg-indigo-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Commission Inquire Button */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  setMobileMenuOpen(false);
                  onOpenContact();
                }}
                className="w-full min-h-[48px] mt-1 px-4 py-3 rounded-2xl bg-amber-500 dark:bg-white text-neutral-950 hover:bg-amber-400 dark:hover:bg-neutral-100 font-mono text-xs font-bold tracking-wider uppercase flex items-center justify-between shadow-lg shadow-amber-500/20 dark:shadow-white/10 active:scale-[0.98] transition-all"
                id="nav-mobile-contact-button"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Inquire / Commission Project</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Direct GitHub, LinkedIn and WhatsApp Links */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <a
                  href="https://github.com/avisifeakor"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => soundManager.playClick()}
                  className="min-h-[44px] px-2 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/80 flex items-center justify-center gap-1.5 text-xs font-mono font-medium text-neutral-800 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/avisifeakor"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => soundManager.playClick()}
                  className="min-h-[44px] px-2 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/80 flex items-center justify-center gap-1.5 text-xs font-mono font-medium text-neutral-800 dark:text-neutral-200 hover:text-[#0A66C2] dark:hover:text-[#0A66C2] transition-colors"
                >
                  <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
                  <span>LinkedIn</span>
                </a>
                <a
                  href="https://wa.me/2348150675245"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => soundManager.playClick()}
                  className="min-h-[44px] px-2 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 flex items-center justify-center gap-1.5 text-xs font-mono font-medium text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>WhatsApp</span>
                </a>
              </div>

              {/* Live Clock Telemetry Footer inside drawer */}
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-neutral-600 dark:text-neutral-400 animate-spin" style={{ animationDuration: '24s' }} />
                  <span>LON / SF</span>
                </div>
                <span>{liveTime}</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

