import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown,
  Sparkles,
  Terminal,
  Code2,
  Cpu,
  Award,
  Layers,
  Database,
  Smartphone,
  Server,
  Brain,
  Network,
  GitBranch,
  Cloud,
  CheckCircle2,
  FileCode,
  Binary,
  Github,
  Linkedin,
  ArrowUpRight,
  MessageCircle
} from 'lucide-react';
import {
  PERSONAL_INFO,
  EXPERIENCE_ITEMS,
  CORE_TECHNOLOGIES,
  CORE_METHODOLOGIES,
  WHAT_YOU_CAN_BUILD
} from '../constants/portfolioData';
import { soundManager } from '../lib/soundEffects';

type TechFilter = 'all' | 'languages' | 'enterprise' | 'data' | 'web';

export const AboutView: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string>('vane-labs');
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [techFilter, setTechFilter] = useState<TechFilter>('all');
  const [selectedBuildId, setSelectedBuildId] = useState<number | null>(null);

  const CARDS = [
    {
      title: 'Spatial Indexing & R-Trees',
      tag: 'ARCHITECTURE',
      body: 'Offloading 10,000+ interactive node coordinates to off-thread Web Workers, achieving 120 FPS continuous pan & zoom without DOM thrashing.',
      code: 'worker.postMessage({ type: "SPATIAL_QUERY", bounds });',
      color: '#6366F1'
    },
    {
      title: 'Runge-Kutta Spring Solvers',
      tag: 'PHYSICS',
      body: 'Replacing arbitrary bezier cubic-easings with true continuous 4th-order spring-damper equations so motion feels physically grounded.',
      code: 'dx/dt = v; dv/dt = (-k*x - c*v) / m;',
      color: '#EC4899'
    },
    {
      title: 'Sub-millisecond Audio DSP',
      tag: 'SYSTEMS',
      body: 'Sample-accurate polyphonic synthesis via AudioWorklet ring buffers, eliminating jitter and browser garbage collection audio drops.',
      code: 'process(inputs, outputs, params) { ... }',
      color: '#10B981'
    },
  ];

  const handleToggleAccordion = (id: string) => {
    soundManager.playClick(680);
    setExpandedId((prev) => (prev === id ? '' : id));
  };

  const handleCycleCard = () => {
    soundManager.playClick(880);
    setActiveCardIndex((prev) => (prev + 1) % CARDS.length);
  };

  const handleFilterChange = (filter: TechFilter) => {
    soundManager.playClick(720);
    setTechFilter(filter);
  };

  const filteredTechnologies = CORE_TECHNOLOGIES.filter((tech) => {
    if (techFilter === 'all') return true;
    return tech.category === techFilter;
  });

  const getTechIcon = (name: string) => {
    if (name.includes('Python')) return <Brain className="w-5 h-5 text-indigo-500" />;
    if (name.includes('Dart')) return <Smartphone className="w-5 h-5 text-sky-500" />;
    if (name.includes('JavaScript')) return <Code2 className="w-5 h-5 text-amber-500" />;
    if (name.includes('Java')) return <Server className="w-5 h-5 text-rose-500" />;
    if (name === 'C') return <Binary className="w-5 h-5 text-emerald-500" />;
    if (name.includes('Database')) return <Database className="w-5 h-5 text-blue-500" />;
    return <Layers className="w-5 h-5 text-purple-500" />;
  };

  const getMethodologyIcon = (title: string) => {
    if (title.includes('AI')) return <Brain className="w-5 h-5 text-indigo-500" />;
    if (title.includes('Software Architecture')) return <Layers className="w-5 h-5 text-amber-500" />;
    if (title.includes('Agile')) return <GitBranch className="w-5 h-5 text-emerald-500" />;
    return <Cloud className="w-5 h-5 text-sky-500" />;
  };

  return (
    <div className="pt-28 sm:pt-36 pb-24 max-w-7xl mx-auto px-4 sm:px-8">
      {/* Editorial Intro Banner */}
      <div className="max-w-4xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            ENGINEERING PHILOSOPHY & MANIFESTO • 2024 — 2026
          </span>
        </div>

        <h1
          data-cursor="read"
          className="text-4xl sm:text-6xl md:text-7xl font-serif tracking-tight text-neutral-900 dark:text-neutral-50 leading-[1.1]"
        >
          Bridging mathematical rigor, fluid physics, and uncompromising craft.
        </h1>

        <div className="mt-8 space-y-5 text-base sm:text-lg text-neutral-600 dark:text-neutral-300 font-sans leading-relaxed max-w-3xl">
          {PERSONAL_INFO.bioFull.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {/* Direct Verified Links */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="https://github.com/avisifeakor"
            target="_blank"
            rel="noreferrer"
            onClick={() => soundManager.playClick()}
            data-cursor="open"
            data-cursor-text="GITHUB"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs font-mono font-medium hover:opacity-90 transition-all shadow-sm active:scale-95"
            id="about-github-link"
          >
            <Github className="w-4 h-4" />
            <span>github.com/avisifeakor</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
          </a>

          <a
            href="https://linkedin.com/in/avisifeakor"
            target="_blank"
            rel="noreferrer"
            onClick={() => soundManager.playClick()}
            data-cursor="open"
            data-cursor-text="LINKEDIN"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white hover:border-neutral-400 dark:hover:border-neutral-600 text-xs font-mono font-medium transition-all shadow-sm active:scale-95"
            id="about-linkedin-link"
          >
            <Linkedin className="w-4 h-4 text-[#0A66C2]" />
            <span>linkedin.com/in/avisifeakor</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
          </a>

          <a
            href="https://wa.me/2348150675245"
            target="_blank"
            rel="noreferrer"
            onClick={() => soundManager.playClick()}
            data-cursor="open"
            data-cursor-text="WHATSAPP"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:border-emerald-500 text-xs font-mono font-medium transition-all shadow-sm active:scale-95"
            id="about-whatsapp-link"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>WhatsApp (+234 815 067 5245)</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
          </a>
        </div>
      </div>

      {/* Interactive Sketchbook & Architecture Cards */}
      <div className="my-16 sm:my-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Manifesto Quote & Principles */}
        <div className="lg:col-span-7">
          <div className="p-8 sm:p-10 rounded-3xl bg-neutral-100/70 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 backdrop-blur-sm">
            <span className="text-[11px] font-mono tracking-widest uppercase text-neutral-900 dark:text-indigo-400 font-semibold">
              CORE PHILOSOPHY
            </span>
            <blockquote
              data-cursor="read"
              className="mt-4 text-2xl sm:text-3xl font-serif italic text-neutral-900 dark:text-neutral-100 leading-snug"
            >
              "{PERSONAL_INFO.quote}"
            </blockquote>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-neutral-200/80 dark:border-neutral-800 text-xs font-mono text-neutral-600 dark:text-neutral-400">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-neutral-800 dark:text-indigo-400" />
                <span>Full-Stack Ecosystems</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-500" />
                <span>Data-Driven ML & Inference</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-sky-500" />
                <span>Cross-Platform Flutter & Dart</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>OOP & Clean Architecture</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Interactive 3D Fan-out Cards */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div
            data-cursor="open"
            data-cursor-text="OPEN"
            onClick={handleCycleCard}
            className="relative w-full max-w-sm h-72 cursor-pointer select-none group"
            title="Click to cycle engineering notebooks"
          >
            {CARDS.map((card, idx) => {
              const offset = (idx - activeCardIndex + CARDS.length) % CARDS.length;
              return (
                <motion.div
                  key={card.title}
                  animate={{
                    scale: 1 - offset * 0.05,
                    y: offset * 14,
                    zIndex: 10 - offset,
                    opacity: 1 - offset * 0.25,
                    rotate: (offset === 0 ? 0 : offset === 1 ? 4 : -4),
                  }}
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  className="absolute inset-0 rounded-2xl p-6 shadow-xl border bg-white dark:bg-neutral-900 flex flex-col justify-between"
                  style={{
                    borderColor: offset === 0 ? card.color : 'rgba(150, 150, 150, 0.2)',
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono tracking-widest uppercase mb-2">
                      <span className="font-semibold" style={{ color: card.color }}>{card.tag}</span>
                      <span className="text-neutral-400">{idx + 1} / {CARDS.length}</span>
                    </div>
                    <h4 className="text-lg font-serif font-bold text-neutral-900 dark:text-white">
                      {card.title}
                    </h4>
                    <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-300 font-sans leading-relaxed">
                      {card.body}
                    </p>
                  </div>

                  <div className="p-2 rounded bg-neutral-100 dark:bg-neutral-800 text-[10px] font-mono text-neutral-600 dark:text-neutral-300 truncate">
                    <code>{card.code}</code>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <span className="text-[11px] font-mono text-neutral-400 mt-4">
            Click card to flip notebook ({activeCardIndex + 1} of {CARDS.length})
          </span>
        </div>
      </div>

      {/* WHAT YOU CAN BUILD (High-Impact Solutions Section) */}
      <section className="mb-20 pt-8 border-t border-neutral-200/80 dark:border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono tracking-widest uppercase text-neutral-500 dark:text-neutral-400">
                WHAT YOU CAN BUILD • (2024 — 2026)
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif text-neutral-900 dark:text-neutral-100">
              End-to-End Architectural Solutions
            </h2>
          </div>
          <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 max-w-sm">
            Proven capabilities bridging dynamic web frontends, resilient enterprise backends, and local AI pipelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {WHAT_YOU_CAN_BUILD.map((item, idx) => {
            const isSelected = selectedBuildId === idx;
            return (
              <motion.div
                key={item.title}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                onClick={() => {
                  soundManager.playClick(800 + idx * 60);
                  setSelectedBuildId(isSelected ? null : idx);
                }}
                className={`p-7 rounded-3xl border transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-900 text-white dark:bg-neutral-800 dark:border-neutral-600 shadow-xl'
                    : 'bg-white dark:bg-neutral-900/90 border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-5">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                      isSelected
                        ? 'bg-white/10 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                    }`}
                  >
                    {idx === 0 && <Server className="w-5 h-5 text-indigo-500" />}
                    {idx === 1 && <Brain className="w-5 h-5 text-emerald-500" />}
                    {idx === 2 && <Smartphone className="w-5 h-5 text-sky-500" />}
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {item.metrics}
                  </span>
                </div>

                <h3
                  className={`text-xl font-serif font-bold mb-2 ${
                    isSelected ? 'text-white' : 'text-neutral-900 dark:text-white'
                  }`}
                >
                  {item.title}
                </h3>
                <p
                  className={`text-xs font-mono uppercase tracking-wider mb-4 ${
                    isSelected ? 'text-neutral-300' : 'text-indigo-600 dark:text-indigo-400'
                  }`}
                >
                  {item.subtitle}
                </p>

                <p
                  className={`text-sm font-sans leading-relaxed mb-6 ${
                    isSelected ? 'text-neutral-200' : 'text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  {item.description}
                </p>

                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex flex-wrap gap-1.5">
                  {item.stackHighlights.map((tech) => (
                    <span
                      key={tech}
                      className={`text-[11px] font-mono px-2.5 py-1 rounded-md ${
                        isSelected
                          ? 'bg-white/10 text-neutral-100 border border-white/20'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* PROGRAMMING LANGUAGES & CORE TECHNOLOGIES */}
      <section className="mb-20 pt-8 border-t border-neutral-200/80 dark:border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-mono tracking-widest uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
              PRODUCTION STACK • (2024 — 2026)
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-neutral-900 dark:text-neutral-100">
              Programming Languages & Core Technologies
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-neutral-800">
            {[
              { id: 'all', label: 'All (7)' },
              { id: 'languages', label: 'Languages' },
              { id: 'enterprise', label: 'Enterprise' },
              { id: 'data', label: 'Data & DBs' },
              { id: 'web', label: 'Web & API' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleFilterChange(tab.id as TechFilter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  techFilter === tab.id
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Technologies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTechnologies.map((tech) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              key={tech.name}
              className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-col justify-between hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                      {getTechIcon(tech.name)}
                    </div>
                    <div>
                      <h4 className="text-base font-serif font-bold text-neutral-900 dark:text-white">
                        {tech.name}
                      </h4>
                      <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                        {tech.role}
                      </p>
                    </div>
                  </div>
                  {tech.level && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                      {tech.level}
                    </span>
                  )}
                </div>

                <p className="text-xs text-neutral-600 dark:text-neutral-300 font-sans leading-relaxed my-4">
                  {tech.description}
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/80">
                <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-2">
                  Toolchain & Frameworks
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {tech.frameworks.map((fw) => (
                    <span
                      key={fw}
                      className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                    >
                      {fw}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CORE THEORIES & METHODOLOGIES */}
      <section className="mb-20 pt-8 border-t border-neutral-200/80 dark:border-neutral-800">
        <div className="mb-8">
          <span className="text-xs font-mono tracking-widest uppercase text-neutral-500 dark:text-neutral-400 block mb-1">
            SYSTEMS DISCIPLINE • THEORIES & PRACTICES
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif text-neutral-900 dark:text-neutral-100">
            Core Theories & Methodologies
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CORE_METHODOLOGIES.map((methodology) => (
            <div
              key={methodology.title}
              className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                  {getMethodologyIcon(methodology.title)}
                </div>
                <h4 className="text-base font-serif font-bold text-neutral-900 dark:text-white mb-1">
                  {methodology.title}
                </h4>
                <p className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 mb-3">
                  {methodology.discipline}
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 font-sans leading-relaxed mb-4">
                  {methodology.description}
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/80 space-y-1.5">
                {methodology.keyPractices.map((practice) => (
                  <div key={practice} className="flex items-center gap-2 text-[11px] font-mono text-neutral-600 dark:text-neutral-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span className="truncate">{practice}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Professional Experience Section */}
      <section className="pt-8 border-t border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1">
              CAREER TRAJECTORY & PROVEN EXECUTION
            </h3>
            <h2 className="text-3xl sm:text-4xl font-serif text-neutral-900 dark:text-neutral-100">
              Professional Experience
            </h2>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
            2024 — 2026 FOCUS
          </span>
        </div>

        {/* Experience Accordions */}
        <div className="space-y-4">
          {EXPERIENCE_ITEMS.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden transition-all duration-300 shadow-sm"
              >
                <button
                  onClick={() => handleToggleAccordion(item.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-lg font-serif font-bold text-neutral-900 dark:text-white">
                        {item.company}
                      </span>
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-neutral-900/5 dark:bg-indigo-500/10 border border-neutral-900/10 dark:border-indigo-500/20 text-neutral-800 dark:text-indigo-400">
                        {item.role}
                      </span>
                    </div>
                    <div className="mt-1 text-xs font-mono text-neutral-500 dark:text-neutral-400">
                      {item.period} • {item.location}
                    </div>
                  </div>

                  <div className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${
                        isExpanded ? 'rotate-180 text-neutral-900 dark:text-indigo-400' : ''
                      }`}
                    />
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-2 border-t border-neutral-100 dark:border-neutral-800/80 text-sm text-neutral-600 dark:text-neutral-300 space-y-3 font-sans">
                        <p className="font-medium text-neutral-800 dark:text-neutral-200">{item.summary}</p>
                        <ul className="space-y-2 list-disc pl-5 text-neutral-600 dark:text-neutral-400">
                          {item.bullets.map((b, bIdx) => (
                            <li key={bIdx} className="leading-relaxed">{b}</li>
                          ))}
                        </ul>
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

