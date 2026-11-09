import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Activity, Sparkles, Cpu, Layers, Terminal, Server } from 'lucide-react';
import { kineticTextWordVariants } from '../lib/animationVariants';
import { soundManager } from '../lib/soundEffects';

const KINETIC_PHRASES = [
  'Feel Physical',
  'Move Effortlessly',
  'Accelerate Thought',
  'Defy Friction',
  'Resonate Deeply',
];

interface HeroSectionProps {
  isDark: boolean;
  onExploreWork: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ isDark, onExploreWork }) => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [synthFrequency, setSynthFrequency] = useState(440);

  // Kinetic phrase cycling
  useEffect(() => {
    const timer = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % KINETIC_PHRASES.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const handleToggleAudio = () => {
    soundManager.playClick();
    if (isPlaying) {
      soundManager.stopAmbientTrack();
      setIsPlaying(false);
    } else {
      soundManager.startAmbientTrack();
      setIsPlaying(true);
    }
  };

  const handleFrequencyTap = (freq: number) => {
    setSynthFrequency(freq);
    soundManager.playClick(freq);
  };

  return (
    <section className="relative min-h-[94vh] sm:min-h-screen pt-28 sm:pt-36 pb-16 flex flex-col justify-between overflow-hidden">
      {/* Subtle Background Architectural Grid and Radial Light Bloom */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        {/* Soft chromatic atmosphere */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl dark:from-indigo-600/15 dark:via-purple-700/10" />
        <div className="absolute bottom-10 left-10 w-[450px] h-[400px] bg-gradient-to-tr from-amber-500/5 via-sky-500/5 to-transparent rounded-full blur-3xl" />

        {/* Crisp mathematical grid overlay */}
        <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.05] bg-[radial-gradient(#000000_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full">
        {/* Top Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center gap-2 mb-6"
        >
          <span className="text-xs sm:text-sm font-mono tracking-widest uppercase text-neutral-600 dark:text-neutral-400 font-semibold">
            AVIS IFEAKOR — FULL-STACK SOFTWARE ENGINEER & AI SYSTEMS ARCHITECT (2024 — 2026)
          </span>
        </motion.div>

        {/* Editorial Display Headline */}
        <div className="relative">
          {/* Vertical Technical Label */}
          <div className="hidden lg:block absolute -left-12 top-6 -rotate-90 origin-top-left text-[10px] font-mono tracking-[0.3em] text-neutral-400 dark:text-neutral-500 select-none uppercase">
            FULL-STACK / AI & ML / FLUTTER MOBILE
          </div>

          <h1
            data-cursor="read"
            className="text-4xl sm:text-6xl md:text-7xl lg:text-[6.5rem] leading-[1.08] tracking-tight font-serif text-neutral-900 dark:text-neutral-50"
          >
            <span className="block font-normal">Engineering interfaces that</span>
            <span className="inline-flex relative h-[1.3em] overflow-hidden align-baseline text-neutral-950 dark:text-indigo-400 italic">
              <AnimatePresence mode="wait">
                <motion.span
                  key={phraseIndex}
                  variants={kineticTextWordVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="whitespace-nowrap font-serif tracking-tight pr-4"
                >
                  {KINETIC_PHRASES[phraseIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>
        </div>

        {/* Dual Interactive Matrix: Tactile Synthesizer Deck + 3D Gyroscope Canvas */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Tactile DSP Harmonic Console */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="p-6 sm:p-7 rounded-3xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-neutral-200/80 dark:border-neutral-800 shadow-xl max-w-lg"
            >
              <div className="flex items-center justify-between border-b border-neutral-200/70 dark:border-neutral-800 pb-3.5 mb-5">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-neutral-800 dark:text-indigo-400" />
                  <span className="text-xs font-mono font-medium text-neutral-800 dark:text-neutral-200 tracking-wide uppercase">
                    Harmonic Resonance Engine
                  </span>
                </div>
                <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                  {synthFrequency} Hz • 32-Bit Float
                </span>
              </div>

              {/* Frequencies Matrix & Interactive Keys */}
              <div className="flex items-center justify-between gap-3 mb-5">
                {[
                  { label: 'C4', freq: 261.63 },
                  { label: 'E4', freq: 329.63 },
                  { label: 'G4', freq: 392.00 },
                  { label: 'B4', freq: 493.88 },
                  { label: 'D5', freq: 587.33 },
                ].map((note) => (
                  <button
                    key={note.label}
                    data-cursor="sound"
                    onClick={() => handleFrequencyTap(note.freq)}
                    className={`flex-1 py-3 px-1 rounded-xl text-xs font-mono font-semibold transition-all border ${
                      synthFrequency === note.freq
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-md scale-105 dark:bg-indigo-600 dark:border-indigo-700'
                        : 'bg-neutral-100 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <div>{note.label}</div>
                    <div className="text-[9px] opacity-60 font-normal">{Math.round(note.freq)}Hz</div>
                  </button>
                ))}
              </div>

              {/* Master Audio Run / Stop */}
              <div className="flex items-center justify-between pt-2">
                <button
                  data-cursor="sound"
                  onClick={handleToggleAudio}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs font-mono uppercase tracking-wider font-semibold shadow-md hover:scale-105 active:scale-95 transition-transform"
                  id="hero-play-button"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>HALT RESONANCE</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>START AMBIENT SOUNDSCAPE</span>
                    </>
                  )}
                </button>

                {/* Animated Spectrum Analyzer */}
                <div data-cursor="sound" className="flex items-end gap-1 h-7">
                  {[10, 24, 16, 30, 14, 26, 18, 28, 12, 22].map((h, i) => (
                    <span
                      key={i}
                      className="w-1 rounded-full bg-neutral-900/80 dark:bg-indigo-500/80 transition-all duration-300"
                      style={{
                        height: isPlaying ? `${Math.max(6, (h * (i % 3 + 1)) / 2.5)}px` : '4px',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-between text-[10px] font-mono text-neutral-500 dark:text-neutral-500">
                <span>SAMPLE-ACCURATE TIMING</span>
                <span>SUB-MILLISEC DSP</span>
              </div>
            </motion.div>
          </div>

          {/* Right: Production Systems Architecture & Engineering Deck */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-end">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-neutral-200/80 dark:border-neutral-800 shadow-xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-neutral-200/70 dark:border-neutral-800 pb-3.5 mb-5">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-neutral-800 dark:text-indigo-400" />
                  <span className="text-xs font-mono font-medium text-neutral-800 dark:text-neutral-200 tracking-wide uppercase">
                    Core Technical Competencies
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Production Ready</span>
                </div>
              </div>

              {/* Architecture Pillars Grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="p-3.5 rounded-2xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 font-mono">
                  <div className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
                    Backend Architecture
                  </div>
                  <div className="text-xs font-bold text-neutral-900 dark:text-white">
                    Distributed High-Throughput
                  </div>
                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-1">
                    Node.js • Python • PostgreSQL
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 font-mono">
                  <div className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
                    AI & Data Systems
                  </div>
                  <div className="text-xs font-bold text-neutral-900 dark:text-white">
                    LLM RAG & Inference
                  </div>
                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-1">
                    PyTorch • Vector DB • Embeddings
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 font-mono">
                  <div className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
                    Mobile Engineering
                  </div>
                  <div className="text-xs font-bold text-neutral-900 dark:text-white">
                    Cross-Platform Native
                  </div>
                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-1">
                    Flutter • Dart • iOS & Android
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 font-mono">
                  <div className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
                    Frontend Runtimes
                  </div>
                  <div className="text-xs font-bold text-neutral-900 dark:text-white">
                    Zero-Jank Fluid Systems
                  </div>
                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-1">
                    React • TypeScript • Tailwind
                  </div>
                </div>
              </div>

              {/* Live Technical SLA / Availability Bar */}
              <div className="p-3.5 rounded-2xl bg-neutral-900 dark:bg-neutral-950 text-white border border-neutral-800 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-indigo-400" />
                  <span>SLA / Production Reliability</span>
                </div>
                <div className="text-emerald-400 font-bold">99.99% Availability</div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-between text-[10px] font-mono text-neutral-500 dark:text-neutral-500">
                <span>DETERMINISTIC ARCHITECTURE</span>
                <span>LOW-LATENCY RUNTIMES</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Cue */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full mt-14 flex items-center justify-between">
        <button
          data-cursor="explore"
          onClick={onExploreWork}
          className="text-xs font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white flex items-center gap-2 group transition-colors"
        >
          <span>EXPLORE ARCHITECTURE & CASE STUDIES</span>
          <span className="w-4 h-px bg-neutral-400 group-hover:w-8 transition-all" />
        </button>

        <div className="hidden sm:flex items-center gap-6 text-xs font-mono text-neutral-400 dark:text-neutral-500">
          <span>FULL-STACK ECOSYSTEMS</span>
          <span>•</span>
          <span>DATA-DRIVEN AI</span>
          <span>•</span>
          <span>CROSS-PLATFORM MOBILE</span>
        </div>
      </div>
    </section>
  );
};
