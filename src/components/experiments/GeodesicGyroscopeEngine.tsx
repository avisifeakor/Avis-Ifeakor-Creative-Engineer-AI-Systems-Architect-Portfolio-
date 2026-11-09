import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sliders, RotateCcw, Play, Pause, Compass, Layers } from 'lucide-react';
import { soundManager } from '../../lib/soundEffects';

interface GyroscopeProps {
  isInteractive?: boolean;
  mini?: boolean;
}

export const GeodesicGyroscopeEngine: React.FC<GyroscopeProps> = ({
  isInteractive = true,
  mini = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [rpm, setRpm] = useState<number>(3200);
  const [damping, setDamping] = useState<number>(0.985);
  const [precessionRate, setPrecessionRate] = useState<number>(0.4);
  const [materialTheme, setMaterialTheme] = useState<'brass' | 'titanium' | 'obsidian'>('brass');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(60);

  const sceneRefs = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    ring1: THREE.Mesh;
    ring2: THREE.Mesh;
    ring3: THREE.Mesh;
    rotor: THREE.Group;
    materials: THREE.Material[];
    angVel1: number;
    angVel2: number;
    angVel3: number;
    isDragging: boolean;
    prevX: number;
    prevY: number;
    activeAxis: 'x' | 'y' | 'z';
  }>({} as any);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      mini ? 48 : 40,
      container.clientWidth / (container.clientHeight || 1),
      0.1,
      100
    );
    camera.position.set(0, 1.2, mini ? 4.2 : 3.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xec4899, 1.8);
    rimLight.position.set(-4, -2, -3);
    scene.add(rimLight);

    const cyanFill = new THREE.DirectionalLight(0x06b6d4, 1.2);
    cyanFill.position.set(2, -4, -2);
    scene.add(cyanFill);

    // Materials Palette
    const createMetalMaterial = (theme: 'brass' | 'titanium' | 'obsidian') => {
      if (theme === 'brass') {
        return new THREE.MeshStandardMaterial({
          color: 0xd4af37,
          metalness: 0.92,
          roughness: 0.22,
        });
      } else if (theme === 'titanium') {
        return new THREE.MeshStandardMaterial({
          color: 0x818cf8,
          metalness: 0.88,
          roughness: 0.28,
        });
      } else {
        return new THREE.MeshStandardMaterial({
          color: 0x18181b,
          metalness: 0.95,
          roughness: 0.15,
        });
      }
    };

    const mainMat = createMetalMaterial(materialTheme);
    const accentMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      metalness: 0.8,
      roughness: 0.3,
    });

    // 1. Outer Gimbal Ring (Yaw - Z Axis)
    const ring1Geo = new THREE.TorusGeometry(1.6, 0.055, 16, 64);
    const ring1 = new THREE.Mesh(ring1Geo, mainMat);
    scene.add(ring1);

    // 2. Middle Gimbal Ring (Pitch - X Axis) mounted inside ring1
    const ring2Geo = new THREE.TorusGeometry(1.3, 0.05, 16, 64);
    const ring2 = new THREE.Mesh(ring2Geo, mainMat);
    ring1.add(ring2);

    // 3. Inner Gimbal Ring (Roll - Y Axis) mounted inside ring2
    const ring3Geo = new THREE.TorusGeometry(1.0, 0.045, 16, 64);
    const ring3 = new THREE.Mesh(ring3Geo, mainMat);
    ring2.add(ring3);

    // 4. Center Rotor Flywheel with spokes and inertial rim
    const rotorGroup = new THREE.Group();
    const rotorRimGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.18, 36, 1, true);
    const rotorRim = new THREE.Mesh(rotorRimGeo, accentMat);
    rotorGroup.add(rotorRim);

    // Flywheel Spokes
    for (let i = 0; i < 6; i++) {
      const spokeGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.7, 8);
      const spoke = new THREE.Mesh(spokeGeo, mainMat);
      spoke.rotation.z = (i * Math.PI) / 3;
      rotorGroup.add(spoke);
    }

    // Central axle
    const axleGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 16);
    const axle = new THREE.Mesh(axleGeo, mainMat);
    rotorGroup.add(axle);

    ring3.add(rotorGroup);

    sceneRefs.current = {
      scene,
      camera,
      renderer,
      ring1,
      ring2,
      ring3,
      rotor: rotorGroup,
      materials: [mainMat, accentMat],
      angVel1: 0.015,
      angVel2: 0.022,
      angVel3: 0.018,
      isDragging: false,
      prevX: 0,
      prevY: 0,
      activeAxis: 'y',
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

    // Animation Loop
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
        const r = sceneRefs.current;
        const radPerFrame = (rpm / 60) * (Math.PI * 2) * 0.016;

        // Spin high-speed flywheel rotor
        rotorGroup.rotation.y += radPerFrame;

        // Apply gyroscopic precession torque
        const precession = Math.sin(time * 0.001 * precessionRate) * 0.02;

        if (!r.isDragging) {
          ring1.rotation.z += r.angVel1 + precession * 0.5;
          ring2.rotation.x += r.angVel2 + precession;
          ring3.rotation.y += r.angVel3;

          // Natural rotational damping
          r.angVel1 *= damping;
          r.angVel2 *= damping;
          r.angVel3 *= damping;

          // Maintain minimum ambient precession drift
          if (Math.abs(r.angVel1) < 0.004) r.angVel1 = 0.004;
          if (Math.abs(r.angVel2) < 0.006) r.angVel2 = 0.006;
          if (Math.abs(r.angVel3) < 0.005) r.angVel3 = 0.005;
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
      renderer.dispose();
    };
  }, [mini, isPaused, rpm, damping, precessionRate, materialTheme]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isInteractive) return;
    const r = sceneRefs.current;
    r.isDragging = true;
    r.prevX = e.clientX;
    r.prevY = e.clientY;
    soundManager.playClick(720);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const r = sceneRefs.current;
    if (!r.isDragging) return;

    const dx = e.clientX - r.prevX;
    const dy = e.clientY - r.prevY;
    r.prevX = e.clientX;
    r.prevY = e.clientY;

    if (r.ring1 && r.ring2) {
      r.ring1.rotation.z += dx * 0.015;
      r.ring2.rotation.x += dy * 0.015;
      r.angVel1 = dx * 0.008;
      r.angVel2 = dy * 0.008;
    }
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
        className="relative flex-1 w-full h-full min-h-[220px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#0F0814] to-[#060309] cursor-grab active:cursor-grabbing"
      >
        {/* Live HUD Overlay */}
        {!mini && (
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur border border-white/10 text-[11px] font-mono text-pink-400">
              <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
              <span>3-AXIS GIMBAL GYROSCOPE</span>
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
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur border border-pink-500/30 text-[9px] font-mono text-pink-400">
            THREE.JS GIMBAL
          </div>
        )}
      </div>

      {/* Interactive Controls Bar */}
      {!mini && (
        <div className="mt-4 p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-xs font-mono space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2 text-neutral-300">
              <Sliders className="w-3.5 h-3.5 text-pink-400" />
              <span className="font-semibold uppercase tracking-wider text-[11px]">Inertial Controls</span>
            </div>

            {/* Material Theme */}
            <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
              {(['brass', 'titanium', 'obsidian'] as const).map((mat) => (
                <button
                  key={mat}
                  onClick={() => {
                    setMaterialTheme(mat);
                    soundManager.playClick();
                  }}
                  className={`px-2.5 py-1 rounded text-[10px] uppercase font-medium transition-colors ${
                    materialTheme === mat
                      ? 'bg-pink-500 text-neutral-950 font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {mat}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-neutral-400 mb-1 text-[11px]">
                <span>Flywheel Rotor Speed</span>
                <span className="text-pink-400">{rpm} RPM</span>
              </div>
              <input
                type="range"
                min="0"
                max="6000"
                step="200"
                value={rpm}
                onChange={(e) => setRpm(parseInt(e.target.value, 10))}
                className="w-full accent-pink-400 h-1 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-neutral-400 mb-1 text-[11px]">
                <span>Precession Coupling</span>
                <span className="text-pink-400">{precessionRate.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.2"
                step="0.05"
                value={precessionRate}
                onChange={(e) => setPrecessionRate(parseFloat(e.target.value))}
                className="w-full accent-pink-400 h-1 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2 text-[10px] text-neutral-400 flex items-center justify-between">
            <span>🖱 Drag rings to impart rotational momentum and observe precession wobble</span>
            <span className="font-mono text-neutral-400">τ = r × F • L = Iω</span>
          </div>
        </div>
      )}
    </div>
  );
};
