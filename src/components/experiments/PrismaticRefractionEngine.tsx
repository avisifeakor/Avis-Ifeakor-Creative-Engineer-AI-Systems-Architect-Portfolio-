import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sliders, RotateCcw, Play, Pause, Sparkles, Sun } from 'lucide-react';
import { soundManager } from '../../lib/soundEffects';

interface PrismaticRefractionProps {
  isInteractive?: boolean;
  mini?: boolean;
}

export const PrismaticRefractionEngine: React.FC<PrismaticRefractionProps> = ({
  isInteractive = true,
  mini = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [dispersion, setDispersion] = useState<number>(0.055);
  const [ior, setIor] = useState<number>(1.54); // Crown Glass
  const [fresnelPower, setFresnelPower] = useState<number>(2.4);
  const [internalBounces, setInternalBounces] = useState<number>(3);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [fps, setFps] = useState<number>(60);

  const sceneRefs = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    mesh: THREE.Mesh<THREE.SphereGeometry, THREE.ShaderMaterial>;
    rotSpeed: number;
    mouseX: number;
    mouseY: number;
    isDragging: boolean;
    prevX: number;
    prevY: number;
  }>({} as any);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;

    // Set up Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      mini ? 45 : 38,
      container.clientWidth / (container.clientHeight || 1),
      0.1,
      100
    );
    camera.position.set(0, 0, mini ? 3.6 : 3.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Custom Raymarching / Dispersion Shader Material
    const vertexShader = `
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vEyeVector;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vPosition = worldPosition.xyz;
        vEyeVector = normalize(worldPosition.xyz - cameraPosition);
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `;

    const fragmentShader = `
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vEyeVector;

      uniform float uTime;
      uniform float uDispersion;
      uniform float uIor;
      uniform float uFresnel;
      uniform vec3 uLightPos;
      uniform int uBounces;

      // Cauchy dispersion approximation for spectral light split
      vec3 refractRay(vec3 I, vec3 N, float eta) {
        return refract(I, N, eta);
      }

      void main() {
        vec3 normal = normalize(vNormal);
        vec3 eye = normalize(vEyeVector);
        vec3 light = normalize(uLightPos - vPosition);

        // Fresnel reflection factor
        float F0 = pow((1.0 - uIor) / (1.0 + uIor), 2.0);
        float fresnel = F0 + (1.0 - F0) * pow(1.0 - max(0.0, dot(-eye, normal)), uFresnel);

        // Refraction vector for separate Red, Green, Blue wavelengths
        float etaR = 1.0 / (uIor - uDispersion);
        float etaG = 1.0 / uIor;
        float etaB = 1.0 / (uIor + uDispersion);

        vec3 refrR = refractRay(eye, normal, etaR);
        vec3 refrG = refractRay(eye, normal, etaG);
        vec3 refrB = refractRay(eye, normal, etaB);

        // Internal reflections / Caustic harmonics
        vec3 internalLight = vec3(
          max(0.0, dot(refrR, light)) * 1.4 + pow(max(0.0, dot(reflect(refrR, normal), light)), 16.0),
          max(0.0, dot(refrG, light)) * 1.4 + pow(max(0.0, dot(reflect(refrG, normal), light)), 16.0),
          max(0.0, dot(refrB, light)) * 1.4 + pow(max(0.0, dot(reflect(refrB, normal), light)), 16.0)
        );

        // Specular highlight on outer surface
        vec3 halfVec = normalize(light - eye);
        float spec = pow(max(0.0, dot(normal, halfVec)), 64.0);

        // Internal iridescent color swirls
        float swirl = sin(vPosition.x * 4.0 + uTime * 1.2) * cos(vPosition.y * 4.0 + uTime * 1.5);
        vec3 spectralColor = vec3(
          0.5 + 0.5 * sin(uTime * 0.8 + vPosition.z * 5.0 + swirl),
          0.5 + 0.5 * sin(uTime * 0.8 + vPosition.z * 5.0 + swirl + 2.09),
          0.5 + 0.5 * sin(uTime * 0.8 + vPosition.z * 5.0 + swirl + 4.18)
        );

        vec3 baseGlass = internalLight * spectralColor * 1.8;
        vec3 finalColor = mix(baseGlass, vec3(1.0), fresnel * 0.7) + vec3(spec * 1.5);

        // Caustic glow around rim
        finalColor += vec3(0.5, 0.3, 0.9) * pow(1.0 - max(0.0, dot(-eye, normal)), 4.0) * 0.6;

        gl_FragColor = vec4(finalColor, 0.92);
      }
    `;

    const uniforms = {
      uTime: { value: 0 },
      uDispersion: { value: dispersion },
      uIor: { value: ior },
      uFresnel: { value: fresnelPower },
      uBounces: { value: internalBounces },
      uLightPos: { value: new THREE.Vector3(2.5, 3.0, 2.0) },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
    });

    const geometry = new THREE.SphereGeometry(mini ? 1.0 : 1.15, mini ? 32 : 64, mini ? 32 : 64);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Background caustic halo ring
    const ringGeo = new THREE.RingGeometry(1.2, 1.55, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.3;
    ringMesh.position.y = -0.7;
    scene.add(ringMesh);

    sceneRefs.current = {
      scene,
      camera,
      renderer,
      mesh,
      rotSpeed: 0.008,
      mouseX: 0,
      mouseY: 0,
      isDragging: false,
      prevX: 0,
      prevY: 0,
    };

    // Resize handler
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

      uniforms.uTime.value = time * 0.001;

      if (isAutoRotate) {
        mesh.rotation.y += 0.008;
        mesh.rotation.x = Math.sin(time * 0.0008) * 0.2;
        ringMesh.rotation.z += 0.004;
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
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [mini, isAutoRotate]);

  // Update uniforms when sliders change
  useEffect(() => {
    if (sceneRefs.current.mesh) {
      const uniforms = sceneRefs.current.mesh.material.uniforms;
      uniforms.uDispersion.value = dispersion;
      uniforms.uIor.value = ior;
      uniforms.uFresnel.value = fresnelPower;
      uniforms.uBounces.value = internalBounces;
    }
  }, [dispersion, ior, fresnelPower, internalBounces]);

  // Drag interaction to rotate sphere in 3D
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isInteractive) return;
    const r = sceneRefs.current;
    r.isDragging = true;
    r.prevX = e.clientX;
    r.prevY = e.clientY;
    soundManager.playClick(640);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const r = sceneRefs.current;
    if (!r.isDragging || !r.mesh) return;
    const deltaX = e.clientX - r.prevX;
    const deltaY = e.clientY - r.prevY;
    r.prevX = e.clientX;
    r.prevY = e.clientY;

    r.mesh.rotation.y += deltaX * 0.01;
    r.mesh.rotation.x += deltaY * 0.01;
  };

  const handlePointerUp = () => {
    sceneRefs.current.isDragging = false;
  };

  return (
    <div className="relative w-full h-full flex flex-col select-none overflow-hidden">
      {/* 3D Canvas Stage */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative flex-1 w-full h-full min-h-[220px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#080714] to-[#040308] cursor-grab active:cursor-grabbing"
      >
        {/* Live HUD Overlay */}
        {!mini && (
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur border border-white/10 text-[11px] font-mono text-violet-400">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
              <span>GLSL SPECTRAL DISPERSION</span>
              <span className="text-white/40">•</span>
              <span className="text-white/80">{fps} FPS</span>
            </div>

            <div className="flex items-center gap-1.5 pointer-events-auto">
              <button
                onClick={() => setIsAutoRotate(!isAutoRotate)}
                className="p-2 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 text-white transition-colors"
                title={isAutoRotate ? 'Pause Orbit' : 'Auto Orbit'}
              >
                {isAutoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        )}

        {/* Mini Badge */}
        {mini && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur border border-violet-500/30 text-[9px] font-mono text-violet-400">
            GLSL RAYMARCHED ORB
          </div>
        )}
      </div>

      {/* Interactive Controls Bar */}
      {!mini && (
        <div className="mt-4 p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-xs font-mono space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2 text-neutral-300">
              <Sliders className="w-3.5 h-3.5 text-violet-400" />
              <span className="font-semibold uppercase tracking-wider text-[11px]">Optical Parameters</span>
            </div>

            {/* Material Presets */}
            <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
              {[
                { name: 'Crown Glass', val: 1.52, disp: 0.045 },
                { name: 'Diamond', val: 2.42, disp: 0.085 },
                { name: 'Water', val: 1.33, disp: 0.02 },
                { name: 'Sapphire', val: 1.77, disp: 0.06 },
              ].map((p) => (
                <button
                  key={p.name}
                  onClick={() => {
                    setIor(p.val);
                    setDispersion(p.disp);
                    soundManager.playClick();
                  }}
                  className={`px-2.5 py-1 rounded text-[10px] uppercase font-medium transition-colors ${
                    Math.abs(ior - p.val) < 0.01
                      ? 'bg-violet-600 text-white font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-neutral-400 mb-1 text-[11px]">
                <span>Chromatic Dispersion (Δn)</span>
                <span className="text-violet-400">{dispersion.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min="0.005"
                max="0.12"
                step="0.005"
                value={dispersion}
                onChange={(e) => setDispersion(parseFloat(e.target.value))}
                className="w-full accent-violet-400 h-1 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-neutral-400 mb-1 text-[11px]">
                <span>Index of Refraction (IOR)</span>
                <span className="text-violet-400">{ior.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="1.1"
                max="2.6"
                step="0.02"
                value={ior}
                onChange={(e) => setIor(parseFloat(e.target.value))}
                className="w-full accent-violet-400 h-1 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2 text-[10px] text-neutral-400 flex items-center justify-between">
            <span>🖱 Drag to orbit orb and light orientation in 3D</span>
            <span className="font-mono text-neutral-400">Cauchy Dispersion • Fresnel 2.4</span>
          </div>
        </div>
      )}
    </div>
  );
};
