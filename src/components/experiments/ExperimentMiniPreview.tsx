import React from 'react';

interface MiniPreviewProps {
  id: string;
  tool: string;
  color: string;
}

export const ExperimentMiniPreview: React.FC<MiniPreviewProps> = ({ id, color }) => {
  // Ultra-lightweight, hardware-accelerated SVG/CSS kinetic previews.
  // Consumes 0 WebGL contexts and 0 continuous JS loops, freeing 100% GPU/CPU for weaker devices.
  switch (id) {
    case 'prismatic-orb':
      return (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden bg-[#060810]">
          {/* Chromatic Dispersion Radial Glow */}
          <div
            className="absolute w-28 h-28 rounded-full blur-xl opacity-60 animate-pulse"
            style={{
              background: 'radial-gradient(circle, rgba(168,85,247,0.8) 0%, rgba(56,189,248,0.6) 50%, rgba(245,158,11,0.3) 100%)',
            }}
          />
          {/* Crystalline Refraction Geometry */}
          <svg className="w-24 h-24 relative z-10 animate-[spin_16s_linear_infinite]" viewBox="0 0 100 100">
            <polygon
              points="50,15 82,32 82,68 50,85 18,68 18,32"
              fill="rgba(99,102,241,0.18)"
              stroke="rgba(196,181,253,0.7)"
              strokeWidth="1.2"
            />
            <line x1="50" y1="15" x2="50" y2="85" stroke="rgba(216,180,254,0.6)" strokeWidth="0.8" />
            <line x1="18" y1="32" x2="82" y2="68" stroke="rgba(56,189,248,0.5)" strokeWidth="0.8" />
            <line x1="18" y1="68" x2="82" y2="32" stroke="rgba(244,114,182,0.5)" strokeWidth="0.8" />
            <circle cx="50" cy="50" r="14" fill="rgba(255,255,255,0.15)" stroke="#A78BFA" strokeWidth="1" />
          </svg>
        </div>
      );

    case 'fluid-field':
      return (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden bg-[#050711]">
          {/* Dynamic Fluid Vorticity Streamlines */}
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.4)_0%,transparent_70%)] animate-pulse" />
          <svg className="w-full h-full relative z-10 opacity-75" viewBox="0 0 200 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="fluidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <path
              d="M10,60 Q50,20 100,60 T190,60"
              fill="none"
              stroke="url(#fluidGrad)"
              strokeWidth="2.5"
              strokeDasharray="6,4"
              className="animate-[dash_8s_linear_infinite]"
            />
            <path
              d="M15,40 Q60,80 110,40 T185,40"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="1.8"
              strokeOpacity="0.7"
            />
            <path
              d="M20,80 Q70,40 120,80 T180,80"
              fill="none"
              stroke="#818CF8"
              strokeWidth="1.8"
              strokeOpacity="0.7"
            />
            {/* Center Vortex Pin */}
            <circle cx="100" cy="60" r="6" fill="#06B6D4" className="animate-ping opacity-75" />
            <circle cx="100" cy="60" r="3" fill="#FFFFFF" />
          </svg>
        </div>
      );

    case 'verlet-cloth':
      return (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden bg-[#060812]">
          <div className="absolute w-24 h-24 rounded-full blur-xl opacity-40 bg-emerald-500" />
          <svg className="w-32 h-24 relative z-10" viewBox="0 0 120 90">
            {/* Hanging constraint pins */}
            <circle cx="20" cy="15" r="3" fill="#34D399" />
            <circle cx="60" cy="15" r="3" fill="#34D399" />
            <circle cx="100" cy="15" r="3" fill="#34D399" />
            {/* Tensile lattice grid */}
            {[20, 40, 60, 80, 100].map((x) => (
              <line
                key={`v-${x}`}
                x1={x}
                y1={15}
                x2={x + (x === 60 ? 0 : x < 60 ? 4 : -4)}
                y2={75}
                stroke="rgba(52,211,153,0.5)"
                strokeWidth="1.2"
              />
            ))}
            {[15, 35, 55, 75].map((y) => (
              <path
                key={`h-${y}`}
                d={`M20,${y} Q60,${y + 8} 100,${y}`}
                fill="none"
                stroke="rgba(16,185,129,0.7)"
                strokeWidth="1.2"
              />
            ))}
            {/* Interactive displacement marker */}
            <circle cx="60" cy="45" r="4" fill="#6EE7B7" className="animate-pulse" />
          </svg>
        </div>
      );

    case 'ascii-matrix':
      return (
        <div className="w-full h-full relative flex flex-col items-center justify-center overflow-hidden bg-[#04060A] font-mono select-none px-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.25)_0%,transparent_70%)]" />
          <div className="text-[10px] leading-tight text-neutral-500 space-y-0.5 text-center relative z-10">
            <div className="text-indigo-400 font-bold">1 0 λ Ω ∂ ∇ ✦ 1 0</div>
            <div className="text-indigo-300">∂ ∇ • • ✦ • • ∂ ∇</div>
            <div className="text-white font-bold tracking-widest text-[11px] animate-pulse">
              λ Ω 1 0 1 0 Ω λ
            </div>
            <div className="text-neutral-400">∫ ∑ • ✦ ✦ • ∑ ∫</div>
            <div className="text-indigo-400 font-bold">0 1 ∂ ∇ Ω λ ✦ 0 1</div>
          </div>
        </div>
      );

    case 'spatial-gyro':
      return (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden bg-[#070914]">
          <div className="absolute w-28 h-28 rounded-full blur-xl opacity-40 bg-amber-500" />
          <svg className="w-24 h-24 relative z-10" viewBox="0 0 100 100">
            {/* Outer Gimbal Ring */}
            <ellipse
              cx="50"
              cy="50"
              rx="42"
              ry="24"
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="1.5"
              className="animate-[spin_8s_linear_infinite]"
              style={{ transformOrigin: '50px 50px' }}
            />
            {/* Middle Gimbal Ring */}
            <ellipse
              cx="50"
              cy="50"
              rx="32"
              ry="18"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="1.6"
              className="animate-[spin_6s_linear_infinite_reverse]"
              style={{ transformOrigin: '50px 50px' }}
            />
            {/* Inner Fast Flywheel Core */}
            <circle cx="50" cy="50" r="10" fill="rgba(245,158,11,0.2)" stroke="#FBBF24" strokeWidth="1.8" />
            <circle cx="50" cy="50" r="4" fill="#FFFFFF" className="animate-ping" />
          </svg>
        </div>
      );

    case 'harmonic-oscillator':
      return (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden bg-[#060814]">
          <div className="absolute w-32 h-16 rounded-full blur-xl opacity-35 bg-indigo-500" />
          <svg className="w-full h-24 relative z-10 px-2" viewBox="0 0 160 80">
            <defs>
              <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="50%" stopColor="#EC4899" />
                <stop offset="100%" stopColor="#38BDF8" />
              </linearGradient>
            </defs>
            {/* Wave 1 */}
            <path
              d="M0,40 Q20,15 40,40 T80,40 T120,40 T160,40"
              fill="none"
              stroke="url(#waveGrad)"
              strokeWidth="2.2"
            />
            {/* Wave 2 (Harmonic overtone) */}
            <path
              d="M0,40 Q10,25 20,40 T40,40 T60,40 T80,40 T100,40 T120,40 T140,40 T160,40"
              fill="none"
              stroke="rgba(129,140,248,0.5)"
              strokeWidth="1.2"
              strokeDasharray="4,3"
            />
            {/* Wave 3 (Resonance envelope) */}
            <path
              d="M0,40 Q40,65 80,40 T160,40"
              fill="none"
              stroke="rgba(56,189,248,0.6)"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      );

    default:
      return (
        <div className="w-full h-full flex items-center justify-center bg-neutral-950">
          <div className="w-12 h-12 rounded-full blur-md opacity-70" style={{ backgroundColor: color }} />
        </div>
      );
  }
};
