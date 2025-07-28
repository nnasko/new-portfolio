'use client';

import { motion } from "framer-motion";
import { MinimalLink } from "../components/MinimalLink";
import { RevealText } from "../components/RevealText";
import Navigation from "../components/Navigation";

export default function OfflinePage() {


  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Mobile-optimized navigation */}
      <Navigation variant="sticky" showNavItems={false} />

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