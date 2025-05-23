"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      style={{
        scaleX,
        transformOrigin: "left",
      }}
      className="fixed top-0 left-0 right-0 h-[1px] bg-neutral-800 dark:bg-neutral-200 z-50"
    />
  );
};
