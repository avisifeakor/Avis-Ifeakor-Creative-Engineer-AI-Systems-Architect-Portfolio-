import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'motion/react';
import {
  ArrowUpRight,
  Sliders,
  Volume2,
  Compass,
  Crosshair,
  MoveHorizontal,
  BookOpen,
} from 'lucide-react';

export type CursorMode =
  | 'default'
  | '3d-orbit'
  | 'explore'
  | 'open'
  | 'interact'
  | 'tension'
  | 'sound'
  | 'read';

interface DynamicReactiveCursorProps {
  isDark?: boolean;
}

export const DynamicReactiveCursor: React.FC<DynamicReactiveCursorProps> = ({ isDark = false }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isDown, setIsDown] = useState(false);
  const [mode, setMode] = useState<CursorMode>('default');
  const [customLabel, setCustomLabel] = useState<string | null>(null);

  // Instantaneous real cursor coordinates (Dual-Coordinate Tracking Center)
  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);

  // Smooth lerped spring-inertia coordinates (Outer Aura Follower)
  const auraSpringConfig = { damping: 28, stiffness: 280, mass: 0.45 };
  const auraX = useSpring(rawX, auraSpringConfig);
  const auraY = useSpring(rawY, auraSpringConfig);

  // Check for fine pointer (desktop mouse/trackpad) vs coarse (mobile/touch)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(pointer: fine)');
    const updateFinePointer = () => {
      setIsEnabled(mediaQuery.matches);
      if (mediaQuery.matches) {
        document.documentElement.classList.add('has-custom-cursor');
      } else {
        document.documentElement.classList.remove('has-custom-cursor');
      }
    };

    updateFinePointer();
    mediaQuery.addEventListener('change', updateFinePointer);

    return () => {
      mediaQuery.removeEventListener('change', updateFinePointer);
      document.documentElement.classList.remove('has-custom-cursor');
    };
  }, []);

  // Event handlers for pointer tracking and context-sensitive morphing
  useEffect(() => {
    if (!isEnabled) return;

    const handlePointerMove = (e: PointerEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);

      if (!isVisible) {
        setIsVisible(true);
      }

      // Context detection: Inspect the element hierarchy beneath the cursor
      const target = e.target as HTMLElement | null;
      if (!target) {
        setMode('default');
        setCustomLabel(null);
        return;
      }

      // 1. Check for explicit data-cursor declaration
      const cursorContainer = target.closest('[data-cursor]') as HTMLElement | null;
      if (cursorContainer) {
        const declaredMode = cursorContainer.getAttribute('data-cursor') as CursorMode;
        const declaredLabel = cursorContainer.getAttribute('data-cursor-text');
        if (declaredMode) {
          setMode(declaredMode);
          setCustomLabel(declaredLabel || null);
          return;
        }
      }

      // 2. Check if hovering native text inputs - hide custom cursor so native text caret is unobstructed
      if (target.closest('input[type="text"], input[type="email"], textarea')) {
        setIsVisible(false);
        return;
      } else if (!isVisible) {
        setIsVisible(true);
      }

      // 3. Fallback Context Detection
      // A: 3D Canvases & Interactive WebGL
      if (target.closest('canvas, [data-canvas-3d], #hero-3d-canvas, .canvas-3d')) {
        setMode('3d-orbit');
        setCustomLabel('3D ORBIT');
        return;
      }

      // B: Spring Physics, Range Sliders & Draggable elements
      if (
        target.closest(
          'input[type="range"], [data-draggable], .spring-physics, .cursor-grab, .cursor-grabbing'
        )
      ) {
        setMode('tension');
        setCustomLabel(null);
        return;
      }

      // C: Sound Engine, Synthesizers, Waveform & Mute Controls
      if (
        target.closest(
          '[data-sound], #hero-play-button, #nav-sound-toggle, .sound-pad, #footer-sound-toggle, .audio-spectrum'
        )
      ) {
        setMode('sound');
        setCustomLabel(null);
        return;
      }

      // D: Headings & Blockquotes (Read Beam)
      if (target.closest('h1, h2, blockquote, [data-readable], .read-manifesto')) {
        setMode('read');
        setCustomLabel(null);
        return;
      }

      // E: Project Cards & Case Study Triggers
      if (target.closest('.project-card, [data-project-card], .case-study-card')) {
        setMode('explore');
        setCustomLabel('EXPLORE');
        return;
      }

      // F: Interactive Buttons, Navigation Pills, Links & Actions
      const interactiveEl = target.closest(
        'button, a, [role="button"], summary, [data-interactive]'
      ) as HTMLElement | null;
      if (interactiveEl) {
        const text = (interactiveEl.innerText || interactiveEl.getAttribute('aria-label') || '')
          .trim()
          .toLowerCase();

        if (text.includes('explore') || text.includes('case study') || text.includes('project')) {
          setMode('explore');
          setCustomLabel('EXPLORE');
        } else if (
          text.includes('open') ||
          text.includes('inspect') ||
          text.includes('inquire') ||
          text.includes('read')
        ) {
          setMode('open');
          setCustomLabel('OPEN');
        } else {
          setMode('interact');
          setCustomLabel('INTERACT');
        }
        return;
      }

      // G: Default Canvas
      setMode('default');
      setCustomLabel(null);
    };

    const handlePointerDown = () => setIsDown(true);
    const handlePointerUp = () => setIsDown(false);

    const handlePointerLeave = () => {
      setIsVisible(false);
      setIsDown(false);
    };

    const handleWindowBlur = () => {
      setIsVisible(false);
      setIsDown(false);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('mouseleave', handlePointerLeave);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mouseleave', handlePointerLeave);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isEnabled, isVisible, rawX, rawY]);

  if (!isEnabled) return null;

  const isButtonMode = mode === 'explore' || mode === 'open' || mode === 'interact';
  const displayLabel = customLabel || (mode === 'explore' ? 'EXPLORE' : mode === 'open' ? 'OPEN' : 'INTERACT');

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden select-none"
      aria-hidden="true"
      id="dynamic-reactive-cursor"
    >
      {/* 1. INSTANTANEOUS CENTER-POINT (Dual-Coordinate Tracking Core) */}
      <motion.div
        className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center will-change-transform pointer-events-none"
        style={{
          x: rawX,
          y: rawY,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ opacity: { duration: 0.15 } }}
      >
        {mode === 'read' ? (
          // SLEEK VERTICAL TYPOGRAPHIC BEAM
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 32, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`w-[2.5px] rounded-full ${
              isDark
                ? 'bg-neutral-100 shadow-[0_0_10px_rgba(255,255,255,0.7)]'
                : 'bg-neutral-900 shadow-[0_0_8px_rgba(0,0,0,0.35)]'
            }`}
          />
        ) : mode === '3d-orbit' ? (
          // Precision crosshair pinpoint for 3D Orbit
          <div className="relative w-3 h-3 flex items-center justify-center">
            <div className={`w-1 h-1 rounded-full ${isDark ? 'bg-cyan-300' : 'bg-neutral-900'}`} />
            <div
              className={`absolute w-3 h-[1px] ${
                isDark ? 'bg-cyan-400/80' : 'bg-neutral-800/80'
              }`}
            />
            <div
              className={`absolute h-3 w-[1px] ${
                isDark ? 'bg-cyan-400/80' : 'bg-neutral-800/80'
              }`}
            />
          </div>
        ) : isButtonMode ? (
          // Minimalist micro-dot nested inside button aura
          <motion.div
            animate={{ scale: isDown ? 0.6 : 0.9, opacity: 0.8 }}
            className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-white' : 'bg-neutral-950'}`}
          />
        ) : (
          // Default Precision Center Reticle Dot
          <motion.div
            animate={{
              scale: isDown ? 0.7 : 1,
            }}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              isDark ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-neutral-950'
            }`}
          />
        )}
      </motion.div>

      {/* 2. SMOOTH LERPED OUTER AURA (Spring-Inertia Follower) */}
      <motion.div
        className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center will-change-transform pointer-events-none"
        style={{
          x: auraX,
          y: auraY,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ opacity: { duration: 0.2 } }}
      >
        <AnimatePresence mode="wait">
          {/* ==================== A: 3D CANVASES: ROTATING GYROSCOPE HUD ==================== */}
          {mode === '3d-orbit' && (
            <motion.div
              key="mode-3d-orbit"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{
                scale: isDown ? 0.92 : 1,
                opacity: 1,
              }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="relative w-24 h-24 flex items-center justify-center"
            >
              {/* Outer Rotating Gyroscope Dashed Horizon Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
                className={`absolute inset-0 rounded-full border border-dashed ${
                  isDark
                    ? 'border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                    : 'border-neutral-800/60 shadow-[0_0_10px_rgba(0,0,0,0.1)]'
                }`}
              />

              {/* Inner Tilted Gyroscope Gimbal Ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
                className={`absolute inset-2.5 rounded-full border ${
                  isDark ? 'border-indigo-400/50' : 'border-neutral-600/50'
                } scale-y-[0.45]`}
              />

              {/* Cardinal Ticks */}
              <div
                className={`absolute top-0 w-1.5 h-1 ${
                  isDark ? 'bg-cyan-400' : 'bg-neutral-800'
                }`}
              />
              <div
                className={`absolute bottom-0 w-1.5 h-1 ${
                  isDark ? 'bg-cyan-400' : 'bg-neutral-800'
                }`}
              />
              <div
                className={`absolute left-0 h-1.5 w-1 ${
                  isDark ? 'bg-cyan-400' : 'bg-neutral-800'
                }`}
              />
              <div
                className={`absolute right-0 h-1.5 w-1 ${
                  isDark ? 'bg-cyan-400' : 'bg-neutral-800'
                }`}
              />

              {/* Center Gyro Compass Core */}
              <div
                className={`p-1 rounded-full ${
                  isDark
                    ? 'bg-neutral-900/90 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                    : 'bg-white/90 text-neutral-900 shadow-md'
                }`}
              >
                <Compass className="w-4 h-4 animate-pulse" />
              </div>

              {/* HUD Tag Marked "3D ORBIT" */}
              <div
                className={`absolute -bottom-6 px-2.5 py-0.5 rounded-full font-mono text-[9px] font-bold tracking-widest uppercase backdrop-blur-md border shadow-lg flex items-center gap-1.5 whitespace-nowrap ${
                  isDark
                    ? 'bg-neutral-950/90 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-neutral-900/90 text-neutral-100 border-neutral-700 shadow-sm'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>3D ORBIT</span>
              </div>
            </motion.div>
          )}

          {/* ==================== B: BUTTONS & CARDS: CONTEXT HOVER CAPSULE ==================== */}
          {isButtonMode && (
            <motion.div
              key={`mode-button-${isDark ? 'dark' : 'light'}`}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{
                scale: isDown ? 0.94 : 1,
                opacity: 1,
              }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              className="relative flex items-center justify-center"
            >
              {/* Diffuse Aura Glow Bloom - Strictly theme matched: Indigo in Dark Mode, Amber in Light Mode */}
              <div
                className={`absolute inset-0 -m-3 rounded-full blur-md ${
                  isDark ? 'opacity-65 bg-indigo-500' : 'opacity-60 bg-amber-500'
                }`}
                style={{ filter: 'blur(12px)' }}
              />

              {/* Primary Aura Capsule */}
              <div
                className={`relative px-4 py-2 rounded-full font-mono text-xs font-bold tracking-wider uppercase flex items-center gap-2 select-none whitespace-nowrap backdrop-blur-md shadow-2xl transition-all duration-200 ${
                  isDark
                    ? 'bg-indigo-500 text-white border border-indigo-300/60 shadow-[0_0_25px_rgba(99,102,241,0.65)]'
                    : 'bg-amber-500 text-neutral-950 border border-amber-400 shadow-[0_6px_24px_rgba(245,158,11,0.45)]'
                }`}
              >
                <span>{displayLabel}</span>
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5] animate-pulse" />
              </div>
            </motion.div>
          )}

          {/* ==================== C: SPRING PHYSICS & SLIDERS: ELASTIC TENSION PILL ==================== */}
          {mode === 'tension' && (
            <motion.div
              key="mode-tension"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{
                scale: isDown ? 1.08 : 1,
                opacity: 1,
              }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="relative flex items-center justify-center"
            >
              {/* Elastic Tension Aura */}
              <div
                className={`absolute inset-0 -m-2 rounded-full blur-md opacity-40 ${
                  isDown
                    ? isDark
                      ? 'bg-indigo-400'
                      : 'bg-amber-400'
                    : 'bg-indigo-500'
                }`}
              />

              {/* Elastic Tension Pill Marked "TENSION / DRAG" */}
              <div
                className={`relative px-3.5 py-1.5 rounded-full font-mono text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 select-none whitespace-nowrap backdrop-blur-md border shadow-2xl transition-colors duration-200 ${
                  isDown
                    ? isDark
                      ? 'bg-neutral-950 text-indigo-300 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.5)]'
                      : 'bg-neutral-950 text-amber-300 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.5)]'
                    : 'bg-neutral-950/90 text-neutral-100 border-neutral-700 shadow-xl'
                }`}
              >
                <div className="flex items-center gap-0.5 text-neutral-400">
                  <MoveHorizontal
                    className={`w-3.5 h-3.5 ${
                      isDown
                        ? isDark
                          ? 'text-indigo-400 animate-pulse'
                          : 'text-amber-400 animate-pulse'
                        : ''
                    }`}
                  />
                </div>
                <span>{isDown ? 'TENSION ACTIVE' : 'TENSION / DRAG'}</span>
                <Sliders className="w-3 h-3 opacity-70" />
              </div>
            </motion.div>
          )}

          {/* ==================== D: SOUND ENGINE & SYNTH: RESONANCE BADGE ==================== */}
          {mode === 'sound' && (
            <motion.div
              key="mode-sound"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{
                scale: isDown ? 0.94 : 1,
                opacity: 1,
              }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 26 }}
              className="relative flex items-center justify-center"
            >
              {/* Resonant Sound Halo */}
              <div className="absolute inset-0 -m-3 rounded-full blur-md opacity-50 bg-indigo-500/80" />

              {/* Audio Resonance Badge Marked "SOUND / RESONATE" */}
              <div
                className={`relative px-3.5 py-1.5 rounded-full font-mono text-[10px] font-bold tracking-widest uppercase flex items-center gap-2.5 select-none whitespace-nowrap backdrop-blur-md border shadow-2xl ${
                  isDark
                    ? 'bg-neutral-950/95 text-indigo-200 border-indigo-500/60 shadow-[0_0_25px_rgba(99,102,241,0.4)]'
                    : 'bg-neutral-950 text-indigo-200 border-neutral-800 shadow-xl'
                }`}
              >
                {/* Animated Equalizer Wave Bars */}
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
                  <span className="w-0.5 h-3 bg-indigo-300 rounded-full animate-bounce" />
                  <span className="w-0.5 h-2 bg-indigo-400 rounded-full animate-pulse" />
                  <span className="w-0.5 h-3.5 bg-indigo-200 rounded-full animate-bounce" />
                </div>

                <span>SOUND / RESONATE</span>

                <Volume2 className="w-3 h-3 text-indigo-400" />
              </div>
            </motion.div>
          )}

          {/* ==================== E: HEADINGS & BLOCKQUOTES: READ BEAM ==================== */}
          {mode === 'read' && (
            <motion.div
              key="mode-read"
              initial={{ scale: 0.7, opacity: 0, x: 12 }}
              animate={{ scale: 1, opacity: 1, x: 20 }}
              exit={{ scale: 0.7, opacity: 0, x: 12 }}
              transition={{ type: 'spring', stiffness: 450, damping: 28 }}
              className="relative flex items-center"
            >
              {/* Typography Reading Pill Marked "READ" */}
              <div
                className={`px-2.5 py-0.5 rounded-full font-mono text-[9px] font-bold tracking-widest uppercase flex items-center gap-1.5 select-none whitespace-nowrap backdrop-blur-md border shadow-lg ${
                  isDark
                    ? 'bg-neutral-950/90 text-neutral-200 border-neutral-700 shadow-[0_0_15px_rgba(255,255,255,0.15)]'
                    : 'bg-white/95 text-neutral-900 border-neutral-300 shadow-md'
                }`}
              >
                <BookOpen className="w-3 h-3 opacity-80" />
                <span>READ</span>
              </div>
            </motion.div>
          )}

          {/* ==================== F: DEFAULT CURSOR AURA RING ==================== */}
          {mode === 'default' && (
            <motion.div
              key="mode-default"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: isDown ? 0.82 : 1,
                opacity: 1,
              }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="relative w-8 h-8 flex items-center justify-center"
            >
              {/* Subtle Lerped Aura Ring with 4 Cardinal Micro-Ticks */}
              <div
                className={`w-8 h-8 rounded-full border transition-colors ${
                  isDark
                    ? 'border-white/25 bg-white/[0.03] shadow-[0_0_12px_rgba(255,255,255,0.06)]'
                    : 'border-neutral-950/20 bg-neutral-950/[0.03] shadow-sm'
                }`}
              />
              <div
                className={`absolute -top-0.5 w-1 h-[1px] ${
                  isDark ? 'bg-white/40' : 'bg-neutral-950/30'
                }`}
              />
              <div
                className={`absolute -bottom-0.5 w-1 h-[1px] ${
                  isDark ? 'bg-white/40' : 'bg-neutral-950/30'
                }`}
              />
              <div
                className={`absolute -left-0.5 h-1 w-[1px] ${
                  isDark ? 'bg-white/40' : 'bg-neutral-950/30'
                }`}
              />
              <div
                className={`absolute -right-0.5 h-1 w-[1px] ${
                  isDark ? 'bg-white/40' : 'bg-neutral-950/30'
                }`}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
