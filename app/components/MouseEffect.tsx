import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useMediaQuery } from "../hooks/useMediaQuery";

export const MouseEffect = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    if (isMobile) return;

    const updateMousePosition = (e: MouseEvent) => {
      setMousePos({ x: e.clientX - 8, y: e.clientY - 8 });
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
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      if (!e.target) return;
      const target = e.target as Element;
      if (isInteractive(target) || isInteractive(target.parentElement)) {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", updateMousePosition);
    document.addEventListener("mouseenter", handleMouseEnter, true);
    document.addEventListener("mouseleave", handleMouseLeave, true);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      document.removeEventListener("mouseenter", handleMouseEnter, true);
      document.removeEventListener("mouseleave", handleMouseLeave, true);
    };
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[100]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="absolute h-4 w-4 rounded-full bg-neutral-900 dark:bg-neutral-100 mix-blend-difference"
        animate={{
          x: mousePos.x,
          y: mousePos.y,
          scale: isHovering ? 2 : 1,
        }}
        transition={{
          duration: 0,
          scale: { duration: 0.15 },
        }}
        style={{
          opacity: isHovering ? 0.5 : 0.35,
        }}
      />
    </motion.div>
  );
};
