import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Play, Pause, Maximize2, X, Sparkles, Cpu, Activity, Sliders, ExternalLink } from 'lucide-react';
import { PLAYGROUND_VIGNETTES } from '../constants/portfolioData';
import { PlaygroundVignette } from '../types';
import { soundManager } from '../lib/soundEffects';
import { InteractiveSpringPhysics } from './InteractiveSpringPhysics';
import { ExperimentMiniPreview } from './experiments/ExperimentMiniPreview';
import { ExperimentInspectorModal } from './experiments/ExperimentInspectorModal';

export const PlaygroundView: React.FC<{ isDark?: boolean }> = ({ isDark }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [continuousIndex, setContinuousIndex] = useState(0);
  const [selectedVignette, setSelectedVignette] = useState<PlaygroundVignette | null>(null);

  const trackRef = useRef<HTMLDivElement>(null);
  const targetIndexRef = useRef(0);
  const continuousIndexRef = useRef(0);
  const prevRoundedRef = useRef(0);

  // Interactive Particle/Matrix Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Scroll tracking to drive carousel cards smoothly
  useEffect(() => {
    let animId: number;
    let isLoopRunning = false;

    const updateLerp = () => {
      const diff = targetIndexRef.current - continuousIndexRef.current;
      if (Math.abs(diff) > 0.0005) {
        continuousIndexRef.current += diff * 0.12;
        setContinuousIndex(continuousIndexRef.current);

        const rounded = Math.round(continuousIndexRef.current);
        if (rounded !== prevRoundedRef.current) {
          prevRoundedRef.current = rounded;
          setActiveIndex(rounded);
          soundManager.playClick(620 + rounded * 40);
        }
        animId = requestAnimationFrame(updateLerp);
      } else {
        continuousIndexRef.current = targetIndexRef.current;
        setContinuousIndex(targetIndexRef.current);
        isLoopRunning = false;
      }
    };

    const requestLerpUpdate = () => {
      if (!isLoopRunning) {
        isLoopRunning = true;
        animId = requestAnimationFrame(updateLerp);
      }
    };

    const handleScroll = () => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const trackHeight = rect.height - window.innerHeight;
      if (trackHeight <= 0) return;

      // Calculate progress while the track is scrolling past the sticky viewport
      const rawProgress = -rect.top / trackHeight;
      const clampedProgress = Math.min(Math.max(rawProgress, 0), 1);
      targetIndexRef.current = clampedProgress * (PLAYGROUND_VIGNETTES.length - 1);
      requestLerpUpdate();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      cancelAnimationFrame(animId);
      isLoopRunning = false;
    };
  }, []);

  const scrollToCard = (targetIdx: number) => {
    if (!trackRef.current) return;
    const clamped = Math.max(0, Math.min(PLAYGROUND_VIGNETTES.length - 1, targetIdx));
    const rect = trackRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const trackTop = scrollY + rect.top;
    const trackHeight = rect.height - window.innerHeight;
    const targetY = trackTop + (clamped / (PLAYGROUND_VIGNETTES.length - 1)) * trackHeight;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  const handleNext = () => {
    scrollToCard(activeIndex + 1);
  };

  const handlePrev = () => {
    scrollToCard(activeIndex - 1);
  };

  // Kinetic ASCII / Typographic Grid Canvas - Event-driven, 0 idle CPU
  const drawCanvas = (xPos: number, yPos: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const chars = ['0', '1', 'λ', 'Ω', '∂', '∇', '✦', '∫', '∑', '•'];
    const cols = 22;
    const rows = 12;
    const cellW = canvas.width / cols;
    const cellH = canvas.height / rows;

    ctx.fillStyle = '#080C14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * cellW + cellW / 2;
        const y = r * cellH + cellH / 2;
        const dist = Math.hypot(x - xPos, y - yPos);

        const charIndex = (r * cols + c) % chars.length;
        const char = chars[charIndex];

        if (dist < 80) {
          ctx.fillStyle = '#6366F1';
          ctx.fillText(char, x + (x - xPos) * 0.15, y + (y - yPos) * 0.15);
        } else {
          ctx.fillStyle = 'rgba(140, 160, 200, 0.25)';
          ctx.fillText(char, x, y);
        }
      }
    }
  };

  useEffect(() => {
    drawCanvas(-100, -100);
  }, []);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const canvas = canvasRef.current;
    const scaleX = canvas && rect.width > 0 ? canvas.width / rect.width : 1;
    const scaleY = canvas && rect.height > 0 ? canvas.height / rect.height : 1;
    setMousePos({
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    });
  };

  return (
    <div className="pt-28 sm:pt-36 pb-24 max-w-7xl mx-auto px-4 sm:px-8">
      {/* Header */}
      <div className="max-w-3xl mb-12 sm:mb-16">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            ENGINEERING LAB & EXPERIMENTS
          </span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-serif text-neutral-900 dark:text-white tracking-tight">
          Shaders, Physics & Vignettes
        </h1>
        <p className="mt-4 text-neutral-600 dark:text-neutral-300 font-sans text-base sm:text-lg leading-relaxed">
          An ongoing archive of mathematical explorations, custom GLSL shaders, and interactive physics sandboxes built to test the limits of modern browser runtimes.
        </p>
      </div>

      {/* Scroll-Driven 3D Coverflow Section */}
      <div ref={trackRef} className="relative w-full h-[260vh] -mt-4">
        <div className="sticky top-20 sm:top-24 w-full h-[calc(100vh-6.5rem)] min-h-[540px] max-h-[760px] flex flex-col items-center justify-between py-4 sm:py-6 overflow-hidden select-none">
          {/* Top Control Bar: Scroll Telemetry & Navigation Buttons */}
          <div className="w-full flex items-center justify-between z-20 px-2 sm:px-4">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-neutral-200/90 dark:border-neutral-800 shadow-sm text-xs font-mono">
              <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                SCROLL TO TRAVERSE
              </span>
              <span className="text-neutral-400 dark:text-neutral-500">•</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                0{activeIndex + 1} / 0{PLAYGROUND_VIGNETTES.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={activeIndex === 0}
                className="p-2.5 rounded-full bg-white/85 dark:bg-neutral-800/85 backdrop-blur border border-neutral-200 dark:border-neutral-700 shadow-md hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all text-neutral-800 dark:text-neutral-200"
                title="Previous experiment"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                disabled={activeIndex === PLAYGROUND_VIGNETTES.length - 1}
                className="p-2.5 rounded-full bg-white/85 dark:bg-neutral-800/85 backdrop-blur border border-neutral-200 dark:border-neutral-700 shadow-md hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all text-neutral-800 dark:text-neutral-200"
                title="Next experiment"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3D Carousel Cards Stage */}
          <div className="relative w-full flex-1 flex items-center justify-center [perspective:1400px]">
            {PLAYGROUND_VIGNETTES.map((vignette, i) => {
              const offset = i - continuousIndex;
              const absOffset = Math.abs(offset);

              if (absOffset > 2.8) return null;

              const scale = Math.max(0.74, 1 - absOffset * 0.14);
              const x = offset * 270;
              const rotateY = Math.max(-38, Math.min(38, offset * -24));
              const zIndex = Math.round(50 - absOffset * 10);
              const opacity = Math.max(0.2, 1 - absOffset * 0.35);
              const isCenter = absOffset < 0.45;

              return (
                <div
                  key={vignette.id}
                  data-cursor="interact"
                  data-cursor-text="INSPECT"
                  style={{
                    transform: `translateX(${x}px) rotateY(${rotateY}deg) scale(${scale})`,
                    zIndex,
                    opacity,
                    transformStyle: 'preserve-3d',
                  }}
                  onClick={() => {
                    soundManager.playClick(850);
                    if (isCenter) {
                      setSelectedVignette(vignette);
                    } else {
                      scrollToCard(i);
                    }
                  }}
                  className={`absolute w-[300px] sm:w-[360px] h-[380px] sm:h-[430px] rounded-3xl p-6 sm:p-7 flex flex-col justify-between cursor-pointer border shadow-2xl transition-[box-shadow,border-color,background-color] duration-300 will-change-transform ${
                    isCenter
                      ? 'border-neutral-900/80 dark:border-indigo-500/80 bg-[#FCFBF8] dark:bg-neutral-950 text-neutral-900 dark:text-white ring-1 ring-neutral-900/10 dark:ring-indigo-500/30 shadow-2xl'
                      : 'border-neutral-300/80 dark:border-neutral-800/80 bg-white/80 dark:bg-neutral-900/95 text-neutral-600 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono tracking-widest uppercase">
                      <span className="text-neutral-500 dark:text-indigo-400 font-semibold">{vignette.index}</span>
                      <span className="px-2 py-0.5 rounded bg-neutral-200/80 dark:bg-neutral-800/90 text-neutral-700 dark:text-neutral-300 font-mono text-[10px]">
                        {vignette.tool}
                      </span>
                    </div>

                    <h3 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white mt-4 tracking-tight">
                      {vignette.title}
                    </h3>
                    <p className="text-xs font-mono text-neutral-600 dark:text-indigo-300/90 mt-1">
                      {vignette.tagline}
                    </p>
                  </div>

                  {/* Visual Shader Miniature */}
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-[#070A12] flex items-center justify-center border border-neutral-800 my-4 shadow-inner">
                    <ExperimentMiniPreview id={vignette.id} tool={vignette.tool} color={vignette.color} />

                    <span className="absolute top-2 left-2 z-10 text-[9px] font-mono tracking-wider text-white/80 uppercase px-2 py-0.5 rounded bg-black/70 backdrop-blur border border-white/10 pointer-events-none">
                      {vignette.tool} RUNTIME
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-neutral-500 dark:text-neutral-400 pt-3 border-t border-neutral-200 dark:border-neutral-800/80">
                    <span>{vignette.year}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        soundManager.playClick(850);
                        setSelectedVignette(vignette);
                      }}
                      className="text-neutral-900 dark:text-indigo-400 flex items-center gap-1.5 hover:underline cursor-pointer group/inspect py-1 px-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors"
                      title="Inspect full interactive simulation"
                    >
                      <span className="font-semibold">Inspect</span>
                      <Maximize2 className="w-3.5 h-3.5 group-hover/inspect:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Carousel Progress Bar & Pill Indicators */}
          <div className="flex flex-col items-center gap-3 z-20">
            <div className="flex items-center gap-2">
              {PLAYGROUND_VIGNETTES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToCard(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeIndex === idx
                      ? 'w-8 bg-neutral-900 dark:bg-indigo-400'
                      : 'w-2 bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400'
                  }`}
                  title={`Jump to experiment ${idx + 1}`}
                />
              ))}
            </div>
            <div className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
              <span>Scroll down to advance</span>
              <span className="animate-bounce">↓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Micro-Tool Sandboxes Grid */}
      <div className="mt-20 pt-12 border-t border-neutral-200/80 dark:border-neutral-800">
        <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-8">
          TACTILE ENGINEERING SANDBOXES
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sandbox 1: Interactive Spring Physics Solver */}
          <InteractiveSpringPhysics isDark={isDark} />

          {/* Sandbox 2: Kinetic Monospace Glyph Matrix */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 text-xs font-mono">
                <span className="text-neutral-900 dark:text-indigo-400 font-semibold flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-neutral-800 dark:text-indigo-400" />
                  <span>Kinetic Typography Matrix</span>
                </span>
                <span className="text-neutral-500 dark:text-neutral-400">GPU Displacement</span>
              </div>

              <div className="py-4">
                <canvas
                  ref={canvasRef}
                  width={340}
                  height={190}
                  data-cursor="3d-orbit"
                  data-cursor-text="3D ORBIT"
                  onMouseMove={handleCanvasMouseMove}
                  className="w-full rounded-2xl cursor-crosshair border border-neutral-800 shadow-inner"
                />
              </div>
            </div>

            <div className="mt-2 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-between text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
              <span>Hover canvas to scatter vector glyphs</span>
              <span>Zero-Allocation Loop</span>
            </div>
          </div>
        </div>
      </div>

      {/* Vignette Detailed Inspector Lightbox Modal */}
      <AnimatePresence>
        {selectedVignette && (
          <ExperimentInspectorModal
            vignette={selectedVignette}
            onClose={() => setSelectedVignette(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
