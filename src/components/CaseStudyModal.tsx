import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Quote, ExternalLink, Code2, Layers, User } from 'lucide-react';
import { Project } from '../types';
import { modalBackdropVariants, modalContentVariants } from '../lib/animationVariants';
import { soundManager } from '../lib/soundEffects';

interface CaseStudyModalProps {
  project: Project | null;
  onClose: () => void;
}

export const CaseStudyModal: React.FC<CaseStudyModalProps> = ({ project, onClose }) => {
  // ESC key listener and body scroll locking (only when project is active)
  useEffect(() => {
    if (!project) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow || '';
      document.body.style.paddingRight = originalPaddingRight || '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden overscroll-contain select-none"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {/* Backdrop */}
        <motion.div
          variants={modalBackdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="fixed inset-0 bg-neutral-950/60 dark:bg-black/80 backdrop-blur-sm cursor-pointer pointer-events-auto"
        />

        {/* Modal Window Container */}
        <motion.div
          variants={modalContentVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto overscroll-contain rounded-3xl bg-[#FBF9F4] dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 sm:p-10 my-auto text-neutral-900 dark:text-neutral-100"
          id="case-study-modal"
        >
          {/* Close Button */}
          <button
            data-cursor="interact"
            data-cursor-text="CLOSE"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="absolute top-6 right-6 p-2 rounded-full bg-neutral-200/80 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
            id="modal-close-button"
            title="Close modal (Esc)"
          >
            <X className="w-5 h-5 text-neutral-700 dark:text-neutral-200" />
          </button>

          {/* Header & Meta */}
          <div className="border-b border-neutral-200 dark:border-neutral-800 pb-6 mb-8">
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-3">
              <span className="px-2.5 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800 font-semibold text-neutral-700 dark:text-neutral-300">
                {project.caseStudy.heroTag}
              </span>
              <span>•</span>
              <span>Client: {project.client}</span>
              <span>•</span>
              <span>Year: {project.year}</span>
            </div>

            <h2 data-cursor="read" className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium tracking-tight text-neutral-950 dark:text-white">
              {project.title}
            </h2>
            <p className="mt-2 text-base sm:text-lg text-neutral-600 dark:text-neutral-300 font-sans leading-relaxed">
              {project.caseStudy.summary}
            </p>
          </div>

          {/* Impact Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {project.caseStudy.metrics.map((metric, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/80"
              >
                <div className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 dark:text-neutral-50">
                  {metric.value}
                </div>
                <div className="text-xs font-mono text-neutral-500 dark:text-neutral-400 mt-1">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>

          {/* Narrative: Challenge & Solution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="p-6 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider mb-2">
                <Layers className="w-4 h-4" />
                <span>The Challenge</span>
              </div>
              <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                {project.caseStudy.challenge}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>The Architectural Solution</span>
              </div>
              <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                {project.caseStudy.solution}
              </p>
            </div>
          </div>

          {/* Deliverables & Tech Stack */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 border-t border-neutral-200 dark:border-neutral-800 pt-8">
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-4 font-bold">
                Key Deliverables
              </h4>
              <ul className="space-y-2.5">
                {project.caseStudy.deliverables.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-neutral-700 dark:text-neutral-300">
                    <CheckCircle2 className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-4 font-bold flex items-center gap-2">
                <Code2 className="w-4 h-4" />
                <span>Technologies & Systems</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {project.caseStudy.techStack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-full text-xs font-mono bg-neutral-200/80 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300/60 dark:border-neutral-700"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Testimonial Quote if present */}
          {project.caseStudy.testimonial && (
            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-800/90 border border-neutral-200 dark:border-neutral-700 relative">
              <Quote className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mb-2" />
              <p className="text-base font-serif italic text-neutral-800 dark:text-neutral-200 leading-relaxed">
                "{project.caseStudy.testimonial.quote}"
              </p>
              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-700/60 flex items-center justify-between text-xs font-mono text-neutral-500 dark:text-neutral-400">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 flex items-center justify-center text-neutral-500 dark:text-neutral-400">
                    <User className="w-3.5 h-3.5 opacity-75" />
                  </div>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">Anonymous Client</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700/80 text-neutral-500 dark:text-neutral-400 border border-neutral-200/80 dark:border-neutral-600">
                  Verified Production Review
                </span>
              </div>
            </div>
          )}

          {/* Bottom Close action */}
          <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="px-6 py-2.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs font-mono uppercase tracking-wider font-semibold hover:opacity-90 transition-opacity"
            >
              Done Reading
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
