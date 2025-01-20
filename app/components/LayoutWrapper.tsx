'use client';

import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { SoundProvider } from './SoundProvider';
import { ToastProvider } from './Toast';
import { MouseEffect } from './MouseEffect';
import { PageLoadProgress } from './PageLoadProgress';
import { ScrollToTop } from './ScrollToTop';
import { ThemeProvider } from '../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { ScrollProgress } from './ScrollProgress';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

const getTransitionDirection = (pathname: string, prevPathname: string | null) => {
  // Going to a project page
  if (pathname.includes('/work/') && !prevPathname?.includes('/work/')) {
    return { enter: 100, exit: -100 };
  }
  // Leaving a project page
  if (!pathname.includes('/work/') && prevPathname?.includes('/work/')) {
    return { enter: -100, exit: 100 };
  }
  // Default transitions
  return { enter: 20, exit: -20 };
};

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState<string | null>(null);

  useEffect(() => {
    setPrevPathname(pathname);
  }, [pathname]);

  const { enter, exit } = getTransitionDirection(pathname, prevPathname);

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

  return (
    <ThemeProvider>
      <ToastProvider>
        <SoundProvider>
          <MouseEffect />
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
                  scale: pathname.includes('/work/') ? 0.95 : 1,
                }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  x: exit,
                  scale: pathname.includes('/work/') ? 1.05 : 1,
                  transition: {
                    duration: 0.3,
                    ease: [0.22, 1, 0.36, 1],
                  },
                }}
                transition={{
                  type: 'spring',
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
          <Analytics />
          <SpeedInsights />
        </SoundProvider>
      </ToastProvider>
    </ThemeProvider>
  );
} 