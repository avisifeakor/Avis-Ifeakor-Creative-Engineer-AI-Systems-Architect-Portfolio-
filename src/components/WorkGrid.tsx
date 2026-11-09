import React, { useState, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { ArrowUpRight, Cpu, Layers, Activity, Sparkles } from 'lucide-react';
import { Project } from '../types';
import { PROJECTS } from '../constants/portfolioData';
import { soundManager } from '../lib/soundEffects';

interface WorkGridProps {
  onSelectProject: (project: Project) => void;
}

const CATEGORIES = ['All', 'AI & Systems', 'Mobile & Health', 'Fintech & Web', 'Hardware & IoT'] as const;

export const WorkGrid: React.FC<WorkGridProps> = ({ onSelectProject }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const sectionRef = useRef<HTMLElement>(null);
  const isSectionInView = useInView(sectionRef, { once: true, amount: 0.08, margin: '-60px 0px' });

  const filteredProjects = activeCategory === 'All'
    ? PROJECTS
    : PROJECTS.filter((p) => p.category === activeCategory);

  const handleCategorySelect = (category: string) => {
    soundManager.playClick(600);
    setActiveCategory(category);
  };

  return (
    <motion.section
      ref={sectionRef}
      id="work"
      initial={{ opacity: 0, y: 36 }}
      animate={isSectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-8"
    >
      {/* Header & Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={isSectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              FEATURED ARCHITECTURE & CASE STUDIES
            </span>
          </div>
          <h2 data-cursor="read" className="text-4xl sm:text-5xl md:text-6xl font-serif tracking-tight text-neutral-900 dark:text-neutral-100">
            Selected Works
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                data-cursor="interact"
                onClick={() => handleCategorySelect(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-mono tracking-wide transition-all ${
                  isActive
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold shadow-sm'
                    : 'bg-neutral-200/60 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Projects 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
        {filteredProjects.map((project, index) => {
          return (
            <motion.div
              key={project.id}
              data-cursor="explore"
              data-cursor-text="EXPLORE"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.12, margin: '-50px 0px' }}
              transition={{
                duration: 0.65,
                delay: (index % 2) * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -6 }}
              onClick={() => {
                soundManager.playClick(750);
                onSelectProject(project);
              }}
              className="group cursor-pointer flex flex-col rounded-3xl bg-white/95 dark:bg-neutral-900/90 backdrop-blur-md border border-stone-300/80 dark:border-neutral-800 overflow-hidden shadow-[0_4px_24px_-4px_rgba(28,25,23,0.07)] hover:shadow-[0_16px_36px_-6px_rgba(28,25,23,0.13)] transition-all duration-300"
              id={`project-card-${project.id}`}
            >
              {/* Visual Mockup Container */}
              <div className="relative aspect-[16/11] w-full bg-neutral-950 overflow-hidden flex items-center justify-center p-6 sm:p-8 select-none">
                {/* Visual Background Glow */}
                <div
                  className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity blur-2xl"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, ${project.accentColor}, transparent 70%)`,
                  }}
                />

                {/* Subtly patterned grid background */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

                {/* Device & Interactive Viewport Renderers */}
                {project.id === 'aetheria-os' && (
                  <div className="relative z-10 w-full max-w-[390px] rounded-2xl bg-[#0F1420]/95 border border-indigo-500/30 p-4 shadow-2xl backdrop-blur-md">
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-800 text-[10px] font-mono text-neutral-400">
                      <div className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                        <Cpu className="w-3.5 h-3.5" />
                        <span>Aetheria Graph Core</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">120 FPS</span>
                    </div>

                    {/* Node Graph Visualizer */}
                    <div className="py-4 relative h-32 flex items-center justify-between px-2">
                      <div className="p-2.5 rounded-lg bg-neutral-800/90 border border-neutral-700 text-[9px] font-mono text-neutral-200 shadow-lg">
                        <div className="text-indigo-400 font-semibold">Input Stream</div>
                        <div className="text-neutral-400 text-[8px]">AudioWorklet.pcm</div>
                      </div>

                      {/* Connection Wire */}
                      <div className="flex-1 h-px bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 relative mx-2" />

                      <div className="p-2.5 rounded-lg bg-indigo-950/80 border border-indigo-600 text-[9px] font-mono text-indigo-200 shadow-lg">
                        <div className="text-white font-semibold">Shader Pipeline</div>
                        <div className="text-indigo-300 text-[8px]">Raymarch.frag</div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-800 flex justify-between text-[9px] font-mono text-neutral-500">
                      <span>R-Tree Spatial Index: Active</span>
                      <span>Nodes: 10,240</span>
                    </div>
                  </div>
                )}

                {project.id === 'hyperion-telemetry' && (
                  <div className="relative z-10 w-full max-w-[390px] rounded-2xl bg-[#090D16]/95 border border-emerald-500/30 p-4 shadow-2xl backdrop-blur-md">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-[10px] font-mono text-neutral-400">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <Activity className="w-3.5 h-3.5" />
                        <span>Hyperion Stream</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">0.0ms GC Stalls</span>
                    </div>

                    {/* Depth Chart Candlesticks */}
                    <div className="py-3 flex items-end justify-between h-28 gap-1.5 px-1">
                      {[35, 50, 42, 68, 55, 74, 62, 85, 92, 78, 98, 90].map((val, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                          <div
                            className="w-full rounded-sm bg-gradient-to-t from-emerald-600 to-emerald-400"
                            style={{ height: `${val}%` }}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-neutral-800 flex justify-between text-[9px] font-mono text-neutral-400">
                      <span>Ticks: 25,000/s</span>
                      <span className="text-emerald-400 font-semibold">$1.4B 24h Vol</span>
                    </div>
                  </div>
                )}

                {project.id === 'verve-audio-lab' && (
                  <div className="relative z-10 w-full max-w-[320px] rounded-2xl bg-[#140F24]/95 border border-purple-500/30 p-4 shadow-2xl backdrop-blur-md">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-[10px] font-mono text-neutral-400">
                      <span className="text-purple-300 font-semibold">Verve Harmonic Dial</span>
                      <span className="text-neutral-500">432 Hz Poly</span>
                    </div>

                    <div className="py-4 flex flex-col items-center justify-center">
                      <div className="relative w-20 h-20 rounded-full border-2 border-dashed border-purple-400/50 flex items-center justify-center animate-spin" style={{ animationDuration: '18s' }}>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-lg flex items-center justify-center text-white text-xs font-mono font-bold">
                          DSP
                        </div>
                      </div>
                      <div className="mt-3 text-[10px] font-mono text-purple-200">
                        Cutoff: 3.4 kHz • Resonance: 0.82
                      </div>
                    </div>
                  </div>
                )}

                {project.id === 'kinesis-motion-engine' && (
                  <div className="relative z-10 w-full max-w-[340px] rounded-2xl bg-[#181510]/95 border border-amber-500/30 p-4 shadow-2xl backdrop-blur-md">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-[10px] font-mono text-neutral-400">
                      <span className="text-amber-400 font-semibold">Kinesis Spring Tokens</span>
                      <span className="text-neutral-400">AST Runtime</span>
                    </div>

                    <div className="py-3 font-mono text-[10px] text-neutral-300 space-y-1.5">
                      <div className="text-amber-300/90 font-semibold">const springConfig = &#123;</div>
                      <div className="pl-4 text-neutral-400">stiffness: 420,</div>
                      <div className="pl-4 text-neutral-400">damping: 32,</div>
                      <div className="pl-4 text-neutral-400">mass: 1.0</div>
                      <div className="text-amber-300/90 font-semibold">&#125;;</div>
                    </div>

                    <div className="pt-2 border-t border-neutral-800 flex justify-between text-[9px] font-mono text-amber-200/70">
                      <span>Calculated Settling Time</span>
                      <span className="text-white font-semibold">180ms</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Meta Content */}
              <div className="p-6 sm:p-7 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-2">
                    <span className="uppercase tracking-wider">{project.category}</span>
                    <span>{project.year}</span>
                  </div>

                  <h3 className="text-2xl font-serif text-neutral-900 dark:text-neutral-100 group-hover:text-neutral-700 dark:group-hover:text-indigo-400 transition-colors flex items-center justify-between">
                    <span>{project.title}</span>
                    <ArrowUpRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </h3>

                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed font-sans">
                    {project.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-500 dark:text-neutral-400">{project.client}</span>
                  <span
                    data-cursor="open"
                    data-cursor-text="OPEN"
                    className="text-neutral-900 dark:text-indigo-400 font-medium group-hover:underline"
                  >
                    Read Case Study →
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
};
