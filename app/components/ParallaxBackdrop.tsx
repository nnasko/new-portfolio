'use client';

import { useEffect, useRef } from 'react';

// Lightweight CSS/JS parallax background that spans the whole page.
// No WebGL; uses layered gradients and a subtle grid for a modern feel.
export default function ParallaxBackdrop() {
  const layer1Ref = useRef<HTMLDivElement | null>(null); // large soft gradient
  const layer2Ref = useRef<HTMLDivElement | null>(null); // faint grid
  const layer3Ref = useRef<HTMLDivElement | null>(null); // subtle vignette drift
  const rafRef = useRef<number | null>(null);
  const scrollYRef = useRef<number>(0);
  const tickingRef = useRef<boolean>(false);

  useEffect(() => {
    const applyParallax = () => {
      tickingRef.current = false;
      const y = scrollYRef.current;
      const layer1 = layer1Ref.current;
      const layer2 = layer2Ref.current;
      const layer3 = layer3Ref.current;

      if (layer1) layer1.style.transform = `translate3d(0, ${-y * 0.06}px, 0)`;
      if (layer2) layer2.style.transform = `rotate(8deg) translate3d(0, ${-y * 0.12}px, 0)`;
      if (layer3) layer3.style.transform = `translate3d(0, ${-y * 0.2}px, 0)`;
    };

    const onScroll = () => {
      scrollYRef.current = window.scrollY || 0;
      if (!tickingRef.current) {
        tickingRef.current = true;
        rafRef.current = requestAnimationFrame(applyParallax);
      }
    };

    // Initial position
    applyParallax();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {/* Large soft gradient blobs */}
      <div
        ref={layer1Ref}
        className="absolute -top-[20vh] -left-[20vw] w-[140vw] h-[140vh] blur-2xl opacity-80 dark:opacity-90"
        style={{
          background:
            'radial-gradient(60% 50% at 20% 30%, rgba(120,120,120,0.28), rgba(120,120,120,0) 70%), ' +
            'radial-gradient(50% 40% at 75% 20%, rgba(180,180,180,0.22), rgba(180,180,180,0) 70%)',
          filter: 'saturate(1.1)'
        }}
      />

      {/* Faint grid with low opacity, rotated slightly */}
      <div
        ref={layer2Ref}
        className="absolute inset-[-10%] opacity-30 dark:opacity-35"
        style={{
          backgroundImage:
            'linear-gradient(rgba(115,115,115,0.12) 1px, transparent 1px), ' +
            'linear-gradient(90deg, rgba(115,115,115,0.12) 1px, transparent 1px)',
          backgroundSize: '36px 36px, 36px 36px',
          backgroundPosition: '0 0, 0 0',
        }}
      />

      {/* Subtle vignette drift */}
      <div
        ref={layer3Ref}
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 70% at 30% 35%, rgba(0,0,0,0.24), rgba(0,0,0,0) 60%)',
          mixBlendMode: 'overlay',
        }}
      />
    </div>
  );
}


