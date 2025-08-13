'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeShowcaseProps {
  className?: string;
}

// A contained, performant Three.js showcase with a rotating torus knot and subtle particles.
// Designed to mount inside a section without affecting the rest of the page.
export default function ThreeShowcase({ className = '' }: ThreeShowcaseProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const isRunningRef = useRef<boolean>(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      50,
      Math.max(container.clientWidth, 1) / Math.max(container.clientHeight, 1),
      0.1,
      100
    );
    camera.position.set(0, 0, 6.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(5, 5, 5);
    scene.add(dir);

    // TorusKnot centerpiece
    const geometry = new THREE.TorusKnotGeometry(1.3, 0.42, 220, 32);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#d4d4d4'),
      roughness: 0.25,
      metalness: 0.6,
      envMapIntensity: 0.8,
    });
    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);

    // Overlay wireframe for tech feel
    const wireMat = new THREE.MeshBasicMaterial({ color: '#9ca3af', wireframe: true, transparent: true, opacity: 0.25 });
    const wire = new THREE.Mesh(geometry.clone(), wireMat);
    scene.add(wire);

    // Subtle particles surrounding the object
    const starCount = 500;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 3 + Math.random() * 4; // surrounding shell
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const starsGeo = new THREE.BufferGeometry();
    starsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starsMat = new THREE.PointsMaterial({ size: 0.02, color: '#a3a3a3', transparent: true, opacity: 0.7, depthWrite: false });
    const stars = new THREE.Points(starsGeo, starsMat);
    scene.add(stars);

    // Pointer parallax
    const target = { rx: 0, ry: 0 };
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width; // 0..1
      const my = (e.clientY - rect.top) / rect.height; // 0..1
      target.ry = (mx - 0.5) * 0.6;
      target.rx = (my - 0.5) * 0.6;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // Animation loop
    let last = performance.now();
    const animate = () => {
      if (!isRunningRef.current) return;
      const now = performance.now();
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;

      // Ease towards target rotation
      torusKnot.rotation.x += (target.rx - torusKnot.rotation.x) * 0.05;
      torusKnot.rotation.y += (target.ry - torusKnot.rotation.y) * 0.05;
      wire.rotation.copy(torusKnot.rotation);

      // Idle rotation
      torusKnot.rotation.z += dt * 0.2;
      wire.rotation.z = torusKnot.rotation.z;

      // Subtle star drift
      stars.rotation.y += dt * 0.05;
      stars.rotation.x += dt * 0.015;

      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    // Resize handling
    const onResize = () => {
      const w = Math.max(container.clientWidth, 1);
      const h = Math.max(container.clientHeight, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    // Visibility pause
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
      geometry.dispose();
      starsGeo.dispose();
      starsMat.dispose();
      wireMat.dispose();
      // remove canvas
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className={`relative w-full h-[320px] sm:h-[380px] md:h-[420px] ${className}`}>
      <div
        ref={containerRef}
        className="absolute inset-0 [mask-image:radial-gradient(90%_75%_at_50%_50%,black,transparent)]"
        aria-hidden
      />
    </div>
  );
}


