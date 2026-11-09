import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sliders, RotateCcw, Zap, Sparkles, Activity } from 'lucide-react';
import { soundManager } from '../lib/soundEffects';

interface InteractiveSpringPhysicsProps {
  isDark?: boolean;
}

export const InteractiveSpringPhysics: React.FC<InteractiveSpringPhysicsProps> = ({ isDark }) => {
  // Physical parameters
  const [stiffness, setStiffness] = useState<number>(450); // k in N/m
  const [damping, setDamping] = useState<number>(18);      // c in Ns/m (low enough for clear oscillations)
  const mass = 1.0; // kg

  // Dynamic simulation state
  const [displacement, setDisplacement] = useState<number>(0); // x in pixels (-120 to +120)
  const [velocity, setVelocity] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Refs for requestAnimationFrame physics loop
  const stateRef = useRef({
    x: 0,
    v: 0,
    k: 450,
    c: 18,
    isDragging: false,
    lastTime: 0,
    dragStartX: 0,
    dragStartDisplacement: 0,
    lastDragPos: 0,
    lastDragTime: 0,
    dragVelocity: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Keep stateRef in sync with parameter changes
  useEffect(() => {
    stateRef.current.k = stiffness;
    stateRef.current.c = damping;
  }, [stiffness, damping]);

  // Derived physics values
  const omega0 = Math.sqrt(stiffness / mass); // natural frequency
  const zeta = damping / (2 * Math.sqrt(stiffness * mass)); // damping ratio
  const settlingTime = zeta > 0 ? (4 / (zeta * omega0)).toFixed(2) : '∞';
  const regime =
    zeta < 0.95
      ? 'Underdamped (Oscillating)'
      : zeta <= 1.05
      ? 'Critically Damped'
      : 'Overdamped (Sluggish)';

  // Physics integration loop (RK4 / Sub-stepped Semi-Implicit Euler for numerical stability)
  const runPhysicsStep = useCallback((currentTime: number) => {
    const s = stateRef.current;
    if (!s.isDragging) {
      if (s.lastTime === 0) {
        s.lastTime = currentTime;
      }
      // Calculate delta time capped to 32ms to avoid spiral of death on tab freeze
      const dt = Math.min((currentTime - s.lastTime) / 1000, 0.032);
      s.lastTime = currentTime;

      // Use 4 micro-substeps per frame for rock-solid stability at high stiffness
      const subSteps = 4;
      const subDt = dt / subSteps;

      for (let step = 0; step < subSteps; step++) {
        // Differential Equation: m*a + c*v + k*x = 0  =>  a = (-k*x - c*v) / m
        const restoringForce = -s.k * s.x;
        const dampingForce = -s.c * s.v;
        const accel = (restoringForce + dampingForce) / mass;

        // Semi-implicit Euler
        s.v += accel * subDt;
        s.x += s.v * subDt;
      }

      // Check if settled
      if (Math.abs(s.x) < 0.08 && Math.abs(s.v) < 0.08) {
        s.x = 0;
        s.v = 0;
      }

      setDisplacement(s.x);
      setVelocity(s.v);
    } else {
      s.lastTime = currentTime;
    }

    // Keep loop running if active or dragging
    if (s.isDragging || Math.abs(s.x) > 0.05 || Math.abs(s.v) > 0.05) {
      animFrameRef.current = requestAnimationFrame(runPhysicsStep);
    } else {
      animFrameRef.current = null;
    }
  }, [mass]);

  const wakePhysicsLoop = useCallback(() => {
    stateRef.current.lastTime = 0;
    if (animFrameRef.current === null) {
      animFrameRef.current = requestAnimationFrame(runPhysicsStep);
    }
  }, [runPhysicsStep]);

  // Handle Drag / Touch Interactions
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const s = stateRef.current;
    s.isDragging = true;
    s.dragStartX = e.clientX;
    s.dragStartDisplacement = s.x;
    s.lastDragPos = e.clientX;
    s.lastDragTime = performance.now();
    s.dragVelocity = 0;
    s.v = 0;

    setIsDragging(true);
    soundManager.playClick(620);
    wakePhysicsLoop();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = stateRef.current;
    if (!s.isDragging) return;

    const deltaX = e.clientX - s.dragStartX;
    const rawX = s.dragStartDisplacement + deltaX;
    // Physical bounds: -125px to +125px
    const boundedX = Math.max(-125, Math.min(125, rawX));

    // Calculate instantaneous release velocity
    const now = performance.now();
    const dt = (now - s.lastDragTime) / 1000;
    if (dt > 0.008) {
      s.dragVelocity = (e.clientX - s.lastDragPos) / dt;
      s.lastDragPos = e.clientX;
      s.lastDragTime = now;
    }

    s.x = boundedX;
    setDisplacement(boundedX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = stateRef.current;
    if (!s.isDragging) return;

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture already cleared
    }

    s.isDragging = false;
    // Inherit drag flick velocity (clamped to realistic range)
    s.v = Math.max(-800, Math.min(800, s.dragVelocity * 0.4));
    setIsDragging(false);

    soundManager.playClick(780);
    wakePhysicsLoop();
  };

  // Impulse / Pluck Trigger (for testing different displacements)
  const triggerImpulse = (magnitude: number) => {
    const s = stateRef.current;
    s.x = magnitude;
    s.v = 0;
    setDisplacement(magnitude);
    setVelocity(0);
    soundManager.playClick(840);
    wakePhysicsLoop();
  };

  // Reset to equilibrium
  const resetToZero = () => {
    const s = stateRef.current;
    s.x = 0;
    s.v = 0;
    setDisplacement(0);
    setVelocity(0);
    wakePhysicsLoop();
  };

  // Presets
  const applyPreset = (kVal: number, cVal: number) => {
    setStiffness(kVal);
    setDamping(cVal);
    stateRef.current.k = kVal;
    stateRef.current.c = cVal;
    triggerImpulse(95);
  };

  // Build the dynamic SVG spring coil path
  // Visual width = 280px, center is 140px. Puck is at 140 + displacement
  const svgWidth = 280;
  const svgHeight = 70;
  const centerY = svgHeight / 2;
  const puckX = 140 + displacement;
  const puckHalfWidth = 28;

  // Left spring: from anchor (x=16) to puck left edge (x = puckX - puckHalfWidth)
  const leftAnchorX = 18;
  const leftPuckEdgeX = Math.max(leftAnchorX + 12, puckX - puckHalfWidth);
  const leftSpringLength = leftPuckEdgeX - leftAnchorX;

  const numCoilsLeft = 7;
  const coilWidthLeft = (leftSpringLength - 16) / (numCoilsLeft * 2);
  let leftSpringD = `M ${leftAnchorX} ${centerY} L ${leftAnchorX + 8} ${centerY}`;
  for (let i = 0; i < numCoilsLeft; i++) {
    const x1 = leftAnchorX + 8 + i * 2 * coilWidthLeft + coilWidthLeft * 0.5;
    const y1 = centerY - 14;
    const x2 = leftAnchorX + 8 + i * 2 * coilWidthLeft + coilWidthLeft * 1.5;
    const y2 = centerY + 14;
    leftSpringD += ` L ${x1} ${y1} L ${x2} ${y2}`;
  }
  leftSpringD += ` L ${leftPuckEdgeX} ${centerY}`;

  // Right spring: from puck right edge (x = puckX + puckHalfWidth) to right anchor (x = 262)
  const rightAnchorX = svgWidth - 18;
  const rightPuckEdgeX = Math.min(rightAnchorX - 12, puckX + puckHalfWidth);
  const rightSpringLength = rightAnchorX - rightPuckEdgeX;

  const numCoilsRight = 7;
  const coilWidthRight = (rightSpringLength - 16) / (numCoilsRight * 2);
  let rightSpringD = `M ${rightPuckEdgeX} ${centerY}`;
  for (let i = 0; i < numCoilsRight; i++) {
    const x1 = rightPuckEdgeX + 8 + i * 2 * coilWidthRight + coilWidthRight * 0.5;
    const y1 = centerY - 14;
    const x2 = rightPuckEdgeX + 8 + i * 2 * coilWidthRight + coilWidthRight * 1.5;
    const y2 = centerY + 14;
    rightSpringD += ` L ${x1} ${y1} L ${x2} ${y2}`;
  }
  rightSpringD += ` L ${rightAnchorX - 8} ${centerY} L ${rightAnchorX} ${centerY}`;

  // Clean cleanup of animation frame
  useEffect(() => {
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-col justify-between select-none"
      id="interactive-spring-physics-solver"
    >
      <div>
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 text-xs font-mono">
          <span className="text-neutral-900 dark:text-indigo-400 font-semibold flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-neutral-800 dark:text-indigo-400" />
            <span>Interactive Spring Physics</span>
          </span>
          <span className="text-neutral-500 dark:text-neutral-400">Hooke's Law Solvers</span>
        </div>

        {/* Physics Stage / Canvas */}
        <div className="py-4 flex flex-col items-center">
          {/* Tension Stage Area */}
          <div className="relative w-full max-w-[320px] h-[100px] bg-neutral-50 dark:bg-neutral-950/60 rounded-2xl border border-neutral-200/70 dark:border-neutral-800/80 flex items-center justify-center overflow-hidden">
            {/* Equilibrium Center Marker */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px border-l border-dashed border-neutral-300 dark:border-neutral-700/60 pointer-events-none z-0" />
            <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-mono text-neutral-400 dark:text-neutral-600 pointer-events-none">
              x=0
            </div>

            {/* Left & Right Rigid Mechanical Anchors */}
            <div className="absolute left-1 top-1/2 -translate-y-1/2 w-3.5 h-10 rounded bg-neutral-300 dark:bg-neutral-800 border border-neutral-400 dark:border-neutral-700" />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 w-3.5 h-10 rounded bg-neutral-300 dark:bg-neutral-800 border border-neutral-400 dark:border-neutral-700" />

            {/* Dynamic Physical SVG Springs */}
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
            >
              {/* Left Spring */}
              <path
                d={leftSpringD}
                fill="none"
                stroke="currentColor"
                strokeWidth={isDragging ? '2.5' : '2'}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-colors duration-150 ${
                  isDragging
                    ? 'text-indigo-500 dark:text-indigo-400'
                    : 'text-neutral-400 dark:text-neutral-600'
                }`}
              />

              {/* Right Spring */}
              <path
                d={rightSpringD}
                fill="none"
                stroke="currentColor"
                strokeWidth={isDragging ? '2.5' : '2'}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-colors duration-150 ${
                  isDragging
                    ? 'text-indigo-500 dark:text-indigo-400'
                    : 'text-neutral-400 dark:text-neutral-600'
                }`}
              />
            </svg>

            {/* Interactive Spring Mass Puck */}
            <div
              style={{
                transform: `translateX(${displacement}px)`,
                touchAction: 'none',
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              data-cursor="tension"
              data-cursor-text="TENSION / DRAG"
              className={`relative z-10 w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-mono font-bold cursor-grab active:cursor-grabbing select-none transition-shadow ${
                isDragging
                  ? 'cursor-grabbing shadow-2xl scale-105 ring-2 ring-indigo-400/50'
                  : 'shadow-lg hover:scale-102'
              } ${
                isDark
                  ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-indigo-500/20'
                  : 'bg-neutral-950 text-white shadow-neutral-950/25'
              }`}
            >
              <span className="text-[11px] tracking-wider pointer-events-none">
                {isDragging ? 'RELEASE' : 'PULL ME'}
              </span>
              <span className="text-[8px] opacity-75 font-mono pointer-events-none mt-0.5">
                {displacement !== 0 ? `${displacement > 0 ? '+' : ''}${Math.round(displacement)}px` : '1.0 kg'}
              </span>
            </div>
          </div>

          {/* User Guide Caption & Pluck Quick-Triggers */}
          <div className="w-full flex items-center justify-between mt-2.5 px-1">
            <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
              {isDragging ? 'Dragging puck: restoring force active' : 'Drag puck or pluck to simulate'}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => triggerImpulse(-85)}
                className="px-2 py-0.5 rounded text-[9px] font-mono font-medium bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
                title="Pluck puck to -85px"
              >
                ← Pluck
              </button>
              <button
                type="button"
                onClick={() => triggerImpulse(85)}
                className="px-2 py-0.5 rounded text-[9px] font-mono font-medium bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
                title="Pluck puck to +85px"
              >
                Pluck →
              </button>
              {displacement !== 0 && (
                <button
                  type="button"
                  onClick={resetToZero}
                  className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                  title="Reset to center"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Live Differential Equation Telemetry */}
        <div className="mb-4 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-100 dark:border-neutral-800/60 grid grid-cols-3 gap-2 text-center font-mono">
          <div>
            <div className="text-[9px] text-neutral-400 uppercase">Pos (x)</div>
            <div className="text-xs font-bold text-neutral-900 dark:text-neutral-200">
              {displacement > 0 ? `+${displacement.toFixed(1)}` : displacement.toFixed(1)} <span className="text-[9px] font-normal text-neutral-400">px</span>
            </div>
          </div>
          <div>
            <div className="text-[9px] text-neutral-400 uppercase">Velocity (v)</div>
            <div className="text-xs font-bold text-neutral-900 dark:text-neutral-200">
              {velocity.toFixed(0)} <span className="text-[9px] font-normal text-neutral-400">px/s</span>
            </div>
          </div>
          <div>
            <div className="text-[9px] text-neutral-400 uppercase">Restoring (F)</div>
            <div className="text-xs font-bold text-neutral-900 dark:text-indigo-400">
              {(-(stiffness * displacement) / 100).toFixed(1)} <span className="text-[9px] font-normal text-neutral-400">N</span>
            </div>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-3 pt-1 font-mono text-xs text-neutral-600 dark:text-neutral-300">
          <div>
            <div className="flex justify-between mb-1">
              <span>Stiffness (k)</span>
              <span className="text-neutral-900 dark:text-indigo-400 font-semibold">{stiffness} N/m</span>
            </div>
            <input
              type="range"
              data-cursor="tension"
              data-cursor-text="TENSION / DRAG"
              min="100"
              max="800"
              step="10"
              value={stiffness}
              onChange={(e) => {
                const val = Number(e.target.value);
                setStiffness(val);
                stateRef.current.k = val;
                wakePhysicsLoop();
              }}
              className="w-full accent-neutral-950 dark:accent-indigo-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span>Damping (c)</span>
              <span className="text-neutral-900 dark:text-indigo-400 font-semibold">{damping} Ns/m</span>
            </div>
            <input
              type="range"
              data-cursor="tension"
              data-cursor-text="TENSION / DRAG"
              min="4"
              max="60"
              step="1"
              value={damping}
              onChange={(e) => {
                const val = Number(e.target.value);
                setDamping(val);
                stateRef.current.c = val;
                wakePhysicsLoop();
              }}
              className="w-full accent-neutral-950 dark:accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Quick Presets */}
          <div className="pt-2 flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-neutral-400 uppercase mr-1">Presets:</span>
            <button
              type="button"
              onClick={() => applyPreset(420, 10)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                damping <= 12
                  ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-semibold'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
              }`}
            >
              Oscillating
            </button>
            <button
              type="button"
              onClick={() => applyPreset(400, 38)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                damping >= 35 && damping <= 45
                  ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-semibold'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
              }`}
            >
              Critically Damped
            </button>
            <button
              type="button"
              onClick={() => applyPreset(750, 22)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                stiffness >= 700
                  ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-semibold'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
              }`}
            >
              High Rigidity
            </button>
          </div>
        </div>
      </div>

      {/* Physics Footer Telemetry */}
      <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
        <span className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-indigo-500" />
          <span>Settling Time: ~{settlingTime}s</span>
          <span className="text-neutral-300 dark:text-neutral-700">|</span>
          <span className="text-neutral-700 dark:text-neutral-300">{regime}</span>
        </span>
        <span className="text-neutral-400 dark:text-neutral-500">Runge-Kutta / Semi-Implicit</span>
      </div>
    </div>
  );
};
