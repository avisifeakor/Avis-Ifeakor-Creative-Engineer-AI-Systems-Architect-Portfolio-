import React, { useEffect, useRef, useState } from 'react';
import { Sliders, RotateCcw, Play, Pause, Terminal, Cpu } from 'lucide-react';
import { soundManager } from '../../lib/soundEffects';

interface KineticAsciiProps {
  isInteractive?: boolean;
  mini?: boolean;
}

export const KineticAsciiEngine: React.FC<KineticAsciiProps> = ({
  isInteractive = true,
  mini = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Configuration state
  const [cellSize, setCellSize] = useState<number>(mini ? 11 : 9);
  const [charSetMode, setCharSetMode] = useState<'standard' | 'math' | 'binary' | 'matrix'>('matrix');
  const [colorMode, setColorMode] = useState<'phosphor' | 'cyber' | 'amber' | 'mono'>('phosphor');
  const [shape, setShape] = useState<'torus' | 'wave' | 'sphere'>('torus');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(60);

  const mouseRef = useRef<{ x: number; y: number; isHovering: boolean }>({
    x: -999,
    y: -999,
    isHovering: false,
  });

  const charSets = {
    standard: ' .:-=+*#%@',
    math: ' ·¬≈±λ√∂∇∫∑✦',
    binary: '  0011',
    matrix: ' .:+*ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ01',
  };

  const colors = {
    phosphor: { main: '#10B981', glow: 'rgba(16, 185, 129, 0.25)', bg: '#040F0A' },
    cyber: { main: '#06B6D4', glow: 'rgba(6, 182, 212, 0.25)', bg: '#050B14' },
    amber: { main: '#F59E0B', glow: 'rgba(245, 158, 11, 0.25)', bg: '#100B03' },
    mono: { main: '#E2E8F0', glow: 'rgba(226, 232, 240, 0.2)', bg: '#080A0F' },
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(120, Math.floor(rect.width * dpr));
      canvas.height = Math.max(80, Math.floor(rect.height * dpr));
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) observer.observe(containerRef.current);

    let animId: number;
    let frameCount = 0;
    let lastFps = performance.now();

    const renderLoop = (time: number) => {
      frameCount++;
      if (time - lastFps > 800) {
        setFps(Math.round((frameCount * 1000) / (time - lastFps)));
        frameCount = 0;
        lastFps = time;
      }

      const w = canvas.width;
      const h = canvas.height;
      const cSet = charSets[charSetMode];
      const colTheme = colors[colorMode];

      ctx.fillStyle = colTheme.bg;
      ctx.fillRect(0, 0, w, h);

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const actualCell = cellSize * dpr;
      const cols = Math.floor(w / actualCell);
      const rows = Math.floor(h / actualCell);

      ctx.font = `${Math.floor(actualCell * 0.95)}px JetBrains Mono, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const tSec = isPaused ? 1.0 : time * 0.001;
      const mouse = mouseRef.current;

      // 3D Procedural Raymarch / SDF calculations
      const aspect = w / h;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = c * actualCell + actualCell * 0.5;
          const py = r * actualCell + actualCell * 0.5;

          // Normalized coordinates (-1 to 1)
          const nx = (px / w) * 2 - 1;
          const ny = ((py / h) * 2 - 1) / aspect;

          let luminance = 0;

          if (shape === 'torus') {
            // Rotating Torus Ring SDF projection
            const rotX = nx * Math.cos(tSec * 0.8) - ny * Math.sin(tSec * 0.8);
            const rotY = nx * Math.sin(tSec * 0.8) + ny * Math.cos(tSec * 0.8);
            const radius = Math.hypot(rotX, rotY);
            const ringDist = Math.abs(radius - 0.48);
            const tube = Math.max(0, 1 - ringDist / 0.22);
            luminance = tube * (0.6 + 0.4 * Math.sin(Math.atan2(rotY, rotX) * 4 + tSec * 2));
          } else if (shape === 'wave') {
            // 3D Sine Wave Interference
            const wave1 = Math.sin(nx * 7.0 + tSec * 2.5);
            const wave2 = Math.cos(ny * 7.0 - tSec * 2.0);
            luminance = Math.max(0, (wave1 + wave2 + 2.0) / 4.0);
          } else if (shape === 'sphere') {
            // Shaded 3D Rotating Sphere with specular spot
            const rSphere = Math.hypot(nx, ny);
            if (rSphere < 0.65) {
              const nz = Math.sqrt(0.65 * 0.65 - rSphere * rSphere);
              const lightDir = {
                x: Math.cos(tSec * 1.5) * 0.8,
                y: Math.sin(tSec * 1.2) * 0.8,
                z: 0.9,
              };
              const dot = (nx * lightDir.x + ny * lightDir.y + nz * lightDir.z) / 0.65;
              luminance = Math.max(0, dot);
            }
          }

          // Mouse magnetic ripple distortion
          if (mouse.isHovering) {
            const mDist = Math.hypot(px - mouse.x, py - mouse.y);
            const mRadius = 140 * dpr;
            if (mDist < mRadius) {
              const mFactor = 1 - mDist / mRadius;
              luminance = Math.min(1.0, luminance + mFactor * 0.85);
            }
          }

          // Pick glyph from density ramp
          const rampIndex = Math.floor(Math.min(0.99, Math.max(0, luminance)) * cSet.length);
          const char = cSet[rampIndex];

          if (char && char !== ' ') {
            const alpha = Math.min(1, Math.max(0.2, luminance * 1.2));
            ctx.fillStyle = colTheme.main;
            ctx.globalAlpha = alpha;
            ctx.fillText(char, px, py);
          }
        }
      }

      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, [cellSize, charSetMode, colorMode, shape, isPaused, mini]);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    mouseRef.current = {
      x: (e.clientX - rect.left) * dpr,
      y: (e.clientY - rect.top) * dpr,
      isHovering: true,
    };
  };

  const handlePointerLeave = () => {
    mouseRef.current.isHovering = false;
  };

  return (
    <div ref={containerRef} className="relative w-full h-full flex flex-col select-none overflow-hidden">
      {/* Simulation Stage */}
      <div className="relative flex-1 w-full h-full min-h-[220px] rounded-2xl overflow-hidden bg-[#040F0A]">
        <canvas
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className="w-full h-full cursor-crosshair touch-none"
        />

        {/* Live HUD Overlay */}
        {!mini && (
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur border border-white/10 text-[11px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>DYNAMIC ASCII HALFTONE</span>
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
            </div>
          </div>
        )}

        {/* Mini Badge */}
        {mini && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur border border-emerald-500/30 text-[9px] font-mono text-emerald-400">
            ASCII GPU RASTERIZER
          </div>
        )}
      </div>

      {/* Interactive Controls Bar (in Inspector mode) */}
      {!mini && (
        <div className="mt-4 p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-xs font-mono space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2 text-neutral-300">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold uppercase tracking-wider text-[11px]">Raster Controls</span>
            </div>

            {/* Shape Selector */}
            <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
              {(['torus', 'wave', 'sphere'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setShape(s);
                    soundManager.playClick();
                  }}
                  className={`px-2.5 py-1 rounded text-[10px] uppercase font-medium transition-colors ${
                    shape === s
                      ? 'bg-emerald-500 text-neutral-950 font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Glyph Set Selector */}
            <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
              {(['matrix', 'math', 'standard', 'binary'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setCharSetMode(m);
                    soundManager.playClick();
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] uppercase font-medium transition-colors ${
                    charSetMode === m
                      ? 'bg-neutral-800 text-emerald-400 border border-emerald-500/50'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-neutral-400 mb-1 text-[11px]">
                <span>Matrix Cell Density</span>
                <span className="text-emerald-400">{cellSize}px</span>
              </div>
              <input
                type="range"
                min="6"
                max="18"
                step="1"
                value={cellSize}
                onChange={(e) => setCellSize(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-400 h-1 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-neutral-400 mb-1 text-[11px]">
                <span>Terminal Phosphor Tint</span>
                <span className="text-emerald-400 uppercase">{colorMode}</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                {(['phosphor', 'cyber', 'amber', 'mono'] as const).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => {
                      setColorMode(theme);
                      soundManager.playClick();
                    }}
                    className={`px-2.5 py-1 rounded text-[10px] uppercase border transition-colors ${
                      colorMode === theme
                        ? 'border-emerald-400 bg-emerald-950/60 text-emerald-300 font-bold'
                        : 'border-neutral-800 text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 text-[10px] text-neutral-400 flex items-center justify-between">
            <span>🖱 Move cursor across matrix to induce magnetic kinetic displacement</span>
            <span className="font-mono text-neutral-400">Zero-Allocation Loop • Monospace</span>
          </div>
        </div>
      )}
    </div>
  );
};
