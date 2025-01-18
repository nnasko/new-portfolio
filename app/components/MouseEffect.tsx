"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { useMediaQuery } from "../hooks/useMediaQuery";

export const MouseEffect = () => {
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const scaleMotion = useMotionValue(1);
  const [isHovering, setIsHovering] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    if (isMobile) return;

    const updateMousePosition = (e: MouseEvent) => {
      cursorX.set(e.clientX - 8);
      cursorY.set(e.clientY - 8);
    };

    const isInteractive = (element: Element | null | undefined): boolean => {
      if (!element?.tagName) return false;
      const tagName = element.tagName.toLowerCase();
      return (
        tagName === "a" || tagName === "button" || element.hasAttribute("role")
      );
    };

    const handleMouseEnter = (e: MouseEvent) => {
      if (!e.target) return;
      const target = e.target as Element;
      if (isInteractive(target) || isInteractive(target.parentElement)) {
        setIsHovering(true);
        animate(scaleMotion, 2, {
          duration: 0.2,
          ease: [0.4, 0, 0.2, 1], // Custom easing for a snappy but smooth scale
        });
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      if (!e.target) return;
      const target = e.target as Element;
      if (isInteractive(target) || isInteractive(target.parentElement)) {
        setIsHovering(false);
        animate(scaleMotion, 1, {
          duration: 0.2,
          ease: [0.4, 0, 0.2, 1],
        });
      }
    };

    window.addEventListener("mousemove", updateMousePosition, { passive: true });
    document.addEventListener("mouseenter", handleMouseEnter, true);
    document.addEventListener("mouseleave", handleMouseLeave, true);

    // Set initial position to prevent cursor jump on page load
    cursorX.set(window.innerWidth / 2);
    cursorY.set(window.innerHeight / 2);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      document.removeEventListener("mouseenter", handleMouseEnter, true);
      document.removeEventListener("mouseleave", handleMouseLeave, true);
    };
  }, [isMobile, cursorX, cursorY]);

  if (isMobile) return null;

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[100]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="absolute h-4 w-4 rounded-full bg-neutral-900 dark:bg-neutral-100 mix-blend-difference pointer-events-none"
        style={{
          x: cursorX,
          y: cursorY,
          scale: scaleMotion,
          opacity: isHovering ? 0.5 : 0.35,
        }}
      />
    </motion.div>
  );
};
