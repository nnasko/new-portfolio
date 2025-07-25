'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MinimalLink } from "../components/MinimalLink";
import { RevealText } from "../components/RevealText";
import { useScrollTracker } from "../../lib/animation-utils";
import { useTransform } from "framer-motion";

export default function OfflinePage() {
  const { scrollY, scrollDirection } = useScrollTracker();
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Transform scroll position to header opacity and blur (matching StickyHeader)
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95]);
  const headerScale = useTransform(scrollY, [0, 200], [1, 0.98]);
  const blurValue = useTransform(scrollY, [0, 100], [0, 8]);
  const backgroundOpacity = useTransform(scrollY, [0, 50], [0.8, 1]);

  // Navigation scroll behavior (matching StickyHeader exactly)
  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      const currentScrollY = latest;
      const scrollDifference = Math.abs(currentScrollY - lastScrollY);

      // Show header when scrolling up or at the top
      if (scrollDirection === "up" || currentScrollY < 100) {
        setIsNavVisible(true);
      }
      // Hide header when scrolling down with sufficient velocity
      else if (scrollDirection === "down" && scrollDifference > 10 && currentScrollY > 200) {
        setIsNavVisible(false);
      }

      setLastScrollY(currentScrollY);
    });

    return () => unsubscribe();
  }, [scrollY, scrollDirection, lastScrollY]);

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Mobile-optimized navigation */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          opacity: headerOpacity,
          backdropFilter: `blur(${blurValue}px)`,
          scale: headerScale,
        }}
        initial={{ y: 0 }}
        animate={{
          y: isNavVisible ? 0 : -100,
        }}
        transition={{
          duration: 0.3,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      >
        <div className="relative">
          {/* Background with dynamic opacity */}
          <motion.div
            className="absolute inset-0 bg-neutral-50/80 dark:bg-neutral-900/80 border-b border-neutral-200/50 dark:border-neutral-800/50"
            style={{
              opacity: backgroundOpacity,
            }}
          />

          {/* Content - mobile optimized */}
          <div className="relative p-4 md:p-6 flex justify-between items-center">
            <MinimalLink
              href="/"
              className="text-sm hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
            >
              <div>
                <div>atanas kyurkchiev</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 font-normal">web developer</div>
              </div>
            </MinimalLink>
          </div>
        </div>
      </motion.nav>

      <section className="relative min-h-screen flex items-center justify-center px-4 md:px-6 lg:px-12 pt-20 md:pt-0">
        <div className="max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
            className="mb-6 md:mb-8"
          >
            <RevealText>
              <h1 className="text-xl md:text-2xl lg:text-3xl mb-4 md:mb-6 font-light">
                you&apos;re currently offline
              </h1>
            </RevealText>
            <RevealText>
              <p className="text-sm md:text-base lg:text-lg text-neutral-600 dark:text-neutral-400 mb-6 md:mb-8 leading-relaxed">
                some content might not be available while you&apos;re offline. please check your internet connection and try again.
              </p>
            </RevealText>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <RevealText>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                <motion.button
                  onClick={() => window.location.reload()}
                  className="w-full sm:w-auto text-sm border border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 px-6 py-3 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  try again
                </motion.button>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <MinimalLink
                    href="/"
                    className="inline-block w-full sm:w-auto text-center text-sm border border-neutral-400 dark:border-neutral-600 bg-transparent text-neutral-900 dark:text-neutral-100 px-6 py-3 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  >
                    go home
                  </MinimalLink>
                </motion.div>
              </div>
            </RevealText>
          </motion.div>

          {/* Optional: Add a subtle animation indicator */}
          <motion.div
            className="mt-12 md:mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="flex justify-center">
              <motion.div
                className="w-2 h-2 bg-neutral-400 dark:bg-neutral-600 rounded-full"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-4">
              connection status
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
} 