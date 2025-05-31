"use client";

import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { splitText, easings } from "../../lib/animation-utils";

interface AnimatedTextProps {
  children: string;
  className?: string;
  type?: "words" | "chars" | "lines";
  stagger?: number;
  duration?: number;
  delay?: number;
  animationType?: "slide" | "fade" | "scale" | "rotate" | "blur";
  direction?: "up" | "down" | "left" | "right";
  easing?: keyof typeof easings;
  once?: boolean;
}

export const AnimatedText = ({
  children,
  className = "",
  type = "words",
  stagger = 0.05,
  duration = 0.6,
  delay = 0,
  animationType = "slide",
  direction = "up",
  once = true,
}: AnimatedTextProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const textArray = splitText(children, type);

  const getInitialState = () => {
    switch (animationType) {
      case "slide":
        switch (direction) {
          case "up": return { y: 100, opacity: 0 };
          case "down": return { y: -100, opacity: 0 };
          case "left": return { x: 100, opacity: 0 };
          case "right": return { x: -100, opacity: 0 };
          default: return { y: 100, opacity: 0 };
        }
      case "fade":
        return { opacity: 0 };
      case "scale":
        return { scale: 0, opacity: 0 };
      case "rotate":
        return { rotate: 180, opacity: 0 };
      case "blur":
        return { filter: "blur(10px)", opacity: 0 };
      default:
        return { y: 100, opacity: 0 };
    }
  };

  const getAnimateState = () => {
    switch (animationType) {
      case "slide":
        return { x: 0, y: 0, opacity: 1 };
      case "fade":
        return { opacity: 1 };
      case "scale":
        return { scale: 1, opacity: 1 };
      case "rotate":
        return { rotate: 0, opacity: 1 };
      case "blur":
        return { filter: "blur(0px)", opacity: 1 };
      default:
        return { x: 0, y: 0, opacity: 1 };
    }
  };

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const item = {
    hidden: getInitialState(),
    visible: {
      ...getAnimateState(),
      transition: {
        duration,
        ease: [0.33, 1, 0.68, 1],
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={container}
      initial="hidden"
      animate={isIntersecting ? "visible" : once ? "hidden" : "visible"}
    >
      {textArray.map((text, index) => (
        <motion.span
          key={index}
          variants={item}
          className={type === "words" ? "inline-block mr-1" : "inline-block"}
        >
          {text}
          {type === "words" && index < textArray.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </motion.div>
  );
}; 