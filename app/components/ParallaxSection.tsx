"use client";

import { motion, useTransform } from "framer-motion";
import { useScrollTracker } from "../../lib/animation-utils";
import { ReactNode, useEffect, useRef, useState, useMemo } from "react";

interface ParallaxSectionProps {
  children: ReactNode;
  className?: string;
  speed?: number;
  direction?: "up" | "down";
  opacity?: boolean;
  scale?: boolean;
  blur?: boolean;
  rotate?: boolean;
}

export const ParallaxSection = ({
  children,
  className = "",
  speed = 0.5,
  direction = "up",
  opacity = false,
  scale = false,
  blur = false,
  rotate = false,
}: ParallaxSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScrollTracker();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isInView, setIsInView] = useState(false);

  // Optimize dimension updates with ResizeObserver and throttling
  useEffect(() => {
    if (!ref.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    // Check if element is in viewport for performance
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { 
        rootMargin: "100px", // Start animations before element is fully visible
        threshold: 0.1 
      }
    );

    resizeObserver.observe(ref.current);
    intersectionObserver.observe(ref.current);

    return () => {
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, []);

  // Pre-calculate transforms outside useMemo to avoid hooks in callbacks
  const yTransform = useTransform(
    scrollY,
    [0, dimensions.height || 1],
    [0, (dimensions.height || 1) * (direction === "up" ? -speed : speed)]
  );
  const opacityTransform = useTransform(
    scrollY,
    [0, (dimensions.height || 1) * 0.5],
    [1, 0.3]
  );
  const scaleTransform = useTransform(
    scrollY,
    [0, dimensions.height || 1],
    [1, 0.8]
  );
  const blurTransform = useTransform(
    scrollY,
    [0, dimensions.height || 1],
    [0, 8]
  );
  const rotateTransform = useTransform(
    scrollY,
    [0, dimensions.height || 1],
    [0, 5]
  );

  // Only create transforms when element is in view and has effects enabled
  const transforms = useMemo(() => {
    if (!isInView || dimensions.height === 0) {
      return {
        y: 0,
        opacity: 1,
        scale: 1,
        filter: "none",
        rotate: 0,
      };
    }
    
    return {
      y: yTransform,
      opacity: opacity ? opacityTransform : 1,
      scale: scale ? scaleTransform : 1,
      filter: blur ? `blur(${blurTransform}px)` : "none",
      rotate: rotate ? rotateTransform : 0,
    };
  }, [dimensions.height, isInView, yTransform, opacityTransform, scaleTransform, blurTransform, rotateTransform, opacity, scale, blur, rotate]);

  // Don't render transforms if not in view to save performance
  if (!isInView && dimensions.height > 0) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        ...transforms,
        willChange: isInView ? "transform, opacity" : "auto", // Optimize for GPU
      }}
    >
      {children}
    </motion.div>
  );
}; 