import { useSound } from "./SoundProvider";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback } from "react";

export const RainEffect = () => {
  const { isAmbientPlaying, isMuted } = useSound();

  const createRainDrop = useCallback((index: number) => {
    const left = Math.random() * 100;
    const animationDuration = 1 + Math.random() * 0.5;
    const animationDelay = Math.random() * 3;

    return (
      <div 
        key={index} 
        className="absolute top-0 transform-gpu"
        style={{ left: `${left}%` }}
      >
        <div
          className="rain-drop transform-gpu"
          style={{
            animationDelay: `${animationDelay}s`,
            animationDuration: `${animationDuration}s`
          }}
        />
        <div
          className="splash transform-gpu"
          style={{
            position: 'fixed',
            left: '-8px',
            bottom: '20px',
            animationDelay: `${animationDelay + animationDuration - 0.2}s`,
            animationDuration: '0.6s'
          }}
        />
      </div>
    );
  }, []);

  return (
    <AnimatePresence>
      {!isMuted && isAmbientPlaying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="pointer-events-none fixed inset-0 z-[1] overflow-hidden bg-neutral-900/5 dark:bg-neutral-50/5"
          style={{ mixBlendMode: "overlay" }}
        >
          <div className="rain-container absolute inset-0 transform-gpu">
            {[...Array(80)].map((_, i) => createRainDrop(i))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 