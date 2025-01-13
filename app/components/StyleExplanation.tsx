import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

export const StyleExplanation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    setButtonRect(e.currentTarget.getBoundingClientRect());
    setIsVisible(true);
  };

  return (
    <div className="relative inline-flex items-center">
      <div
        className="w-5 h-5 rounded-full border border-neutral-300 dark:border-neutral-700 text-xs flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors md:cursor-none"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsVisible(false)}
        role="button"
        aria-label="Style information"
      >
        i
      </div>

      {typeof window !== 'undefined' && isVisible && buttonRect && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed z-[200]"
            style={{
              top: buttonRect.top - 96, // -24rem
              left: buttonRect.left + (buttonRect.width / 2) - 120, // Center the 240px (w-60) wide popover
            }}
          >
            <div className="relative w-60 p-3 bg-white dark:bg-neutral-900 text-sm text-neutral-600 dark:text-neutral-400 shadow-lg rounded-lg border border-neutral-200 dark:border-neutral-800">
              <p>
                this portfolio embraces minimalism through consistent lowercase
                styling
              </p>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 bg-white dark:bg-neutral-900 border-r border-b border-neutral-200 dark:border-neutral-800" />
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
