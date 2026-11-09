import React from 'react';

const CLIENTS = [
  { name: 'AETHERIA LABS', tag: 'Spatial Computing' },
  { name: 'HYPERION PROTOCOL', tag: 'Algorithmic FinTech' },
  { name: 'VERVE SOUND', tag: 'Audio DSP' },
  { name: 'PRISMA GRAPHICS', tag: 'Real-time WebGL' },
  { name: 'MONOLITH SYSTEMS', tag: 'Distributed UI' },
  { name: 'KINESIS MOTION', tag: 'Physics Runtime' },
  { name: 'NEXUS DESIGN LAB', tag: 'Generative Systems' },
];

export const ClientMarquee: React.FC = () => {
  return (
    <section className="py-12 border-y border-stone-300/70 dark:border-neutral-800/80 bg-stone-200/40 dark:bg-neutral-900/40 backdrop-blur-sm overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mb-4 flex items-center justify-between text-[11px] font-mono tracking-widest uppercase text-stone-600 dark:text-neutral-400 font-medium">
        <span>COLLABORATORS & SELECT COMMISSIONS</span>
        <span>2019 — 2026</span>
      </div>

      <div className="relative w-full flex overflow-x-hidden">
        {/* Continuous Marquee Rail 1 */}
        <div className="flex shrink-0 animate-marquee items-center gap-12 sm:gap-16 pr-12 sm:pr-16">
          {CLIENTS.map((client, i) => (
            <div
              key={`client-1-${i}`}
              className="flex items-center gap-3 group opacity-75 hover:opacity-100 transition-opacity cursor-default"
            >
              <span className="text-sm sm:text-base font-mono tracking-wider font-semibold text-neutral-800 dark:text-neutral-200">
                {client.name}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-200/60 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                {client.tag}
              </span>
            </div>
          ))}
        </div>

        {/* Duplicate Rail 2 for infinite seamless loop */}
        <div className="flex shrink-0 animate-marquee2 items-center gap-12 sm:gap-16 pr-12 sm:pr-16" aria-hidden="true">
          {CLIENTS.map((client, i) => (
            <div
              key={`client-2-${i}`}
              className="flex items-center gap-3 group opacity-75 hover:opacity-100 transition-opacity cursor-default"
            >
              <span className="text-sm sm:text-base font-mono tracking-wider font-semibold text-neutral-800 dark:text-neutral-200">
                {client.name}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-200/60 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                {client.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
