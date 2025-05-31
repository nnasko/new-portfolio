"use client";

import { motion, useTransform } from "framer-motion";
import { useScrollTracker } from "../../lib/animation-utils";
import { MinimalLink } from "./MinimalLink";
import { useEffect, useState } from "react";

interface StickyHeaderProps {
  className?: string;
}

export const StickyHeader = ({ className = "" }: StickyHeaderProps) => {
  const { scrollY, scrollDirection } = useScrollTracker();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Transform scroll position to header opacity and blur
  const headerOpacity = useTransform(
    scrollY,
    [0, 100],
    [1, 0.95]
  );

  const headerScale = useTransform(
    scrollY,
    [0, 200],
    [1, 0.98]
  );

  const blurValue = useTransform(scrollY, [0, 100], [0, 8]);

  // Nav item scale transform - moved outside of map
  const navItemScale = useTransform(scrollY, [0, 100], [1, 0.95]);

  // Hide/show header based on scroll direction and velocity
  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      const currentScrollY = latest;
      const scrollDifference = Math.abs(currentScrollY - lastScrollY);

      // Show header when scrolling up or at the top
      if (scrollDirection === "up" || currentScrollY < 100) {
        setIsVisible(true);
      }
      // Hide header when scrolling down with sufficient velocity
      else if (scrollDirection === "down" && scrollDifference > 10 && currentScrollY > 200) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    });

    return () => unsubscribe();
  }, [scrollY, scrollDirection, lastScrollY]);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${className}`}
      style={{
        opacity: headerOpacity,
        backdropFilter: `blur(${blurValue}px)`,
        scale: headerScale,
      }}
      initial={{ y: 0 }}
      animate={{
        y: isVisible ? 0 : -100,
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
            opacity: useTransform(scrollY, [0, 50], [0.8, 1]),
          }}
        />

        {/* Content */}
        <div className="relative p-6 flex justify-between items-center">
          {/* Logo with scroll-based animation */}
          <motion.div
            style={{
              scale: useTransform(scrollY, [0, 100], [1, 0.9]),
            }}
          >
            <MinimalLink
              href="#top"
              className="text-sm hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors font-medium"
            >
              atanas kyurkchiev
            </MinimalLink>
          </motion.div>

          {/* Navigation with staggered animations */}
          <motion.div
            className="space-x-6 text-sm"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.2,
                },
              },
            }}
            initial="hidden"
            animate="visible"
          >
            {[
              { href: "#work", label: "work" },
              { href: "#about", label: "about" },
              { href: "#contact", label: "contact" },
            ].map((item) => (
              <motion.span
                key={item.href}
                variants={{
                  hidden: { opacity: 0, y: -20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.6,
                      ease: [0.33, 1, 0.68, 1],
                    },
                  },
                }}
                style={{
                  scale: navItemScale,
                }}
              >
                <MinimalLink
                  href={item.href}
                  className="hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors relative group"
                >
                  {item.label}
                  {/* Animated underline */}
                  <motion.div
                    className="absolute -bottom-1 left-0 h-px bg-neutral-800 dark:bg-neutral-200 origin-left"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </MinimalLink>
              </motion.span>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
}; 