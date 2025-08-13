'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Minimal wireframe sphere with subtle rotation
export default function ThreeHeroGlobe() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const isRunningRef = useRef<boolean>(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      Math.max(container.clientWidth, 1) / Math.max(container.clientHeight, 1),
      0.1,
      100
    );
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Theme-aware colors
    const prefersDark = typeof window !== 'undefined' && (document.documentElement.classList.contains('dark') || window.matchMedia('(prefers-color-scheme: dark)').matches);
    const wireColor = new THREE.Color(prefersDark ? '#444444' : '#cccccc');

    // Simple wireframe sphere
    const radius = 1.8;
    const sphereGeo = new THREE.SphereGeometry(radius, 20, 16);
    const wireMat = new THREE.MeshBasicMaterial({ 
      color: wireColor, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.3 
    });
    const sphere = new THREE.Mesh(sphereGeo, wireMat);
    scene.add(sphere);

    // Just a few ambient particles
    const particleCount = 50;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const r = 4 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = r * Math.cos(phi);
    }
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particlesMat = new THREE.PointsMaterial({ 
      size: 0.015, 
      color: wireColor, 
      transparent: true, 
      opacity: 0.4, 
      depthWrite: false 
    });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    // Subtle mouse parallax
    const target = { rx: 0, ry: 0 };
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;
      target.ry = (mx - 0.5) * 0.2;
      target.rx = (my - 0.5) * 0.2;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // Gentle animation
    let last = performance.now();
    const animate = () => {
      if (!isRunningRef.current) return;
      const now = performance.now();
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;

      // Slow rotation
      sphere.rotation.y += dt * 0.1;
      sphere.rotation.x += dt * 0.05;

      // Subtle parallax
      sphere.rotation.x += (target.rx - sphere.rotation.x) * 0.03;
      sphere.rotation.y += (target.ry - sphere.rotation.y) * 0.03;

      // Gentle particle drift
      particles.rotation.y += dt * 0.02;

      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    // Resize
    const onResize = () => {
      const w = Math.max(container.clientWidth, 1);
      const h = Math.max(container.clientHeight, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    // Tab visibility
    const onVisibility = () => {
      const visible = document.visibilityState === 'visible';
      isRunningRef.current = visible;
      if (visible && rafRef.current === null) rafRef.current = requestAnimationFrame(animate);
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointerMove);
      resizeObserver.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      renderer.dispose();
      sphereGeo.dispose();
      particlesGeo.dispose();
      wireMat.dispose();
      particlesMat.dispose();
    };
  }, []);

  return (
    <div className="pointer-events-none relative w-full h-full z-10">
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full"
        aria-hidden
      />
    </div>
  );
}


