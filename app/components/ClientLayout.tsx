"use client";

import { ThemeProvider } from "../context/ThemeContext";
import { ThemeToggle } from "./ThemeToggle";
import { MouseEffect } from "./MouseEffect";
import { ScrollProgress } from "./ScrollProgress";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { SoundProvider, useSound } from "./SoundProvider";
import { useState, useEffect, useRef } from "react";
import { PageLoadProgress } from "./PageLoadProgress";
import { ScrollToTop } from "./ScrollToTop";

const getTransitionDirection = (
  pathname: string,
  prevPathname: string | null
) => {
  // Going to a project page
  if (pathname.includes("/work/") && !prevPathname?.includes("/work/")) {
    return { enter: 100, exit: -100 };
  }
  // Leaving a project page
  if (!pathname.includes("/work/") && prevPathname?.includes("/work/")) {
    return { enter: -100, exit: 100 };
  }
  // Default transitions
  return { enter: 20, exit: -20 };
};

const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDark = document.documentElement.classList.contains('dark');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'.split('');
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    const draw = () => {
      // Adjust fade color and opacity based on theme
      ctx.fillStyle = isDark 
        ? 'rgba(23, 23, 23, 0.1)' 
        : 'rgba(250, 250, 250, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Adjust text color based on theme
      ctx.fillStyle = isDark ? '#0FF' : '#0A0';
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);
    return () => clearInterval(interval);
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[100] pointer-events-none"
      style={{ 
        mixBlendMode: isDark ? 'screen' : 'multiply',
        opacity: isDark ? 0.9 : 0.85
      }}
    />
  );
};

const RetroGameAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showMessage, setShowMessage] = useState(false);
  const isDark = document.documentElement.classList.contains('dark');
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let frame = 0;
    const sprites: { x: number; y: number; speed: number; char: string; scale: number }[] = [];
    const gameChars = ['⬆️', '⬇️', '⬅️', '➡️', '🎮', '🕹️', '👾', '🚀', '⭐'];

    // Create initial sprites
    for (let i = 0; i < 20; i++) {
      sprites.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 2 + Math.random() * 3,
        char: gameChars[Math.floor(Math.random() * gameChars.length)],
        scale: 0.5 + Math.random() * 1.5
      });
    }

    const draw = () => {
      ctx.fillStyle = isDark ? 'rgba(23, 23, 23, 0.1)' : 'rgba(250, 250, 250, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      sprites.forEach((sprite, i) => {
        ctx.save();
        ctx.translate(sprite.x, sprite.y);
        ctx.rotate(frame * 0.02 + i);
        ctx.scale(sprite.scale, sprite.scale);
        
        const hue = (frame + i * 20) % 360;
        const opacity = isDark ? 0.9 : 0.7;
        ctx.fillStyle = `hsla(${hue}, 100%, ${isDark ? '60%' : '40%'}, ${opacity})`;
        ctx.font = '24px monospace';
        ctx.fillText(sprite.char, -12, -12);
        ctx.restore();

        sprite.x += Math.sin(frame * 0.02 + i) * sprite.speed;
        sprite.y += Math.cos(frame * 0.02 + i) * sprite.speed;

        if (sprite.x > canvas.width) sprite.x = 0;
        if (sprite.x < 0) sprite.x = canvas.width;
        if (sprite.y > canvas.height) sprite.y = 0;
        if (sprite.y < 0) sprite.y = canvas.height;
      });

      frame++;
      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    // Show message after animation
    const messageTimer = setTimeout(() => {
      setShowMessage(true);
    }, 2000);

    // Auto-hide after 5 seconds
    const hideTimer = setTimeout(() => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setShowMessage(false);
    }, 7000);

    return () => {
      clearTimeout(messageTimer);
      clearTimeout(hideTimer);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDark]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-[100] pointer-events-none"
      />
      {showMessage && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: "spring", duration: 0.8 }}
          className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] px-8 py-4 rounded-lg shadow-lg text-center backdrop-blur-sm ${
            isDark 
              ? 'bg-neutral-900/90 text-neutral-100' 
              : 'bg-neutral-100/90 text-neutral-900'
          }`}
        >
          <h2 className="text-xl mb-2">🎮 cheat code activated! 🕹️</h2>
          <p className="text-sm">you found a secret animation</p>
        </motion.div>
      )}
    </>
  );
};

export const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState<string | null>(null);
  const { playClick } = useSound();
  const [konamiIndex, setKonamiIndex] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [typedKeys, setTypedKeys] = useState('');
  const [showMatrix, setShowMatrix] = useState(false);

  useEffect(() => {
    setPrevPathname(pathname);
  }, [pathname]);

  const { enter, exit } = getTransitionDirection(pathname, prevPathname);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('button, a, [role="button"]');
      if (isInteractive) {
        playClick();
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [playClick]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Konami code
      if (e.key === KONAMI_CODE[konamiIndex]) {
        playClick();
        if (konamiIndex === KONAMI_CODE.length - 1) {
          setShowEasterEgg(true);
          setKonamiIndex(0);
          // Play retro sound effect
          const audio = new Audio('/retro-powerup.mp3');
          audio.volume = 0.3;
          audio.play().catch(() => {});
          // Auto-hide after 7 seconds
          setTimeout(() => setShowEasterEgg(false), 7000);
          console.log('%c🎮 CHEAT CODE ACTIVATED! 🕹️', 'color: #00ff00; font-size: 24px; font-weight: bold; text-shadow: 2px 2px #000;');
          console.log('%c⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️🅱️🅰️', 'color: #ff00ff; font-size: 20px; font-weight: bold;');
        } else {
          setKonamiIndex(prev => prev + 1);
        }
      } else if (!showEasterEgg) {
        setKonamiIndex(0);
      }

      // Handle Matrix easter egg
      if (!showEasterEgg) {
        setTypedKeys(prev => {
          const newKeys = (prev + e.key).toLowerCase().slice(-6);
          if (newKeys === 'matrix') {
            setShowMatrix(true);
            setTimeout(() => setShowMatrix(false), 10000);
            playClick();
            return '';
          }
          return newKeys;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [konamiIndex, playClick, typedKeys, showEasterEgg]);

  return (
    <SoundProvider>
      <ThemeProvider>
        <MouseEffect />
        <ThemeToggle />
        <ScrollProgress />
        <PageLoadProgress />
        <ScrollToTop />
        {showMatrix && <MatrixRain />}
        {showEasterEgg && <RetroGameAnimation />}
        <div className="relative w-full">
          <AnimatePresence mode="wait" initial={false}>
            <motion.main
              key={pathname}
              initial={{
                opacity: 0,
                x: enter,
                scale: pathname.includes("/work/") ? 0.95 : 1,
              }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{
                opacity: 0,
                x: exit,
                scale: pathname.includes("/work/") ? 1.05 : 1,
                transition: {
                  duration: 0.3,
                  ease: [0.22, 1, 0.36, 1],
                },
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                opacity: { duration: 0.3 },
              }}
              className="w-full"
            >
              {children}
            </motion.main>
          </AnimatePresence>
        </div>
      </ThemeProvider>
    </SoundProvider>
  );
};
