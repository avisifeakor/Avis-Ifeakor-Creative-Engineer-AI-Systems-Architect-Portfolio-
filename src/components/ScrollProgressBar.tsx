import React from 'react';
import { motion, useScroll, useSpring } from 'motion/react';

interface ScrollProgressBarProps {
  isDark?: boolean;
}

export const ScrollProgressBar: React.FC<ScrollProgressBarProps> = ({ isDark = false }) => {
  const { scrollYProgress } = useScroll();

  // Smooth out scroll progression using spring physics for organic feel
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 32,
    restDelta: 0.0005,
  });

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] h-[2.5px] pointer-events-none select-none bg-neutral-900/[0.06] dark:bg-white/[0.06]"
      aria-hidden="true"
      id="scroll-progress-container"
    >
      {/* Subtle slim progress bar */}
      <motion.div
        className={`h-full w-full origin-left relative ${
          isDark
            ? 'bg-gradient-to-r from-indigo-600 via-indigo-400 to-cyan-300 shadow-[0_0_10px_rgba(99,102,241,0.5)]'
            : 'bg-gradient-to-r from-neutral-950 via-neutral-800 to-neutral-600 shadow-[0_1px_4px_rgba(0,0,0,0.12)]'
        }`}
        style={{ scaleX }}
        id="scroll-progress-indicator"
      >
        {/* Subtle luminous tip at the leading edge */}
        <div
          className={`absolute right-0 top-1/2 -translate-y-1/2 w-3 h-2 rounded-full blur-[1.5px] ${
            isDark ? 'bg-cyan-200/90' : 'bg-neutral-400/80'
          }`}
        />
      </motion.div>
    </div>
  );
};
