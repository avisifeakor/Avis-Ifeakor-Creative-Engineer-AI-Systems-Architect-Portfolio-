import React, { useEffect, useRef, useState } from 'react';
import { Scissors, Hand, RotateCcw, Wind, ShieldAlert, Sliders, Play, Pause } from 'lucide-react';
import { soundManager } from '../../lib/soundEffects';

interface VerletClothProps {
  isInteractive?: boolean;
  mini?: boolean;
}

interface Particle {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  pinned: boolean;
  pinX: number;
  pinY: number;
}

interface Constraint {
  p1: number;
  p2: number;
  restLength: number;
  broken: boolean;
  tension: number;
}

export const VerletClothEngine: React.FC<VerletClothProps> = ({
  isInteractive = true,
  mini = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Tools & modes
  const [tool, setTool] = useState<'grab' | 'tear'>('grab');
  const [gravity, setGravity] = useState<number>(0.45);
  const [wind, setWind] = useState<number>(0.25);
  const [showStress, setShowStress] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(60);
  const [pinMode, setPinMode] = useState<'corners' | 'top' | 'center'>('corners');

  // Interactive mouse tracking
  const mouseRef = useRef<{
    x: number;
    y: number;
    isDown: boolean;
    draggedParticle: number | null;
    tool: 'grab' | 'tear';
  }>({
    x: 0,
    y: 0,
    isDown: false,
    draggedParticle: null,
    tool: 'grab',
  });

  useEffect(() => {
    mouseRef.current.tool = tool;
  }, [tool]);

  // Mesh data in ref
  const meshRef = useRef<{
    cols: number;
    rows: number;
    particles: Particle[];
    constraints: Constraint[];
    reset: (pinning?: 'corners' | 'top' | 'center') => void;
  }>({} as any);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cols = mini ? 24 : 42;
    const rows = mini ? 18 : 32;

    const resetMesh = (selectedPin: 'corners' | 'top' | 'center' = pinMode) => {
      if (!canvas) return;
      const rect = containerRef.current?.getBoundingClientRect();
      const w = canvas.width;
      const h = canvas.height;

      const clothW = w * (mini ? 0.8 : 0.75);
      const clothH = h * (mini ? 0.75 : 0.68);
      const startX = (w - clothW) / 2;
      const startY = h * 0.12;

      const spacingX = clothW / (cols - 1);
      const spacingY = clothH / (rows - 1);

      const particles: Particle[] = [];
      const constraints: Constraint[] = [];

      // Create particles
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = startX + c * spacingX;
          const py = startY + r * spacingY;

          let isPinned = false;
          if (selectedPin === 'corners') {
            isPinned = (r === 0 && (c === 0 || c === cols - 1 || c === Math.floor(cols / 2)));
          } else if (selectedPin === 'top') {
            isPinned = (r === 0 && c % 3 === 0);
          } else if (selectedPin === 'center') {
            isPinned = (r === Math.floor(rows / 2) && c === Math.floor(cols / 2));
          }

          particles.push({
            x: px,
            y: py,
            prevX: px,
            prevY: py,
            pinned: isPinned,
            pinX: px,
            pinY: py,
          });
        }
      }

      // Create constraints (structural springs)
      const getIndex = (c: number, r: number) => r * cols + c;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = getIndex(c, r);

          // Horizontal constraint
          if (c < cols - 1) {
            constraints.push({
              p1: i,
              p2: getIndex(c + 1, r),
              restLength: spacingX,
              broken: false,
              tension: 0,
            });
          }

          // Vertical constraint
          if (r < rows - 1) {
            constraints.push({
              p1: i,
              p2: getIndex(c, r + 1),
              restLength: spacingY,
              broken: false,
              tension: 0,
            });
          }

          // Shear cross constraint (diagonal for realistic shear resistance)
          if (!mini && c < cols - 1 && r < rows - 1) {
            const diagLen = Math.hypot(spacingX, spacingY);
            constraints.push({
              p1: i,
              p2: getIndex(c + 1, r + 1),
              restLength: diagLen,
              broken: false,
              tension: 0,
            });
          }
        }
      }

      meshRef.current = {
        cols,
        rows,
        particles,
        constraints,
        reset: resetMesh,
      };
    };

    const updateSize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(120, Math.floor(rect.width * dpr));
      canvas.height = Math.max(80, Math.floor(rect.height * dpr));
      resetMesh();
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) observer.observe(containerRef.current);

    // Animation Loop
    let animId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let lastFps = performance.now();

    const dt = 1.0;
    const damping = 0.985;
    const iterations = mini ? 3 : 5;

    const renderLoop = (time: number) => {
      frameCount++;
      if (time - lastFps > 800) {
        setFps(Math.round((frameCount * 1000) / (time - lastFps)));
        frameCount = 0;
        lastFps = time;
      }

      const { particles, constraints } = meshRef.current;

      if (!isPaused && particles && constraints) {
        const tSec = time * 0.001;

        // 1. Verlet Particle Integration
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          if (p.pinned) {
            p.x = p.pinX;
            p.y = p.pinY;
            continue;
          }

          // If dragged by mouse
          if (mouseRef.current.draggedParticle === i) {
            p.x = mouseRef.current.x;
            p.y = mouseRef.current.y;
            p.prevX = p.x;
            p.prevY = p.y;
            continue;
          }

          const vx = (p.x - p.prevX) * damping;
          const vy = (p.y - p.prevY) * damping;

          p.prevX = p.x;
          p.prevY = p.y;

          // Wind turbulence
          const windForce =
            Math.sin(tSec * 2.5 + p.y * 0.02) * Math.cos(tSec * 1.8 + p.x * 0.015) * wind * 0.6 +
            wind * 0.3;

          p.x += vx + windForce;
          p.y += vy + gravity;
        }

        // 2. Solve Distance Constraints (Relaxation Iterations)
        for (let iter = 0; iter < iterations; iter++) {
          for (let i = 0; i < constraints.length; i++) {
            const c = constraints[i];
            if (c.broken) continue;

            const p1 = particles[c.p1];
            const p2 = particles[c.p2];

            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.hypot(dx, dy);

            // Tear if pulled way beyond mechanical limits
            if (dist > c.restLength * 3.8) {
              c.broken = true;
              continue;
            }

            const diff = (dist - c.restLength) / (dist || 1);
            c.tension = Math.max(0, (dist - c.restLength) / c.restLength);

            const offsetX = dx * 0.5 * diff;
            const offsetY = dy * 0.5 * diff;

            if (!p1.pinned && mouseRef.current.draggedParticle !== c.p1) {
              p1.x += offsetX;
              p1.y += offsetY;
            }
            if (!p2.pinned && mouseRef.current.draggedParticle !== c.p2) {
              p2.x -= offsetX;
              p2.y -= offsetY;
            }
          }
        }
      }

      // 3. Render Canvas
      const width = canvas.width;
      const height = canvas.height;
      ctx.fillStyle = '#07090E';
      ctx.fillRect(0, 0, width, height);

      // Draw constraints
      if (constraints && particles) {
        ctx.lineWidth = mini ? 1 : 1.2;

        for (let i = 0; i < constraints.length; i++) {
          const c = constraints[i];
          if (c.broken) continue;

          const p1 = particles[c.p1];
          const p2 = particles[c.p2];

          if (showStress) {
            // Color by tension: calm amber/gold to intense red
            const t = Math.min(1, c.tension * 2.5);
            ctx.strokeStyle = `hsl(${45 - t * 45}, ${90}%, ${60 + t * 20}%)`;
          } else {
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
          }

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }

        // Draw pin anchors
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          if (p.pinned) {
            ctx.fillStyle = '#F59E0B';
            ctx.beginPath();
            ctx.arc(p.x, p.y, mini ? 2 : 3.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, [mini, isPaused, gravity, wind, showStress, pinMode]);

  // Pointer interactions
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isInteractive || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvasRef.current.width / rect.width);
    const y = (e.clientY - rect.top) * (canvasRef.current.height / rect.height);

    const m = mouseRef.current;
    m.x = x;
    m.y = y;
    m.isDown = true;

    if (m.tool === 'grab') {
      // Find closest particle
      const particles = meshRef.current.particles;
      if (!particles) return;
      let closestIdx = -1;
      let minDist = 35;

      for (let i = 0; i < particles.length; i++) {
        const d = Math.hypot(particles[i].x - x, particles[i].y - y);
        if (d < minDist) {
          minDist = d;
          closestIdx = i;
        }
      }
      if (closestIdx !== -1) {
        m.draggedParticle = closestIdx;
        soundManager.playClick(680);
      }
    } else if (m.tool === 'tear') {
      soundManager.playClick(840);
      severConstraintsAt(x, y);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isInteractive || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvasRef.current.width / rect.width);
    const y = (e.clientY - rect.top) * (canvasRef.current.height / rect.height);

    const m = mouseRef.current;
    m.x = x;
    m.y = y;

    if (m.isDown && m.tool === 'tear') {
      severConstraintsAt(x, y);
    }
  };

  const handlePointerUp = () => {
    const m = mouseRef.current;
    m.isDown = false;
    m.draggedParticle = null;
  };

  const severConstraintsAt = (x: number, y: number) => {
    const { particles, constraints } = meshRef.current;
    if (!particles || !constraints) return;

    const cutRadius = mini ? 12 : 20;

    for (let i = 0; i < constraints.length; i++) {
      const c = constraints[i];
      if (c.broken) continue;

      const p1 = particles[c.p1];
      const p2 = particles[c.p2];

      const midX = (p1.x + p2.x) * 0.5;
      const midY = (p1.y + p2.y) * 0.5;

      if (Math.hypot(midX - x, midY - y) < cutRadius) {
        c.broken = true;
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full flex flex-col select-none overflow-hidden">
      {/* Simulation Stage */}
      <div className="relative flex-1 w-full h-full min-h-[220px] rounded-2xl overflow-hidden bg-[#07090E]">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className={`w-full h-full touch-none ${
            tool === 'tear' ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'
          }`}
        />

        {/* Live HUD Overlay */}
        {!mini && (
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur border border-white/10 text-[11px] font-mono text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>VERLET INTEGRATION FABRIC</span>
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
                  soundManager.playClick(920);
                  meshRef.current.reset?.();
                }}
                className="p-2 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 text-white transition-colors"
                title="Reset Cloth"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Mini Badge */}
        {mini && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur border border-amber-500/30 text-[9px] font-mono text-amber-400">
            VERLET PHYSICS
          </div>
        )}
      </div>

      {/* Interactive Controls Bar (in Inspector mode) */}
      {!mini && (
        <div className="mt-4 p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-xs font-mono space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2 text-neutral-300">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold uppercase tracking-wider text-[11px]">Fabric Controls</span>
            </div>

            {/* Tool Mode: Grab vs Tear */}
            <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
              <button
                onClick={() => {
                  setTool('grab');
                  soundManager.playClick();
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-[10px] uppercase font-semibold transition-colors ${
                  tool === 'grab'
                    ? 'bg-amber-500 text-neutral-950 shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Hand className="w-3 h-3" />
                <span>Grab & Pull</span>
              </button>
              <button
                onClick={() => {
                  setTool('tear');
                  soundManager.playClick();
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-[10px] uppercase font-semibold transition-colors ${
                  tool === 'tear'
                    ? 'bg-amber-500 text-neutral-950 shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Scissors className="w-3 h-3" />
                <span>Cut & Tear</span>
              </button>
            </div>

            {/* Pin Configuration */}
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-400 text-[10px] uppercase">Pins:</span>
              {(['corners', 'top', 'center'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setPinMode(mode);
                    soundManager.playClick();
                    meshRef.current.reset?.(mode);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] uppercase border transition-colors ${
                    pinMode === mode
                      ? 'bg-neutral-800 border-amber-500 text-amber-400 font-bold'
                      : 'border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-neutral-400 mb-1 text-[11px]">
                <span>Gravity Acceleration</span>
                <span className="text-amber-400">{gravity.toFixed(2)}G</span>
              </div>
              <input
                type="range"
                min="0"
                max="1.2"
                step="0.05"
                value={gravity}
                onChange={(e) => setGravity(parseFloat(e.target.value))}
                className="w-full accent-amber-400 h-1 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-neutral-400 mb-1 text-[11px]">
                <span>Wind Turbulence</span>
                <span className="text-amber-400">{wind.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1.0"
                step="0.05"
                value={wind}
                onChange={(e) => setWind(parseFloat(e.target.value))}
                className="w-full accent-amber-400 h-1 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2 text-[10px] text-neutral-400 flex items-center justify-between">
            <span>
              {tool === 'grab'
                ? '✋ Click and drag any cloth node to toss and ripple the fabric'
                : '✂ Drag across threads to slice and tear constraints in real time'}
            </span>
            <button
              onClick={() => setShowStress(!showStress)}
              className="text-amber-400/80 hover:text-amber-300 underline"
            >
              {showStress ? 'Stress Heatmap: ON' : 'Stress Heatmap: OFF'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
