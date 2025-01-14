"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

interface RevealTextProps {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
}

export const RevealText = ({ 
  children, 
  className = "",
  direction = "up" 
}: RevealTextProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const getInitialPosition = () => {
    switch (direction) {
      case "up": return { y: "100%", x: 0 };
      case "down": return { y: "-100%", x: 0 };
      case "left": return { x: "100%", y: 0 };
      case "right": return { x: "-100%", y: 0 };
      default: return { y: "100%", x: 0 };
    }
  };

  const getFinalPosition = () => {
    return { x: 0, y: 0 };
  };

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ ...getInitialPosition(), opacity: 0 }}
        animate={{ 
          ...getFinalPosition(),
          opacity: isInView ? 1 : 0 
        }}
        transition={{ 
          duration: 0.8,
          ease: [0.33, 1, 0.68, 1],
          delay: 0.3
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};
