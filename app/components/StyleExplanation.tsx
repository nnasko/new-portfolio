import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const StyleExplanation = () => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-flex items-center">
      <div
        className="w-5 h-5 rounded-full border border-neutral-300 dark:border-neutral-700 text-xs flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-none"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        role="button"
        aria-label="Style information"
      >
        i
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 -top-20 w-60 p-3 bg-white dark:bg-neutral-900 text-sm text-neutral-600 dark:text-neutral-400 shadow-lg rounded-lg border border-neutral-200 dark:border-neutral-800 z-[200]"
          >
            <p>
              this portfolio embraces minimalism through consistent lowercase
              styling
            </p>
            <div className="absolute -bottom-2 left-4 w-2.5 h-2.5 rotate-45 bg-white dark:bg-neutral-900 border-r border-b border-neutral-200 dark:border-neutral-800" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
