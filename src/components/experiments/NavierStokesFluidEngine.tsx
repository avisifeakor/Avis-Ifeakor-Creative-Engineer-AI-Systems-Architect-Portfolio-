import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Droplets, Wind, Sliders } from 'lucide-react';
import { soundManager } from '../../lib/soundEffects';

interface FluidEngineProps {
  isInteractive?: boolean;
  mini?: boolean;
}

export const NavierStokesFluidEngine: React.FC<FluidEngineProps> = ({
  isInteractive = true,
  mini = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Simulation parameters
  const [viscosity, setViscosity] = useState<number>(0.0001);
  const [vorticity, setVorticity] = useState<number>(0.35);
  const [dissipation, setDissipation] = useState<number>(0.985);
  const [colorScheme, setColorScheme] = useState<'cyan' | 'fire' | 'emerald' | 'neon'>('cyan');
  const [viewMode, setViewMode] = useState<'smoke' | 'vectors' | 'pressure'>('smoke');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(60);

  // Mouse tracking
  const mouseRef = useRef<{
    x: number;
    y: number;
    prevX: number;
    prevY: number;
    isDown: boolean;
    hasMoved: boolean;
  }>({
    x: 0,
    y: 0,
    prevX: 0,
    prevY: 0,
    isDown: false,
    hasMoved: false,
  });

  // Solver buffers and state in a ref to avoid reallocations
  const solverRef = useRef<{
    w: number;
    h: number;
    u: Float32Array; // x velocity
    v: Float32Array; // y velocity
    uPrev: Float32Array;
    vPrev: Float32Array;
    densR: Float32Array; // Red dye
    densG: Float32Array; // Green dye
    densB: Float32Array; // Blue dye
    densRPrev: Float32Array;
    densGPrev: Float32Array;
    densBPrev: Float32Array;
    p: Float32Array; // Pressure
    div: Float32Array; // Divergence
    colorPalette: { r: number; g: number; b: number };
    reset: () => void;
  }>({} as any);

  // Color palette definition
  const palettes = {
    cyan: { r: 6, g: 182, b: 212 }, // Cyan 500
    fire: { r: 245, g: 158, b: 11 }, // Amber 500 / Orange
    emerald: { r: 16, g: 185, b: 129 }, // Emerald 500
    neon: { r: 236, g: 72, b: 153 }, // Pink/Magenta 500
  };

  useEffect(() => {
    solverRef.current.colorPalette = palettes[colorScheme];
  }, [colorScheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fluid grid resolution (higher on desktop inspector, compact on mini)
    const GW = mini ? 48 : 80;
    const GH = mini ? 32 : 56;
    const size = GW * GH;

    const u = new Float32Array(size);
    const v = new Float32Array(size);
    const uPrev = new Float32Array(size);
    const vPrev = new Float32Array(size);
    const densR = new Float32Array(size);
    const densG = new Float32Array(size);
    const densB = new Float32Array(size);
    const densRPrev = new Float32Array(size);
    const densGPrev = new Float32Array(size);
    const densBPrev = new Float32Array(size);
    const p = new Float32Array(size);
    const div = new Float32Array(size);

    const IX = (x: number, y: number) => {
      const cx = Math.max(0, Math.min(GW - 1, x));
      const cy = Math.max(0, Math.min(GH - 1, y));
      return cy * GW + cx;
    };

    const reset = () => {
      u.fill(0);
      v.fill(0);
      uPrev.fill(0);
      vPrev.fill(0);
      densR.fill(0);
      densG.fill(0);
      densB.fill(0);
      densRPrev.fill(0);
      densGPrev.fill(0);
      densBPrev.fill(0);
      p.fill(0);
      div.fill(0);

      // Inject initial energetic vortex swirl
      const midX = Math.floor(GW / 2);
      const midY = Math.floor(GH / 2);
      for (let y = midY - 6; y <= midY + 6; y++) {
        for (let x = midX - 6; x <= midX + 6; x++) {
          const dx = x - midX;
          const dy = y - midY;
          const dist = Math.hypot(dx, dy);
          if (dist < 6 && dist > 0.5) {
            const idx = IX(x, y);
            u[idx] = -dy * 1.8;
            v[idx] = dx * 1.8;
            densR[idx] = 0.8;
            densG[idx] = 0.9;
            densB[idx] = 1.0;
          }
        }
      }
    };

    solverRef.current = {
      w: GW,
      h: GH,
      u,
      v,
      uPrev,
      vPrev,
      densR,
      densG,
      densB,
      densRPrev,
      densGPrev,
      densBPrev,
      p,
      div,
      colorPalette: palettes[colorScheme],
      reset,
    };

    reset();

    // Resize canvas to match container
    const updateCanvasSize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(120, Math.floor(rect.width * dpr));
      canvas.height = Math.max(80, Math.floor(rect.height * dpr));
    };

    updateCanvasSize();
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    // Eulerian Fluid Solver Functions (Jos Stam's Stable Fluids)
    const advect = (
      field: Float32Array,
      field0: Float32Array,
      velX: Float32Array,
      velY: Float32Array,
      dt: number,
      decay: number
    ) => {
      const dt0 = dt * GW;
      for (let y = 1; y < GH - 1; y++) {
        for (let x = 1; x < GW - 1; x++) {
          const idx = IX(x, y);
          let prevX = x - dt0 * velX[idx];
          let prevY = y - dt0 * velY[idx];

          if (prevX < 0.5) prevX = 0.5;
          if (prevX > GW - 1.5) prevX = GW - 1.5;
          const i0 = Math.floor(prevX);
          const i1 = i0 + 1;

          if (prevY < 0.5) prevY = 0.5;
          if (prevY > GH - 1.5) prevY = GH - 1.5;
          const j0 = Math.floor(prevY);
          const j1 = j0 + 1;

          const s1 = prevX - i0;
          const s0 = 1 - s1;
          const t1 = prevY - j0;
          const t0 = 1 - t1;

          field[idx] =
            (s0 * (t0 * field0[IX(i0, j0)] + t1 * field0[IX(i0, j1)]) +
              s1 * (t0 * field0[IX(i1, j0)] + t1 * field0[IX(i1, j1)])) *
            decay;
        }
      }
    };

    const project = (velX: Float32Array, velY: Float32Array) => {
      // Divergence
      for (let y = 1; y < GH - 1; y++) {
        for (let x = 1; x < GW - 1; x++) {
          const idx = IX(x, y);
          div[idx] =
            (-0.5 * (velX[IX(x + 1, y)] - velX[IX(x - 1, y)] + velY[IX(x, y + 1)] - velY[IX(x, y - 1)])) /
            GW;
          p[idx] = 0;
        }
      }

      // Pressure Poisson Jacobi Relaxation
      for (let k = 0; k < 18; k++) {
        for (let y = 1; y < GH - 1; y++) {
          for (let x = 1; x < GW - 1; x++) {
            p[IX(x, y)] =
              (div[IX(x, y)] +
                p[IX(x - 1, y)] +
                p[IX(x + 1, y)] +
                p[IX(x, y - 1)] +
                p[IX(x, y + 1)]) /
              4;
          }
        }
      }

      // Subtract pressure gradient
      for (let y = 1; y < GH - 1; y++) {
        for (let x = 1; x < GW - 1; x++) {
          const idx = IX(x, y);
          velX[idx] -= 0.5 * (p[IX(x + 1, y)] - p[IX(x - 1, y)]) * GW;
          velY[idx] -= 0.5 * (p[IX(x, y + 1)] - p[IX(x, y - 1)]) * GH;
        }
      }
    };

    const applyVorticity = (velX: Float32Array, velY: Float32Array, curlStrength: number) => {
      if (curlStrength <= 0) return;
      for (let y = 2; y < GH - 2; y++) {
        for (let x = 2; x < GW - 2; x++) {
          const idx = IX(x, y);
          // Compute curl: dv/dx - du/dy
          const curl =
            (velY[IX(x + 1, y)] - velY[IX(x - 1, y)]) * 0.5 -
            (velX[IX(x, y + 1)] - velX[IX(x, y - 1)]) * 0.5;

          // Apply vorticity perpendicular force
          velX[idx] += curl * curlStrength * 0.04;
          velY[idx] += -curl * curlStrength * 0.04;
        }
      }
    };

    // Animation Loop
    let animId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let lastFpsUpdate = performance.now();

    const dt = 0.12;

    const renderLoop = (time: number) => {
      // FPS measurement
      frameCount++;
      if (time - lastFpsUpdate > 800) {
        setFps(Math.round((frameCount * 1000) / (time - lastFpsUpdate)));
        frameCount = 0;
        lastFpsUpdate = time;
      }

      // Step simulation if not paused
      if (!isPaused) {
        // Continuous gentle background ambient swirl
        const tSec = time * 0.001;
        const ambX = Math.floor(GW * 0.5 + Math.cos(tSec * 1.5) * (GW * 0.25));
        const ambY = Math.floor(GH * 0.5 + Math.sin(tSec * 1.8) * (GH * 0.2));
        const ambIdx = IX(ambX, ambY);
        const curPal = solverRef.current.colorPalette || palettes.cyan;

        densR[ambIdx] = Math.min(1.5, densR[ambIdx] + (curPal.r / 255) * 0.1);
        densG[ambIdx] = Math.min(1.5, densG[ambIdx] + (curPal.g / 255) * 0.1);
        densB[ambIdx] = Math.min(1.5, densB[ambIdx] + (curPal.b / 255) * 0.1);

        u[ambIdx] += -Math.sin(tSec * 2.1) * 0.6;
        v[ambIdx] += Math.cos(tSec * 1.7) * 0.6;

        // User mouse interaction injection
        const m = mouseRef.current;
        if (m.hasMoved && canvas) {
          const rect = canvas.getBoundingClientRect();
          const gridX = Math.floor((m.x / rect.width) * GW);
          const gridY = Math.floor((m.y / rect.height) * GH);
          const dx = (m.x - m.prevX) * 0.6;
          const dy = (m.y - m.prevY) * 0.6;
          const radius = mini ? 2 : 3;

          for (let ry = -radius; ry <= radius; ry++) {
            for (let rx = -radius; rx <= radius; rx++) {
              const d2 = rx * rx + ry * ry;
              if (d2 <= radius * radius) {
                const gx = gridX + rx;
                const gy = gridY + ry;
                if (gx >= 1 && gx < GW - 1 && gy >= 1 && gy < GH - 1) {
                  const idx = IX(gx, gy);
                  const falloff = 1 - Math.sqrt(d2) / (radius + 1);

                  u[idx] += dx * falloff * 0.8;
                  v[idx] += dy * falloff * 0.8;

                  densR[idx] = Math.min(2.5, densR[idx] + (curPal.r / 255) * falloff * 1.4);
                  densG[idx] = Math.min(2.5, densG[idx] + (curPal.g / 255) * falloff * 1.4);
                  densB[idx] = Math.min(2.5, densB[idx] + (curPal.b / 255) * falloff * 1.4);
                }
              }
            }
          }
          m.prevX = m.x;
          m.prevY = m.y;
          m.hasMoved = false;
        }

        // Apply Vorticity confinement
        applyVorticity(u, v, vorticity);

        // Project velocity to incompressibility
        project(u, v);

        // Advect velocity
        uPrev.set(u);
        vPrev.set(v);
        advect(u, uPrev, uPrev, vPrev, dt, 0.995);
        advect(v, vPrev, uPrev, vPrev, dt, 0.995);

        // Re-project after velocity advection
        project(u, v);

        // Advect RGB dye densities
        densRPrev.set(densR);
        densGPrev.set(densG);
        densBPrev.set(densB);
        advect(densR, densRPrev, u, v, dt, dissipation);
        advect(densG, densGPrev, u, v, dt, dissipation);
        advect(densB, densBPrev, u, v, dt, dissipation);
      }

      // Render Canvas
      const width = canvas.width;
      const height = canvas.height;
      ctx.fillStyle = '#06080F';
      ctx.fillRect(0, 0, width, height);

      const cellW = width / GW;
      const cellH = height / GH;

      if (viewMode === 'smoke') {
        // High quality pixel buffer rendering
        const imgData = ctx.createImageData(GW, GH);
        const data = imgData.data;

        for (let i = 0; i < size; i++) {
          const pIdx = i * 4;
          const r = Math.min(255, Math.floor(densR[i] * 255));
          const g = Math.min(255, Math.floor(densG[i] * 255));
          const b = Math.min(255, Math.floor(densB[i] * 255));
          const maxVal = Math.max(r, g, b);

          data[pIdx] = r;
          data[pIdx + 1] = g;
          data[pIdx + 2] = b;
          data[pIdx + 3] = maxVal > 5 ? Math.min(255, maxVal * 1.6 + 20) : 0;
        }

        // Draw scaled image data to canvas with bilinear interpolation
        const offCanvas = document.createElement('canvas');
        offCanvas.width = GW;
        offCanvas.height = GH;
        const offCtx = offCanvas.getContext('2d');
        if (offCtx) {
          offCtx.putImageData(imgData, 0, 0);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(offCanvas, 0, 0, width, height);
        }

        // Subtle fluid vector overlay sparkles
        if (!mini) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          for (let y = 4; y < GH; y += 8) {
            for (let x = 4; x < GW; x += 8) {
              const idx = IX(x, y);
              const speed = Math.hypot(u[idx], v[idx]);
              if (speed > 0.4) {
                const px = x * cellW;
                const py = y * cellH;
                ctx.beginPath();
                ctx.arc(px, py, Math.min(1.8, speed * 0.6), 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }
        }
      } else if (viewMode === 'vectors') {
        // Velocity vector grid
        ctx.strokeStyle = '#06B6D4';
        ctx.lineWidth = 1.2;
        const step = mini ? 4 : 3;

        for (let y = 1; y < GH - 1; y += step) {
          for (let x = 1; x < GW - 1; x += step) {
            const idx = IX(x, y);
            const vx = u[idx] * 4;
            const vy = v[idx] * 4;
            const speed = Math.hypot(vx, vy);
            const px = (x + 0.5) * cellW;
            const py = (y + 0.5) * cellH;

            ctx.strokeStyle = `hsla(${180 + speed * 15}, 90%, 65%, ${Math.min(1, 0.2 + speed * 0.4)})`;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px + vx, py + vy);
            ctx.stroke();
          }
        }
      } else if (viewMode === 'pressure') {
        // Pressure heatmap view
        for (let y = 1; y < GH - 1; y++) {
          for (let x = 1; x < GW - 1; x++) {
            const val = p[IX(x, y)] * 800;
            const hue = val > 0 ? 10 : 210;
            const sat = Math.min(100, Math.abs(val) * 100);
            const light = Math.min(60, 20 + Math.abs(val) * 40);
            ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light}%)`;
            ctx.fillRect(x * cellW, y * cellH, cellW + 1, cellH + 1);
          }
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
    };
  }, [mini, isPaused, viewMode, vorticity, dissipation, colorScheme]);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isInteractive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const m = mouseRef.current;
    if (!m.hasMoved) {
      m.prevX = m.prevX || x;
      m.prevY = m.prevY || y;
    }
    m.x = x;
    m.y = y;
    m.hasMoved = true;
  };

  return (
    <div ref={containerRef} className="relative w-full h-full flex flex-col select-none overflow-hidden">
      {/* Simulation Stage */}
      <div className="relative flex-1 w-full h-full min-h-[220px] rounded-2xl overflow-hidden bg-[#06080F]">
        <canvas
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          onPointerDown={(e) => {
            mouseRef.current.isDown = true;
            handlePointerMove(e);
            soundManager.playClick(720);
          }}
          onPointerUp={() => {
            mouseRef.current.isDown = false;
          }}
          className="w-full h-full cursor-crosshair touch-none"
        />

        {/* Live HUD Overlay (Inspector Mode) */}
        {!mini && (
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur border border-white/10 text-[11px] font-mono text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>NAVIER-STOKES EULERIAN</span>
              <span className="text-white/40">•</span>
              <span className="text-white/80">{fps} FPS</span>
            </div>

            <div className="flex items-center gap-1.5 pointer-events-auto">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-2 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 text-white transition-colors"
                title={isPaused ? 'Resume' : 'Pause'}
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => {
                  soundManager.playClick(900);
                  solverRef.current.reset?.();
                }}
                className="p-2 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 text-white transition-colors"
                title="Reset Field"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Miniature badge */}
        {mini && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur border border-cyan-500/30 text-[9px] font-mono text-cyan-400">
            GPU FLUID SOLVER
          </div>
        )}
      </div>

      {/* Interactive Controls Bar (in Inspector mode) */}
      {!mini && (
        <div className="mt-4 p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-xs font-mono space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2 text-neutral-300">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold uppercase tracking-wider text-[11px]">Solver Controls</span>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
              {(['smoke', 'vectors', 'pressure'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setViewMode(mode);
                    soundManager.playClick();
                  }}
                  className={`px-2.5 py-1 rounded text-[10px] uppercase font-medium transition-colors ${
                    viewMode === mode
                      ? 'bg-cyan-500 text-neutral-950 font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Color Palette Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-400 text-[10px] uppercase">Dye:</span>
              {(['cyan', 'fire', 'emerald', 'neon'] as const).map((pal) => (
                <button
                  key={pal}
                  onClick={() => {
                    setColorScheme(pal);
                    soundManager.playClick();
                  }}
                  className={`w-5 h-5 rounded-full border transition-transform ${
                    colorScheme === pal ? 'scale-110 border-white ring-2 ring-cyan-500/50' : 'border-transparent opacity-70'
                  }`}
                  style={{
                    backgroundColor:
                      pal === 'cyan' ? '#06B6D4' : pal === 'fire' ? '#F59E0B' : pal === 'emerald' ? '#10B981' : '#EC4899',
                  }}
                  title={`${pal} dye`}
                />
              ))}
            </div>
          </div>

          {/* Sliders Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-neutral-400 mb-1 text-[11px]">
                <span>Vorticity / Curl Confinement</span>
                <span className="text-cyan-400">{vorticity.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.02"
                value={vorticity}
                onChange={(e) => setVorticity(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-1 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-neutral-400 mb-1 text-[11px]">
                <span>Dye Dissipation Rate</span>
                <span className="text-cyan-400">{dissipation.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min="0.94"
                max="0.999"
                step="0.002"
                value={dissipation}
                onChange={(e) => setDissipation(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-1 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2 text-[10px] text-neutral-400 flex items-center justify-between">
            <span>🖱 Drag cursor across canvas to inject high-velocity swirling fluid</span>
            <span className="text-neutral-400 font-mono">Jacobi iterations: 18 • Δt: 0.12</span>
          </div>
        </div>
      )}
    </div>
  );
};
