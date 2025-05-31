"use client";

import { motion, useTransform } from "framer-motion";
import { useScrollTracker } from "../../lib/animation-utils";
import { ReactNode, useRef, useEffect, useState } from "react";

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
  const [elementTop, setElementTop] = useState(0);
  const [elementHeight, setElementHeight] = useState(0);
  const { scrollY } = useScrollTracker();

  // Calculate element position and dimensions
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateDimensions = () => {
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setElementTop(rect.top + scrollTop);
      setElementHeight(rect.height);
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    window.addEventListener("scroll", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("scroll", updateDimensions);
    };
  }, []);

  // Create parallax transforms
  const parallaxY = useTransform(
    scrollY,
    [elementTop - window.innerHeight, elementTop + elementHeight],
    direction === "up" 
      ? [-100 * speed, 100 * speed]
      : [100 * speed, -100 * speed]
  );

  // Optional opacity transform
  const parallaxOpacity = useTransform(
    scrollY,
    [elementTop - window.innerHeight, elementTop, elementTop + elementHeight],
    [0, 1, 0]
  );

  // Optional scale transform
  const parallaxScale = useTransform(
    scrollY,
    [elementTop - window.innerHeight, elementTop, elementTop + elementHeight],
    [0.8, 1, 0.8]
  );

  // Optional blur transform
  const parallaxBlur = useTransform(
    scrollY,
    [elementTop - window.innerHeight, elementTop, elementTop + elementHeight],
    [10, 0, 10]
  );

  // Optional rotation transform
  const parallaxRotate = useTransform(
    scrollY,
    [elementTop - window.innerHeight, elementTop + elementHeight],
    [-45, 45]
  );

  return (
    <motion.div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={{
        y: parallaxY,
        opacity: opacity ? parallaxOpacity : 1,
        scale: scale ? parallaxScale : 1,
        filter: blur ? `blur(${parallaxBlur}px)` : "none",
        rotate: rotate ? parallaxRotate : 0,
      }}
    >
      {children}
    </motion.div>
  );
};

// Enhanced ProjectCard with parallax effects
interface EnhancedProjectCardProps {
  title: string;
  description: string;
  image: string;
  index: number;
  priority?: boolean;
}

export const EnhancedProjectCard = ({
  title,
  description,
  image,
  index,
  priority = false,
}: EnhancedProjectCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  // Viewport intersection
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Generate project slug from title
  const projectSlug = `/work/${title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;

  return (
    <motion.div
      ref={ref}
      className="group cursor-pointer"
      initial={{ opacity: 0, y: 60 }}
      animate={{
        opacity: isInView ? 1 : 0,
        y: isInView ? 0 : 60,
      }}
      transition={{
        duration: 0.8,
        delay: index * 0.1,
        ease: [0.33, 1, 0.68, 1],
      }}
    >
      <a href={projectSlug} className="block">
        {/* Project Image */}
        <motion.div
          className="relative w-full aspect-[16/10] mb-6 overflow-hidden bg-neutral-100 dark:bg-neutral-800"
          whileHover={{ scale: 0.98 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <motion.img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            loading={priority ? "eager" : "lazy"}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </motion.div>

        {/* Project Info */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: isInView ? 1 : 0,
            y: isInView ? 0 : 20,
          }}
          transition={{
            duration: 0.6,
            delay: index * 0.1 + 0.3,
          }}
        >
          <h3 className="text-lg font-normal text-neutral-900 dark:text-neutral-100 group-hover:text-neutral-600 dark:group-hover:text-neutral-400 transition-colors duration-300">
            {title}
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {description}
          </p>
        </motion.div>
      </a>
    </motion.div>
  );
}; 