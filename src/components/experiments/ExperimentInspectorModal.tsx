import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Maximize2, Minimize2, Code2, Sliders, Cpu, Activity, Sparkles, Terminal } from 'lucide-react';
import { PlaygroundVignette } from '../../types';
import { soundManager } from '../../lib/soundEffects';
import { PrismaticRefractionEngine } from './PrismaticRefractionEngine';
import { NavierStokesFluidEngine } from './NavierStokesFluidEngine';
import { VerletClothEngine } from './VerletClothEngine';
import { KineticAsciiEngine } from './KineticAsciiEngine';
import { GeodesicGyroscopeEngine } from './GeodesicGyroscopeEngine';
import { HarmonicWaveformEngine } from './HarmonicWaveformEngine';

interface InspectorModalProps {
  vignette: PlaygroundVignette | null;
  onClose: () => void;
}

export const ExperimentInspectorModal: React.FC<InspectorModalProps> = ({ vignette, onClose }) => {
  const [activeTab, setActiveTab] = useState<'simulator' | 'math' | 'spec'>('simulator');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Lock body scroll and isolate interactions exclusively to this modal (only when vignette is active)
  useEffect(() => {
    if (!vignette) return;

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
  }, [vignette, onClose]);

  if (!vignette) return null;

  const renderActiveSimulation = () => {
    switch (vignette.id) {
      case 'prismatic-orb':
        return <PrismaticRefractionEngine isInteractive={true} mini={false} />;
      case 'fluid-field':
        return <NavierStokesFluidEngine isInteractive={true} mini={false} />;
      case 'verlet-cloth':
        return <VerletClothEngine isInteractive={true} mini={false} />;
      case 'ascii-matrix':
        return <KineticAsciiEngine isInteractive={true} mini={false} />;
      case 'spatial-gyro':
        return <GeodesicGyroscopeEngine isInteractive={true} mini={false} />;
      case 'harmonic-oscillator':
        return <HarmonicWaveformEngine isInteractive={true} mini={false} />;
      default:
        return null;
    }
  };

  const getMathematicalFormulation = () => {
    switch (vignette.id) {
      case 'prismatic-orb':
        return {
          title: "Cauchy's Dispersion & Snell-Descartes Refraction",
          equation: "n(λ) = A + B / λ²",
          secondaryEq: "R(θ) = R₀ + (1 - R₀)(1 - cos θ)⁵",
          summary:
            "Computing wavelength-dependent refractive indices across RGB channels (λ_red = 700nm, λ_green = 546nm, λ_blue = 436nm) creating spectral caustics and chromatic dispersion through internal reflection bounces.",
          code: `// GLSL Cauchy Spectral Dispersion
float etaR = 1.0 / (u_ior - u_dispersion);
float etaG = 1.0 / u_ior;
float etaB = 1.0 / (u_ior + u_dispersion);

vec3 rayR = refract(eyeVector, normal, etaR);
vec3 rayG = refract(eyeVector, normal, etaG);
vec3 rayB = refract(eyeVector, normal, etaB);

// Fresnel Schlick Factor
float F0 = pow((1.0 - u_ior) / (1.0 + u_ior), 2.0);
float fresnel = F0 + (1.0 - F0) * pow(1.0 - dot(-eyeVector, normal), 5.0);`,
        };
      case 'fluid-field':
        return {
          title: 'Navier-Stokes Incompressible Eulerian Flow',
          equation: '∂u/∂t + (u · ∇)u = -(1/ρ)∇p + ν∇²u + f',
          secondaryEq: '∇ · u = 0  (Incompressibility Constraint)',
          summary:
            "Eulerian fluid dynamics solved via operator splitting: Semi-Lagrangian velocity advection, Jacobi relaxation for the Poisson pressure equation, and vorticity confinement to maintain turbulent smoke swirls.",
          code: `// Navier-Stokes Projection & Incompressibility
// Poisson equation: ∇²p = ∇ · u
for (int k = 0; k < 18; k++) {
  p[x, y] = (div[x, y] + p[x-1,y] + p[x+1,y] + p[x,y-1] + p[x,y+1]) * 0.25;
}

// Subtract pressure gradient
u[x, y] -= 0.5 * (p[x+1, y] - p[x-1, y]) * gridWidth;
v[x, y] -= 0.5 * (p[x, y+1] - p[x, y-1]) * gridHeight;`,
        };
      case 'verlet-cloth':
        return {
          title: 'Verlet Constraint Particle Dynamics',
          equation: 'x(t + Δt) = 2x(t) - x(t - Δt) + a(t)Δt²',
          secondaryEq: 'Δx = 0.5 * (|x₂ - x₁| - L₀) * (x₂ - x₁) / |x₂ - x₁|',
          summary:
            'Point-mass physics solved with position-based dynamics. Tensile stress across structural and shear constraints is resolved through iterative Jacobi relaxation, supporting interactive cutting and tearing.',
          code: `// Verlet Particle Step
vec2 velocity = (p.pos - p.prevPos) * damping;
p.prevPos = p.pos;
p.pos += velocity + (gravity + windTurbulence) * dt * dt;

// Constraint Relaxation Loop
float dist = distance(p1.pos, p2.pos);
if (dist > maxTearDistance) {
  constraint.broken = true; // Interactive mesh tear
} else {
  vec2 delta = 0.5 * (dist - restLength) * normalize(p2.pos - p1.pos);
  p1.pos += delta;
  p2.pos -= delta;
}`,
        };
      case 'ascii-matrix':
        return {
          title: 'Typographic Luminance Halftone Quantization',
          equation: 'L(x, y) = 0.2126R + 0.7152G + 0.0722B',
          secondaryEq: 'glyph = Ramp[ ⌊ L(x, y) · |Ramp| ⌋ ]',
          summary:
            'High-frequency procedural SDF rasterizer converting continuous 3D lighting gradients into discrete monospace character matrices with sub-pixel kinetic displacement.',
          code: `// ASCII Density Quantization
float luminance = dot(pixelColor.rgb, vec3(0.2126, 0.7152, 0.0722));
int rampIndex = int(clamp(luminance, 0.0, 0.99) * float(glyphCount));
char glyph = asciiRamp[rampIndex];

// Sub-pixel magnetic vector perturbation
vec2 delta = mousePos - cellPos;
if (length(delta) < radius) {
  luminance += (1.0 - length(delta) / radius) * 0.8;
}`,
        };
      case 'spatial-gyro':
        return {
          title: 'Euler-Lagrange 3-Axis Gimbal Inertia',
          equation: 'τ = dL/dt = Ω_precession × L',
          secondaryEq: 'L = I · ω  (Angular Momentum Conservation)',
          summary:
            'Three concentric mechanical gimbals simulating gimbal lock avoidance, physical angular momentum, torque resistance, and gyroscopic precession induced by an ultra-fast spinning core flywheel.',
          code: `// Gyroscopic Precession Calculation
vec3 angularMomentum = momentOfInertia * rotorAngularVelocity;
vec3 precessionTorque = cross(externalTorque, angularMomentum);

// Coupled Ring Rotations with Viscous Damping
yawRing.rotation.z += angularVelocity.z + precessionTorque.x * 0.1;
pitchRing.rotation.x += angularVelocity.x + precessionTorque.y * 0.1;
angularVelocity *= frictionDamping;`,
        };
      case 'harmonic-oscillator':
        return {
          title: 'Multi-Frequency Lissajous Wave Superposition',
          equation: 'z(x, y, t) = ∑ Aᵢ sin(k_{xi} x + ωᵢ t) · cos(k_{yi} y - ωᵢ t)',
          secondaryEq: 'k_x / k_y = p / q  (Harmonic Resonance Ratio)',
          summary:
            'Continuous topological heightfield solving 3D standing wave interference patterns based on rational frequency ratios (3:2 Musical Fifth, 5:4 Major Third, Golden Ratio φ).',
          code: `// Lissajous 3D Wave Superposition
float wave1 = sin(bx * 3.2 * ratio.fx + time * 2.0);
float wave2 = cos(bz * 3.2 * ratio.fy - time * 1.6);
float radial = sin(length(vec2(bx, bz)) * 5.0 - time * 2.5) * 0.4;

float elevation = (wave1 * wave2 + radial) * amplitude;
vertexPosition.y = elevation;`,
        };
    }
  };

  const mathData = getMathematicalFormulation();

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 select-none overflow-hidden overscroll-contain"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer pointer-events-auto"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Main Studio Inspector Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className={`relative z-10 w-full rounded-3xl bg-[#090C15] border border-neutral-800 text-white shadow-2xl flex flex-col overflow-hidden overscroll-contain transition-all duration-300 ${
          isFullscreen ? 'h-[94vh] max-w-[96vw]' : 'h-[86vh] max-h-[820px] max-w-5xl'
        }`}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-neutral-800 bg-[#0B0F1B]/90 backdrop-blur z-20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-[11px] font-mono text-indigo-400">
              <span>{vignette.index}</span>
              <span>•</span>
              <span className="uppercase font-bold">{vignette.tool} RUNTIME</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE SOLVER ACTIVE</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playClick();
                setIsFullscreen(!isFullscreen);
              }}
              className="p-2 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="p-2 rounded-full bg-neutral-800/80 hover:bg-red-500/80 text-neutral-300 hover:text-white transition-colors"
              title="Close Inspector"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Experiment Title & Tagline Bar */}
        <div className="px-5 sm:px-7 py-3 bg-[#080B14] border-b border-neutral-850 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight flex items-center gap-2.5">
              <span>{vignette.title}</span>
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: vignette.color }}
              />
            </h2>
            <p className="text-xs font-mono text-neutral-400 mt-0.5">{vignette.tagline}</p>
          </div>

          {/* Tabs: Interactive Simulation vs Math Architecture vs Specs */}
          <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('simulator');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                activeTab === 'simulator'
                  ? 'bg-indigo-600 text-white font-bold shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Interactive Sandbox</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('math');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                activeTab === 'math'
                  ? 'bg-indigo-600 text-white font-bold shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Architecture & Code</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('spec');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                activeTab === 'spec'
                  ? 'bg-indigo-600 text-white font-bold shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Telemetry</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div
          className="flex-1 w-full p-4 sm:p-6 overflow-y-auto overscroll-contain flex flex-col"
          onWheel={(e) => e.stopPropagation()}
        >
          {activeTab === 'simulator' && (
            <div className="flex-1 w-full flex flex-col min-h-0">
              {renderActiveSimulation()}
            </div>
          )}

          {activeTab === 'math' && mathData && (
            <div className="space-y-6 max-w-4xl mx-auto w-full py-2">
              <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800">
                <div className="text-xs font-mono text-indigo-400 uppercase tracking-widest mb-1">
                  GOVERNING EQUATIONS
                </div>
                <h3 className="text-xl font-serif font-bold text-white mb-3">
                  {mathData.title}
                </h3>
                <div className="p-4 rounded-xl bg-black/80 border border-neutral-800 font-mono text-sm sm:text-base text-cyan-400 text-center tracking-wide my-3 overflow-x-auto">
                  {mathData.equation}
                </div>
                {mathData.secondaryEq && (
                  <div className="p-3 rounded-lg bg-black/50 border border-neutral-800/80 font-mono text-xs sm:text-sm text-neutral-300 text-center tracking-wide mb-3 overflow-x-auto">
                    {mathData.secondaryEq}
                  </div>
                )}
                <p className="text-sm text-neutral-300 leading-relaxed font-sans mt-2">
                  {mathData.summary}
                </p>
              </div>

              {/* Source Code Snippet */}
              <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 font-mono">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800 text-xs text-neutral-400">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Terminal className="w-4 h-4" />
                    <span className="font-semibold">CORE NUMERICAL KERNEL</span>
                  </div>
                  <span>{vignette.tool} SHADER PIPELINE</span>
                </div>
                <pre className="mt-4 p-4 rounded-xl bg-black/90 border border-neutral-800 text-xs sm:text-sm text-neutral-200 overflow-x-auto leading-relaxed">
                  <code>{mathData.code}</code>
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'spec' && (
            <div className="space-y-6 max-w-4xl mx-auto w-full py-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 font-mono">
                  <div className="text-neutral-500 text-xs mb-1">TARGET REFRESH RATE</div>
                  <div className="text-2xl font-bold text-emerald-400">60.0 FPS</div>
                  <div className="text-[11px] text-neutral-400 mt-1">requestAnimationFrame sync</div>
                </div>

                <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 font-mono">
                  <div className="text-neutral-500 text-xs mb-1">MEMORY ALLOCATION</div>
                  <div className="text-2xl font-bold text-indigo-400">ZERO GC</div>
                  <div className="text-[11px] text-neutral-400 mt-1">Typed Float32Array Buffers</div>
                </div>

                <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 font-mono">
                  <div className="text-neutral-500 text-xs mb-1">EXECUTION THREAD</div>
                  <div className="text-2xl font-bold text-cyan-400">{vignette.tool}</div>
                  <div className="text-[11px] text-neutral-400 mt-1">Hardware Accelerated WebGL</div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
                <h4 className="text-sm font-mono text-indigo-400 uppercase tracking-wider mb-2">
                  ARCHITECTURAL SUMMARY
                </h4>
                <p className="text-sm text-neutral-300 leading-relaxed font-sans">
                  {vignette.description}
                </p>
                <div className="mt-4 pt-4 border-t border-neutral-800 flex flex-wrap items-center justify-between text-xs font-mono text-neutral-400">
                  <span>Engine: {vignette.tool} Custom Runtime</span>
                  <span>Release: {vignette.year} Engineering Vignette</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
};
