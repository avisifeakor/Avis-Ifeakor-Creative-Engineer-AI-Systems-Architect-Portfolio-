import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { soundManager } from '../lib/soundEffects';

interface AnimatedBackgroundSunProps {
  isDark: boolean;
}

export const AnimatedBackgroundSun: React.FC<AnimatedBackgroundSunProps> = ({ isDark }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasTriggeredApogee, setHasTriggeredApogee] = useState(false);
  const [manualPulse, setManualPulse] = useState(false);
  const rafId = useRef<number | null>(null);
  const targetProgress = useRef(0);
  const currentProgress = useRef(0);

  useEffect(() => {
    let isLoopRunning = false;

    const updateLerp = () => {
      const diff = targetProgress.current - currentProgress.current;
      if (Math.abs(diff) > 0.0008) {
        currentProgress.current += diff * 0.09;
        setScrollProgress(currentProgress.current);

        // Trigger apogee sound / event when reaching 50%
        const apogeeDiff = Math.abs(currentProgress.current - 0.5);
        if (apogeeDiff < 0.035 && !hasTriggeredApogee) {
          setHasTriggeredApogee(true);
          soundManager.playClick(880);
        } else if (apogeeDiff > 0.09 && hasTriggeredApogee) {
          setHasTriggeredApogee(false);
        }

        rafId.current = requestAnimationFrame(updateLerp);
      } else {
        currentProgress.current = targetProgress.current;
        setScrollProgress(targetProgress.current);
        isLoopRunning = false;
        rafId.current = null;
      }
    };

    const requestUpdate = () => {
      if (!isLoopRunning) {
        isLoopRunning = true;
        rafId.current = requestAnimationFrame(updateLerp);
      }
    };

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      targetProgress.current = Math.min(Math.max(scrollY / maxScroll, 0), 1);
      requestUpdate();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
      isLoopRunning = false;
    };
  }, [hasTriggeredApogee]);

  // Compute position and scale based on scroll ratio
  // Phase 1 (0 -> 0.5): Sun starts at top-right (x: 76%, y: 22%), moves to center (x: 50%, y: 48%), scale from 1.0 -> 2.7
  // Phase 2 (0.5 -> 1.0): At 0.5, solar event happens. Past 0.5, sun drifts to lower left horizon (x: 50% -> 25%, y: 48% -> 78%), scale settles to 1.3
  const p = scrollProgress;
  let posX = 76;
  let posY = 22;
  let scale = 1.0;
  let isAtZenith = false;

  if (p <= 0.5) {
    const t = p / 0.5; // 0 to 1
    // Ease out cubic
    const easedT = 1 - Math.pow(1 - t, 3);
    posX = 76 - easedT * 26; // 76% -> 50%
    posY = 22 + easedT * 26; // 22% -> 48%
    scale = 1.0 + easedT * 1.75; // 1.0 -> 2.75
    isAtZenith = t > 0.88;
  } else {
    const t = (p - 0.5) / 0.5; // 0 to 1
    const easedT = t * t;
    posX = 50 - easedT * 25; // 50% -> 25%
    posY = 48 + easedT * 30; // 48% -> 78%
    scale = 2.75 - easedT * 1.45; // 2.75 -> 1.3
    isAtZenith = t < 0.12;
  }

  const handleSunClick = () => {
    soundManager.playClick(1046);
    setManualPulse(true);
    setTimeout(() => setManualPulse(false), 1200);
  };

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Dynamic Background Atmospheric Radiance based on Sun Proximity */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background: isDark
            ? `radial-gradient(circle at ${posX}% ${posY}%, rgba(99, 102, 241, ${0.12 + (scale - 1) * 0.08}) 0%, rgba(245, 158, 11, ${0.05 + (scale - 1) * 0.04}) 40%, transparent 70%)`
            : `radial-gradient(circle at ${posX}% ${posY}%, rgba(251, 191, 36, ${0.22 + (scale - 1) * 0.12}) 0%, rgba(249, 115, 22, ${0.1 + (scale - 1) * 0.06}) 35%, rgba(244, 239, 230, 0) 70%)`,
        }}
      />

      {/* The 2D Sun Assembly */}
      <div
        className="absolute transition-transform will-change-transform pointer-events-auto cursor-pointer group"
        style={{
          left: `${posX}%`,
          top: `${posY}%`,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
        onClick={handleSunClick}
        title="Click to pulse solar corona"
      >
        {/* Expanding Apogee Shockwave Rings at 50% or on click */}
        {(isAtZenith || manualPulse) && (
          <>
            <motion.div
              initial={{ scale: 0.8, opacity: 0.9 }}
              animate={{ scale: 3.2, opacity: 0 }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
              className={`absolute -inset-10 rounded-full border-2 ${
                isDark ? 'border-indigo-400/60' : 'border-amber-500/70'
              }`}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0.8 }}
              animate={{ scale: 4.5, opacity: 0 }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeOut', delay: 0.6 }}
              className={`absolute -inset-10 rounded-full border ${
                isDark ? 'border-purple-400/40' : 'border-orange-400/50'
              }`}
            />
          </>
        )}

        {/* Outer Solar Flare Corona Bloom */}
        <div
          className={`absolute -inset-14 rounded-full blur-2xl transition-opacity duration-500 ${
            isDark
              ? 'bg-gradient-to-tr from-indigo-600/30 via-purple-500/25 to-amber-500/20 group-hover:opacity-100 opacity-70'
              : 'bg-gradient-to-tr from-amber-400/40 via-orange-400/35 to-yellow-300/30 group-hover:opacity-100 opacity-80'
          }`}
        />

        {/* SVG 2D Geometric Solar Ray Wheel */}
        <svg
          width="180"
          height="180"
          viewBox="0 0 180 180"
          className="relative z-10 w-36 h-36 sm:w-44 sm:h-44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Animated Rotating Astrolabe Ray Ring (Slow Clockwise) */}
          <g className="animate-[spin_40s_linear_infinite] origin-center">
            {/* Concentric Coordinate Dashes */}
            <circle
              cx="90"
              cy="90"
              r="82"
              stroke={isDark ? 'rgba(165, 180, 252, 0.25)' : 'rgba(217, 119, 6, 0.35)'}
              strokeWidth="1"
              strokeDasharray="4 6"
            />
            {/* 16 Radial Ray Spikes */}
            {Array.from({ length: 16 }).map((_, i) => {
              const angle = (i * 360) / 16;
              const isMajor = i % 2 === 0;
              const len = isMajor ? 18 : 10;
              const width = isMajor ? 2 : 1;
              return (
                <line
                  key={i}
                  x1="90"
                  y1={90 - 64}
                  x2="90"
                  y2={90 - 64 - len}
                  transform={`rotate(${angle} 90 90)`}
                  stroke={
                    isDark
                      ? isMajor
                        ? 'rgba(199, 210, 254, 0.7)'
                        : 'rgba(165, 180, 252, 0.4)'
                      : isMajor
                        ? 'rgba(245, 158, 11, 0.85)'
                        : 'rgba(251, 191, 36, 0.6)'
                  }
                  strokeWidth={width}
                  strokeLinecap="round"
                />
              );
            })}
          </g>

          {/* Counter-Rotating Inner Astrolabe Ring (Counter-Clockwise) */}
          <g className="animate-[spin_25s_linear_infinite_reverse] origin-center">
            <circle
              cx="90"
              cy="90"
              r="60"
              stroke={isDark ? 'rgba(192, 132, 252, 0.35)' : 'rgba(249, 115, 22, 0.45)'}
              strokeWidth="1.2"
              strokeDasharray="8 4 2 4"
            />
          </g>

          {/* Central Sun Disc with Radial Gradient Core */}
          <defs>
            <radialGradient id="solarCoreGradLight" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="45%" stopColor="#F59E0B" />
              <stop offset="90%" stopColor="#EA580C" />
              <stop offset="100%" stopColor="#C2410C" />
            </radialGradient>
            <radialGradient id="solarCoreGradDark" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#DDD6FE" />
              <stop offset="40%" stopColor="#818CF8" />
              <stop offset="80%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#1E1B4B" />
            </radialGradient>
            <filter id="solarGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Sun Disc Core */}
          <circle
            cx="90"
            cy="90"
            r="44"
            fill={isDark ? 'url(#solarCoreGradDark)' : 'url(#solarCoreGradLight)'}
            filter="url(#solarGlow)"
            className="transition-transform duration-300 group-hover:scale-105 origin-center"
          />

          {/* Sun Interior Surface Details / Concentric Orbit Flares */}
          <circle
            cx="90"
            cy="90"
            r="38"
            stroke={isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.45)'}
            strokeWidth="1"
            strokeDasharray="12 6"
          />
          <circle
            cx="90"
            cy="90"
            r="26"
            stroke={isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.5)'}
            strokeWidth="1.5"
          />
          <circle
            cx="80"
            cy="80"
            r="6"
            fill={isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.7)'}
          />
        </svg>

      </div>
    </div>
  );
};
