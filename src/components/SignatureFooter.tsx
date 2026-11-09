import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Terminal, Sparkles, Send, Github, Linkedin, MessageCircle } from 'lucide-react';
import { PERSONAL_INFO } from '../constants/portfolioData';
import { soundManager } from '../lib/soundEffects';

interface SignatureFooterProps {
  onOpenContact: () => void;
}

export const SignatureFooter: React.FC<SignatureFooterProps> = ({ onOpenContact }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Interactive Particle Horizon
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;
    const ripples: { x: number; y: number; r: number; opacity: number }[] = [];

    const handleCanvasClick = (e: MouseEvent) => {
      soundManager.playClick(1050);
      const rect = canvas.getBoundingClientRect();
      ripples.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        r: 2,
        opacity: 0.9,
      });
    };

    canvas.addEventListener('click', handleCanvasClick);

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const points = 48;

      // Draw wave ribbons
      for (let w = 0; w < 3; w++) {
        ctx.beginPath();
        ctx.moveTo(0, height);

        for (let i = 0; i <= points; i++) {
          const x = (i / points) * width;
          const frequency = 0.015 + w * 0.005;
          const y =
            height * 0.55 +
            Math.sin(x * frequency + time + w * 1.5) * (18 + w * 6) +
            Math.cos(time * 0.8 + i * 0.2) * 8;

          if (i === 0) {
            ctx.lineTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        const colors = [
          'rgba(99, 102, 241, 0.08)',
          'rgba(168, 85, 247, 0.06)',
          'rgba(56, 189, 248, 0.05)',
        ];
        ctx.fillStyle = colors[w];
        ctx.fill();
      }

      // Draw ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.r += 2.5;
        r.opacity *= 0.96;

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(129, 140, 248, ${r.opacity})`;
        if (r.opacity < 0.02) {
          ripples.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(render);
    };

    let isVisible = false;
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animId) {
          render();
        } else if (!isVisible && animId) {
          cancelAnimationFrame(animId);
          animId = 0;
        }
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(canvas);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      intersectionObserver.disconnect();
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, []);

  return (
    <footer className="relative pt-24 sm:pt-32 pb-12 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-100/30 dark:bg-neutral-950/60 overflow-hidden">
      {/* Interactive Kinetic Horizon Wave Canvas */}
      <div className="absolute inset-x-0 bottom-0 h-44 pointer-events-auto opacity-70">
        <canvas
          ref={canvasRef}
          width={1200}
          height={180}
          data-cursor="sound"
          data-cursor-text="SOUND / RESONATE"
          className="w-full h-full cursor-pointer"
          title="Click to emit harmonic shockwaves"
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/5 dark:bg-indigo-500/10 border border-neutral-900/10 dark:border-indigo-500/20 text-neutral-800 dark:text-indigo-400 text-xs font-mono uppercase tracking-widest mb-6">
          <span>CURRENTLY BOOKING FOR Q3 / Q4 2026</span>
        </div>

        <h2 data-cursor="read" className="text-4xl sm:text-6xl md:text-7xl font-serif text-neutral-900 dark:text-white tracking-tight leading-[1.08]">
          Let's engineer something that shifts perception.
        </h2>

        <p className="mt-6 text-base sm:text-lg text-neutral-600 dark:text-neutral-300 font-sans max-w-2xl mx-auto leading-relaxed">
          Whether you require a flagship digital experience, a high-performance WebGL platform, or a unified spring-physics design system.
        </p>

        {/* Action Button & Social Quick Links */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <button
            data-cursor="open"
            data-cursor-text="OPEN"
            onClick={() => {
              soundManager.playClick();
              onOpenContact();
            }}
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 font-mono text-xs uppercase tracking-widest font-semibold shadow-xl shadow-neutral-950/10 dark:shadow-indigo-500/25 active:scale-95 transition-all"
            id="footer-inquire-button"
          >
            <Send className="w-3.5 h-3.5" />
            <span>START A CONVERSATION</span>
          </button>

          <a
            href="https://github.com/avisifeakor"
            target="_blank"
            rel="noreferrer"
            data-cursor="open"
            data-cursor-text="GITHUB"
            onClick={() => soundManager.playClick()}
            className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-white/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white hover:border-neutral-400 dark:hover:border-neutral-600 font-mono text-xs uppercase tracking-wider font-medium shadow-sm transition-all active:scale-95"
            id="footer-github-button"
          >
            <Github className="w-4 h-4" />
            <span>GITHUB</span>
            <ArrowUpRight className="w-3 h-3 opacity-60" />
          </a>

          <a
            href="https://linkedin.com/in/avisifeakor"
            target="_blank"
            rel="noreferrer"
            data-cursor="open"
            data-cursor-text="LINKEDIN"
            onClick={() => soundManager.playClick()}
            className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-white/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white hover:border-neutral-400 dark:hover:border-neutral-600 font-mono text-xs uppercase tracking-wider font-medium shadow-sm transition-all active:scale-95"
            id="footer-linkedin-button"
          >
            <Linkedin className="w-4 h-4 text-[#0A66C2]" />
            <span>LINKEDIN</span>
            <ArrowUpRight className="w-3 h-3 opacity-60" />
          </a>

          <a
            href="https://wa.me/2348150675245"
            target="_blank"
            rel="noreferrer"
            data-cursor="open"
            data-cursor-text="WHATSAPP"
            onClick={() => soundManager.playClick()}
            className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500 font-mono text-xs uppercase tracking-wider font-medium shadow-sm transition-all active:scale-95"
            id="footer-whatsapp-button"
          >
            <MessageCircle className="w-4 h-4 text-emerald-500" />
            <span>WHATSAPP (+234 815 067 5245)</span>
            <ArrowUpRight className="w-3 h-3 opacity-60" />
          </a>
        </div>

        <div className="mt-8 text-xs font-mono text-neutral-500 dark:text-neutral-400">
          Click the bottom horizon to pulse the harmonic wave canvas
        </div>
      </div>

      {/* Bottom Bar: Credentials & Social Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-20 pt-8 border-t border-neutral-200/60 dark:border-neutral-800/60 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-neutral-500 dark:text-neutral-400 gap-4 relative z-10">
        <div>
          <span>{PERSONAL_INFO.name} — {PERSONAL_INFO.title}</span>
        </div>

        <div className="flex items-center gap-6">
          {PERSONAL_INFO.socials.map((s) => (
            <a
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="hover:text-neutral-900 dark:hover:text-white flex items-center gap-1.5 transition-colors"
            >
              {s.label === 'GitHub' ? (
                <Github className="w-3.5 h-3.5" />
              ) : s.label === 'LinkedIn' ? (
                <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
              ) : s.label === 'WhatsApp' ? (
                <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
              ) : null}
              <span>{s.label}</span>
              <ArrowUpRight className="w-3 h-3 opacity-60" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};
