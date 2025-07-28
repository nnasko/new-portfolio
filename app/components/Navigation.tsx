'use client';

import { motion, useTransform, AnimatePresence } from "framer-motion";
import { useScrollTracker } from "../../lib/animation-utils";
import { MinimalLink } from "./MinimalLink";
import Image from "next/image";
import { useEffect, useState } from "react";

interface NavigationProps {
  variant?: 'simple' | 'sticky' | 'minimal';
  showLogo?: boolean;
  showNavItems?: boolean;
  customNavItems?: Array<{ href: string; label: string }>;
  rightContent?: React.ReactNode;
  className?: string;
  hideOnScroll?: boolean;
}

export const Navigation = ({ 
  variant = 'sticky',
  showLogo = true,
  showNavItems = true,
  customNavItems,
  rightContent,
  className = "",
  hideOnScroll = true
}: NavigationProps) => {
  const { scrollY, scrollDirection } = useScrollTracker();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Pre-define transforms to avoid conditional hooks
  const logoScale = useTransform(scrollY, [0, 100], [1, 0.9]);

  // Default navigation items
  const defaultNavItems = [
    { href: "/", label: "home" },
    { href: "/pricing", label: "pricing" },
    { href: "/hire", label: "get started" },
  ];

  // Home page navigation items
  const homeNavItems = [
    { href: "#services", label: "services" },
    { href: "#work", label: "work" },
    { href: "/pricing", label: "pricing" },
    { href: "/hire", label: "get started" },
  ];

  // Determine which nav items to use
  const navItems = customNavItems || (typeof window !== 'undefined' && window.location.pathname === '/' ? homeNavItems : defaultNavItems);

  // Transform scroll position to header opacity and blur
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95]);
  const headerScale = useTransform(scrollY, [0, 200], [1, 0.98]);
  const blurValue = useTransform(scrollY, [0, 100], [0, 8]);
  const backgroundOpacity = useTransform(scrollY, [0, 50], [0.8, 1]);
  const navItemScale = useTransform(scrollY, [0, 100], [1, 0.95]);

  // Hide/show header based on scroll direction and velocity
  useEffect(() => {
    if (!hideOnScroll) return;

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
  }, [scrollY, scrollDirection, lastScrollY, hideOnScroll]);

  // Close mobile menu when clicking outside or on menu item
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Simple variant - basic navigation without scroll effects
  if (variant === 'simple') {
    return (
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 bg-neutral-50/80 dark:bg-neutral-900/80 border-b border-neutral-200/50 dark:border-neutral-800/50 backdrop-blur-sm ${className}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="px-4 py-3 md:px-6 md:py-4 flex justify-between items-center">
          {/* Logo */}
          {showLogo && (
            <MinimalLink
              href="/"
              className="flex items-center gap-2 md:gap-3 hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors font-medium"
            >
              <Image
                src="/alogo.png"
                alt="Atanas Kyurkchiev"
                width={24}
                height={24}
                className="rounded-sm md:w-8 md:h-8"
              />
              <div className="hidden sm:block">
                <div className="text-sm md:text-base">atanas kyurkchiev</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 font-normal">web developer</div>
              </div>
            </MinimalLink>
          )}

          {/* Desktop Navigation */}
          {showNavItems && (
            <div className="hidden md:flex space-x-6 text-sm">
              {navItems.map((item) => (
                <MinimalLink
                  key={item.href}
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
              ))}
            </div>
          )}

          {/* Mobile Hamburger Button */}
          {showNavItems && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 -mr-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
              aria-label="Toggle menu"
            >
              <motion.div
                className="w-5 h-5 flex flex-col justify-center items-center"
                animate={isMobileMenuOpen ? "open" : "closed"}
              >
                <motion.span
                  className="w-5 h-0.5 bg-current block"
                  variants={{
                    closed: { rotate: 0, y: 0 },
                    open: { rotate: 45, y: 2 }
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.span
                  className="w-5 h-0.5 bg-current block mt-1"
                  variants={{
                    closed: { opacity: 1 },
                    open: { opacity: 0 }
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.span
                  className="w-5 h-0.5 bg-current block mt-1"
                  variants={{
                    closed: { rotate: 0, y: 0 },
                    open: { rotate: -45, y: -2 }
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </button>
          )}

          {/* Right content */}
          {rightContent && (
            <div className="flex items-center">
              {rightContent}
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && showNavItems && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden border-t border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-50/95 dark:bg-neutral-900/95 backdrop-blur-sm"
            >
              <div className="px-4 py-4 space-y-3">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <MinimalLink
                      href={item.href}
                      className="block py-2 text-base hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
                      onClick={closeMobileMenu}
                    >
                      {item.label}
                    </MinimalLink>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    );
  }

  // Sticky variant - with scroll effects and animations
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
            opacity: backgroundOpacity,
          }}
        />

        {/* Content */}
        <div className="relative px-4 py-3 md:px-6 md:py-4 flex justify-between items-center">
          {/* Logo with scroll-based animation */}
          {showLogo && (
            <motion.div
              style={{
                scale: logoScale,
              }}
            >
              <MinimalLink
                href="/"
                className="flex items-center gap-2 md:gap-3 hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors font-medium"
              >
                <Image
                  src="/alogo.png"
                  alt="Atanas Kyurkchiev"
                  width={24}
                  height={24}
                  className="rounded-sm md:w-8 md:h-8"
                />
                <div className="hidden sm:block">
                  <div className="text-sm md:text-base">atanas kyurkchiev</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 font-normal">web developer</div>
                </div>
              </MinimalLink>
            </motion.div>
          )}

          {/* Desktop Navigation with staggered animations */}
          {showNavItems && (
            <motion.div
              className="hidden md:flex space-x-6 text-sm"
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
              {navItems.map((item) => (
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
          )}

          {/* Mobile Hamburger Button */}
          {showNavItems && (
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 -mr-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
              aria-label="Toggle menu"
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="w-5 h-5 flex flex-col justify-center items-center"
                animate={isMobileMenuOpen ? "open" : "closed"}
              >
                <motion.span
                  className="w-5 h-0.5 bg-current block"
                  variants={{
                    closed: { rotate: 0, y: 0 },
                    open: { rotate: 45, y: 2 }
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.span
                  className="w-5 h-0.5 bg-current block mt-1"
                  variants={{
                    closed: { opacity: 1 },
                    open: { opacity: 0 }
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.span
                  className="w-5 h-0.5 bg-current block mt-1"
                  variants={{
                    closed: { rotate: 0, y: 0 },
                    open: { rotate: -45, y: -2 }
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </motion.button>
          )}

          {/* Right content */}
          {rightContent && (
            <div className="flex items-center">
              {rightContent}
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && showNavItems && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden border-t border-neutral-200/50 dark:border-neutral-800/50"
            >
              <motion.div
                className="bg-neutral-50/95 dark:bg-neutral-900/95 backdrop-blur-sm"
                style={{
                  backdropFilter: `blur(${blurValue}px)`,
                }}
              >
                <div className="px-4 py-4 space-y-3">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                    >
                      <MinimalLink
                        href={item.href}
                        className="block py-2 text-base hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
                        onClick={closeMobileMenu}
                      >
                        {item.label}
                      </MinimalLink>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}; 