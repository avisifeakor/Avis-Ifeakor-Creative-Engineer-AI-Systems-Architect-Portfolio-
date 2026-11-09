import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Hero3DCanvasProps {
  isPlaying?: boolean;
  isDark?: boolean;
}

export const Hero3DCanvas: React.FC<Hero3DCanvasProps> = ({ isPlaying = false, isDark = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isPlayingRef = useRef(isPlaying);
  const isDarkRef = useRef(isDark);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    isDarkRef.current = isDark;
  }, [isPlaying, isDark]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera & Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || 360;
    const height = container.clientHeight || 280;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // Master Artifact Group
    const artifactGroup = new THREE.Group();
    scene.add(artifactGroup);

    // 1. Central Refractive Icosahedron Core - High-Performance Standard Material
    const coreGeometry = new THREE.IcosahedronGeometry(1.2, 0);
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: isDarkRef.current ? 0x8b5cf6 : 0x4f46e5,
      roughness: 0.18,
      metalness: 0.45,
      transparent: true,
      opacity: 0.88,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    artifactGroup.add(coreMesh);

    // Wireframe Cage for the core
    const wireGeometry = new THREE.IcosahedronGeometry(1.28, 0);
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: isDarkRef.current ? 0xc4b5fd : 0x818cf8,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const wireMesh = new THREE.Mesh(wireGeometry, wireMaterial);
    artifactGroup.add(wireMesh);

    // 2. Outer Concentric Precision Gimbal Rings
    const ringMaterials = [
      new THREE.MeshStandardMaterial({
        color: isDarkRef.current ? 0x64748b : 0xd1d5db,
        metalness: 0.85,
        roughness: 0.2,
      }),
      new THREE.MeshStandardMaterial({
        color: isDarkRef.current ? 0xa855f7 : 0xf59e0b,
        metalness: 0.9,
        roughness: 0.25,
      }),
      new THREE.MeshStandardMaterial({
        color: isDarkRef.current ? 0x38bdf8 : 0x0ea5e9,
        metalness: 0.8,
        roughness: 0.3,
      }),
    ];

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.045, 16, 64), ringMaterials[0]);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.35, 0.04, 16, 64), ringMaterials[1]);
    const ring3 = new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.035, 16, 64), ringMaterials[2]);

    ring1.rotation.x = Math.PI / 3;
    ring2.rotation.y = Math.PI / 4;
    ring3.rotation.z = Math.PI / 6;

    artifactGroup.add(ring1);
    artifactGroup.add(ring2);
    artifactGroup.add(ring3);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, isDarkRef.current ? 1.0 : 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, isDarkRef.current ? 1.8 : 2.5);
    dirLight1.position.set(5, 6, 4);
    scene.add(dirLight1);

    const pointLight = new THREE.PointLight(isDarkRef.current ? 0xa855f7 : 0x3b82f6, 2.5, 10);
    pointLight.position.set(-3, -2, 2);
    scene.add(pointLight);

    // Physics & Interaction State
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0.1;
    let targetRotY = -0.2;
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let velX = 0;
    let velY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) return;
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = mouseX * 0.5;
      targetRotX = -mouseY * 0.4;
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
      velX = 0;
      velY = 0;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleDrag = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevX;
      const deltaY = e.clientY - prevY;
      velX = deltaX * 0.008;
      velY = deltaY * 0.008;
      targetRotY += velX;
      targetRotX += velY;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mousedown', handleMouseDown);

    // Animation Loop with Viewport Visibility Caching
    let animId: number = 0;
    let isVisible = true;
    const clock = new THREE.Clock();

    const animate = () => {
      if (!isVisible) {
        animId = 0;
        return;
      }
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Inertia decay if not dragging
      if (!isDragging) {
        velX *= 0.94;
        velY *= 0.94;
        targetRotY += velX;
        targetRotX += velY;
      }

      // Smooth lerp rotation towards target
      artifactGroup.rotation.y += (targetRotY - artifactGroup.rotation.y) * 0.06;
      artifactGroup.rotation.x += (targetRotX - artifactGroup.rotation.x) * 0.06;

      // Independent continuous gyroscope spins
      const speedMult = isPlayingRef.current ? 2.5 : 1.0;
      ring1.rotation.x += delta * 0.45 * speedMult;
      ring1.rotation.y += delta * 0.25 * speedMult;

      ring2.rotation.y += delta * 0.35 * speedMult;
      ring2.rotation.z += delta * 0.5 * speedMult;

      ring3.rotation.z += delta * 0.28 * speedMult;
      ring3.rotation.x += delta * 0.38 * speedMult;

      coreMesh.rotation.y += delta * 0.6 * speedMult;
      coreMesh.rotation.x -= delta * 0.4 * speedMult;
      wireMesh.rotation.copy(coreMesh.rotation);

      // Harmonic breathing pulse when sound is playing
      const pulse = isPlayingRef.current
        ? 1.0 + Math.sin(elapsed * 4.5) * 0.08
        : 1.0 + Math.sin(elapsed * 1.5) * 0.02;
      coreMesh.scale.set(pulse, pulse, pulse);
      wireMesh.scale.set(pulse, pulse, pulse);

      // Float bobbing
      artifactGroup.position.y = Math.sin(elapsed * 1.2) * 0.12;

      // Dynamic theme color update
      coreMaterial.color.set(isDarkRef.current ? 0x8b5cf6 : 0x4f46e5);
      wireMaterial.color.set(isDarkRef.current ? 0xc4b5fd : 0x818cf8);

      renderer.render(scene, camera);
    };

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animId) {
          clock.start();
          animate();
        }
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mousedown', handleMouseDown);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      data-cursor="3d-orbit"
      className="relative w-full h-[260px] sm:h-[300px] md:h-[340px] cursor-grab active:cursor-grabbing select-none"
      title="Interactive Quantum Gyroscope — Click & drag to rotate in 3D"
    >
      <div className="absolute top-3 right-3 text-[10px] tracking-widest uppercase font-mono px-2.5 py-1 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 backdrop-blur pointer-events-none text-neutral-600 dark:text-neutral-400 shadow-sm flex items-center gap-1.5">
        <span>THREE.JS KINETIC CORE</span>
      </div>
    </div>
  );
};
