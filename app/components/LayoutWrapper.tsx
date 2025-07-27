'use client';

import { useEffect, useState, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { SoundProvider } from './SoundProvider';
import { ToastProvider } from './Toast';
import { PageLoadProgress } from './PageLoadProgress';
import { ScrollToTop } from './ScrollToTop';
import { ThemeProvider } from '../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { ScrollProgress } from './ScrollProgress';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

const getTransitionDirection = (currentPath: string, previousPath: string | null) => {
  // If no previous path, default to slide in from right
  if (!previousPath) {
    return { enter: 30, exit: -30 };
  }

  // Define route hierarchy for logical transitions
  const routes = {
    '/': 0,
    '/work': 1,
    '/pricing': 1,
    '/hire': 2,
    '/cv': 2,
  };

  // Get base paths for comparison
  const currentBase = currentPath.split('/').slice(0, 2).join('/') || '/';
  const previousBase = previousPath.split('/').slice(0, 2).join('/') || '/';

  // Handle work detail pages
  if (currentPath.includes('/work/') && !previousPath.includes('/work/')) {
    return { enter: 100, exit: -50 }; // Going into project detail
  }
  if (!currentPath.includes('/work/') && previousPath.includes('/work/')) {
    return { enter: -50, exit: 100 }; // Coming back from project detail
  }

  // Use hierarchy for other pages
  const currentLevel = routes[currentBase as keyof typeof routes] ?? 1;
  const previousLevel = routes[previousBase as keyof typeof routes] ?? 1;

  if (currentLevel > previousLevel) {
    return { enter: 50, exit: -30 }; // Going deeper
  } else if (currentLevel < previousLevel) {
    return { enter: -30, exit: 50 }; // Going back
  } else {
    return { enter: 30, exit: -30 }; // Same level
  }
};

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prevPathnameRef = useRef<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Service worker registration
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log(
            'Service Worker registration successful with scope: ',
            registration.scope
          );
        })
        .catch((err) => {
          console.error('Service Worker registration failed: ', err);
        });
    }
  }, []);

  // Initialize and track ready state
  useEffect(() => {
    setIsReady(true);
  }, []);

  // Get transition directions
  const { enter, exit } = getTransitionDirection(pathname, prevPathnameRef.current);

  // Update previous pathname ref after component mounts but before next render
  useEffect(() => {
    // Store the current pathname as previous for the next navigation
    return () => {
      prevPathnameRef.current = pathname;
    };
  }, [pathname]);

  // Don't render animations until ready to prevent hydration issues
  if (!isReady) {
    return (
      <ThemeProvider>
        <ToastProvider>
          <SoundProvider>
            <ThemeToggle />
            <ScrollProgress />
            <PageLoadProgress />
            <ScrollToTop />
            <main className="w-full">{children}</main>
            <Analytics />
            <SpeedInsights />
          </SoundProvider>
        </ToastProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <SoundProvider>
          <ThemeToggle />
          <ScrollProgress />
          <PageLoadProgress />
          <ScrollToTop />
          <div className="relative w-full">
            <AnimatePresence mode="wait" initial={false}>
              <motion.main
                key={pathname}
                initial={{
                  opacity: 0,
                  x: enter,
                  scale: 0.98,
                }}
                animate={{ 
                  opacity: 1, 
                  x: 0, 
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  x: exit,
                  scale: 0.96,
                  transition: {
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1],
                  },
                }}
                transition={{
                  duration: 0.5,
                  ease: [0.4, 0, 0.2, 1],
                  opacity: { duration: 0.3 },
                }}
                className="w-full"
                style={{
                  // Ensure smooth hardware acceleration
                  willChange: 'transform, opacity',
                  backfaceVisibility: 'hidden',
                  perspective: 1000,
                }}
              >
                {children}
              </motion.main>
            </AnimatePresence>
          </div>
          <Analytics />
          <SpeedInsights />
        </SoundProvider>
      </ToastProvider>
    </ThemeProvider>
  );
} 