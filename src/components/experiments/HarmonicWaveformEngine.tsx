import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sliders, RotateCcw, Play, Pause, Waves, Eye } from 'lucide-react';
import { soundManager } from '../../lib/soundEffects';

interface HarmonicWaveProps {
  isInteractive?: boolean;
  mini?: boolean;
}

export const HarmonicWaveformEngine: React.FC<HarmonicWaveProps> = ({
  isInteractive = true,
  mini = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [ratioMode, setRatioMode] = useState<'3:2' | '1:1' | '5:4' | 'golden'>('3:2');
  const [waveSpeed, setWaveSpeed] = useState<number>(1.2);
  const [amplitude, setAmplitude] = useState<number>(0.35);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(60);

  const sceneRefs = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    mesh: THREE.Mesh;
    wireMesh: THREE.Mesh;
    geometry: THREE.PlaneGeometry;
    basePositions: Float32Array;
    isDragging: boolean;
    prevX: number;
    prevY: number;
    camPhi: number;
    camTheta: number;
  }>({} as any);

  const ratioValues = {
    '1:1': { fx: 1.0, fy: 1.0 },
    '3:2': { fx: 1.5, fy: 1.0 },
    '5:4': { fx: 1.25, fy: 1.0 },
    golden: { fx: 1.618, fy: 1.0 },
  };

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      mini ? 48 : 42,
      container.clientWidth / (container.clientHeight || 1),
      0.1,
      100
    );
    camera.position.set(0, 3.2, mini ? 4.2 : 3.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Directional and ambient lights
    const amb = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(amb);
    const dir = new THREE.DirectionalLight(0x38bdf8, 2.2);
    dir.position.set(3, 6, 4);
    scene.add(dir);
    const dirBack = new THREE.DirectionalLight(0x818cf8, 1.4);
    dirBack.position.set(-3, 2, -3);
    scene.add(dirBack);

    // Plane heightfield geometry
    const gridRes = mini ? 36 : 56;
    const geo = new THREE.PlaneGeometry(3.6, 3.6, gridRes, gridRes);
    geo.rotateX(-Math.PI / 2.3);

    const basePositions = new Float32Array(geo.attributes.position.array);

    const solidMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.25,
      metalness: 0.7,
      side: THREE.DoubleSide,
      wireframe: false,
    });

    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });

    const mesh = new THREE.Mesh(geo, solidMat);
    const wireMesh = new THREE.Mesh(geo, wireMat);
    wireMesh.position.y += 0.005;

    scene.add(mesh);
    scene.add(wireMesh);

    sceneRefs.current = {
      scene,
      camera,
      renderer,
      mesh,
      wireMesh,
      geometry: geo,
      basePositions,
      isDragging: false,
      prevX: 0,
      prevY: 0,
      camPhi: 0.65,
      camTheta: 0,
    };

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / (h || 1);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObs = new ResizeObserver(handleResize);
    resizeObs.observe(container);

    // Animation loop
    let animId: number;
    let frameCount = 0;
    let lastFps = performance.now();

    const animate = (time: number) => {
      frameCount++;
      if (time - lastFps > 800) {
        setFps(Math.round((frameCount * 1000) / (time - lastFps)));
        frameCount = 0;
        lastFps = time;
      }

      if (!isPaused) {
        const tSec = time * 0.001 * waveSpeed;
        const pos = geo.attributes.position;
        const base = basePositions;
        const r = ratioValues[ratioMode];

        for (let i = 0; i < pos.count; i++) {
          const bx = base[i * 3];
          const bz = base[i * 3 + 2];

          // 3D Lissajous interference equation
          const wave1 = Math.sin(bx * 3.2 * r.fx + tSec * 2.0);
          const wave2 = Math.cos(bz * 3.2 * r.fy - tSec * 1.6);
          const wave3 = Math.sin((bx + bz) * 2.0 + tSec * 1.2);
          const radial = Math.sin(Math.hypot(bx, bz) * 5.0 - tSec * 2.5) * 0.4;

          const elevation = (wave1 * wave2 + wave3 * 0.5 + radial) * amplitude;
          pos.setY(i, elevation);
        }

        pos.needsUpdate = true;
        geo.computeVertexNormals();

        // Slow ambient yaw drift
        if (!sceneRefs.current.isDragging) {
          mesh.rotation.y += 0.003;
          wireMesh.rotation.y += 0.003;
        }
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      resizeObs.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geo.dispose();
      solidMat.dispose();
      wireMat.dispose();
      renderer.dispose();
    };
  }, [mini, ratioMode, waveSpeed, amplitude, isPaused]);

  useEffect(() => {
    if (sceneRefs.current.mesh) {
      (sceneRefs.current.mesh.material as THREE.MeshStandardMaterial).wireframe = wireframe;
    }
  }, [wireframe]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isInteractive) return;
    const r = sceneRefs.current;
    r.isDragging = true;
    r.prevX = e.clientX;
    r.prevY = e.clientY;
    soundManager.playClick(680);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const r = sceneRefs.current;
    if (!r.isDragging || !r.mesh) return;

    const dx = e.clientX - r.prevX;
    const dy = e.clientY - r.prevY;
    r.prevX = e.clientX;
    r.prevY = e.clientY;

    r.mesh.rotation.y += dx * 0.01;
    r.wireMesh.rotation.y += dx * 0.01;
    r.mesh.rotation.x += dy * 0.01;
    r.wireMesh.rotation.x += dy * 0.01;
  };

  const handlePointerUp = () => {
    sceneRefs.current.isDragging = false;
  };

  return (
    <div className="relative w-full h-full flex flex-col select-none overflow-hidden">
      {/* 3D Stage */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative flex-1 w-full h-full min-h-[220px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#060D1A] to-[#03060C] cursor-grab active:cursor-grabbing"
      >
        {/* Live HUD Overlay */}
        {!mini && (
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur border border-white/10 text-[11px] font-mono text-sky-400">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              <span>LISSAJOUS HARMONIC MESH</span>
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
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur border border-sky-500/30 text-[9px] font-mono text-sky-400">
            GLSL LISSAJOUS
          </div>
        )}
      </div>

      {/* Interactive Controls Bar */}
      {!mini && (
        <div className="mt-4 p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-xs font-mono space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2 text-neutral-300">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-semibold uppercase tracking-wider text-[11px]">Harmonic Superposition</span>
            </div>

            {/* Ratio Mode Selector */}
            <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
              {(['3:2', '1:1', '5:4', 'golden'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setRatioMode(mode);
                    soundManager.playClick();
                  }}
                  className={`px-2.5 py-1 rounded text-[10px] uppercase font-medium transition-colors ${
                    ratioMode === mode
                      ? 'bg-sky-500 text-neutral-950 font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {mode === 'golden' ? 'Golden φ' : mode}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setWireframe(!wireframe);
                soundManager.playClick();
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] bg-neutral-950 border border-neutral-800 text-sky-400 hover:text-sky-300"
            >
              <Eye className="w-3 h-3" />
              <span>{wireframe ? 'Solid' : 'Wireframe'}</span>
            </button>
          </div>

          {/* Sliders Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-neutral-400 mb-1 text-[11px]">
                <span>Wave Propagation Speed</span>
                <span className="text-sky-400">{waveSpeed.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={waveSpeed}
                onChange={(e) => setWaveSpeed(parseFloat(e.target.value))}
                className="w-full accent-sky-400 h-1 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-neutral-400 mb-1 text-[11px]">
                <span>Sine Superposition Amplitude</span>
                <span className="text-sky-400">{amplitude.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={amplitude}
                onChange={(e) => setAmplitude(parseFloat(e.target.value))}
                className="w-full accent-sky-400 h-1 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2 text-[10px] text-neutral-400 flex items-center justify-between">
            <span>🖱 Drag to orbit camera around 3D wave interference nodes</span>
            <span className="font-mono text-neutral-400">z = Σ Aᵢ sin(kᵢ · x + ωᵢ t)</span>
          </div>
        </div>
      )}
    </div>
  );
};
