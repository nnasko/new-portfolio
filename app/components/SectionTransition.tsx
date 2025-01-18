"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

interface SectionTransitionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const SectionTransition = ({
  children,
  className = "",
  delay = 0,
}: SectionTransitionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-15% 0px",
  });

  return (
    <motion.div
      ref={ref}
      initial={{ 
        opacity: 0, 
        y: 30, 
        scale: 0.97,
        filter: "blur(5px)"
      }}
      animate={{
        opacity: isInView ? 1 : 0,
        y: isInView ? 0 : 30,
        scale: isInView ? 1 : 0.97,
        filter: isInView ? "blur(0px)" : "blur(5px)"
      }}
      transition={{
        duration: 1.2,
        delay: delay,
        ease: [0.25, 0.1, 0, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}; 