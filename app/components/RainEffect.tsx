"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

interface Particle {
  id: number;
  x: number;
  delay: number;
  duration: number;
}

export const RainEffect = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  // Memoize particles to prevent unnecessary recalculations
  const memoizedParticles = useMemo(() => {
    const particleCount = 25; // Reduced from 50 for better performance
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 1.5 + Math.random() * 1.5, // Slightly faster animations
    }));
  }, []);

  useEffect(() => {
    setParticles(memoizedParticles);
  }, [memoizedParticles]);

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-40"
      style={{ willChange: "auto" }} // Let browser optimize
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-[1px] h-[8px] bg-neutral-900/20 dark:bg-neutral-400/15"
          initial={{ x: `${particle.x}vw`, y: "-10px" }}
          animate={{
            y: "100vh",
            opacity: [0, 0.8, 0.8, 0], // Slightly reduced opacity
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "linear",
          }}
          style={{
            willChange: "transform, opacity", // Optimize for GPU
          }}
        />
      ))}
    </div>
  );
};
