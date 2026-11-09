import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { Quote, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { TESTIMONIALS } from '../constants/portfolioData';
import { soundManager } from '../lib/soundEffects';

export const TestimonialsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const isSectionInView = useInView(sectionRef, { once: true, amount: 0.12, margin: '-60px 0px' });

  const handleNext = () => {
    soundManager.playClick();
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const handlePrev = () => {
    soundManager.playClick();
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const current = TESTIMONIALS[currentIndex];

  return (
    <motion.section
      ref={sectionRef}
      id="testimonials"
      initial={{ opacity: 0, y: 36 }}
      animate={isSectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      className="py-20 sm:py-28 max-w-5xl mx-auto px-4 sm:px-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isSectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-10"
      >
        <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
          TESTIMONIALS
        </span>
        <h2 data-cursor="read" className="text-3xl sm:text-4xl font-serif text-neutral-900 dark:text-neutral-100 mt-2">
          In their words
        </h2>
      </motion.div>

      {/* Featured Testimonial Card */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={isSectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
        transition={{ duration: 0.7, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="relative p-8 sm:p-12 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xl overflow-hidden"
      >
        {/* Quote Icon Medallion */}
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mb-6">
          <Quote className="w-6 h-6" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-6"
          >
            <p data-cursor="read" className="text-lg sm:text-xl md:text-2xl font-serif font-light text-neutral-800 dark:text-neutral-200 leading-relaxed">
              "{current.quote}"
            </p>

            <div className="flex items-center gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-500 dark:text-neutral-400 shrink-0">
                <User className="w-6 h-6 opacity-75" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 font-serif">
                    Anonymous Client
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200/80 dark:border-neutral-700 font-medium">
                    Confidential
                  </span>
                </div>
                <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Verified Client Feedback • Production Reference #{currentIndex + 1}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Arrows & Dots */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            {TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  soundManager.playClick();
                  setCurrentIndex(idx);
                }}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === idx
                    ? 'w-6 bg-neutral-900 dark:bg-white'
                    : 'w-2 bg-neutral-300 dark:bg-neutral-700'
                }`}
                title={`View testimonial ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              data-cursor="interact"
              data-cursor-text="INTERACT"
              onClick={handlePrev}
              className="p-2 rounded-full border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
              title="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              data-cursor="interact"
              data-cursor-text="INTERACT"
              onClick={handleNext}
              className="p-2 rounded-full border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
              title="Next testimonial"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
};
