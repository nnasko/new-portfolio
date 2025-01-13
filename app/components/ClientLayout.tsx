"use client";

import { ThemeProvider } from "../context/ThemeContext";
import { ThemeToggle } from "./ThemeToggle";
import { MouseEffect } from "./MouseEffect";
import { ScrollProgress } from "./ScrollProgress";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <ThemeProvider>
      <MouseEffect />
      <ThemeToggle />
      <ScrollProgress />
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </ThemeProvider>
  );
};
