// Animation utilities for advanced web design techniques

import { MotionValue, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// 1. SCROLL TRACKING UTILITIES
export const useScrollTracker = () => {
  const { scrollY, scrollYProgress } = useScroll();
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("down");
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const prevScrollY = useRef(0);

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      const direction = latest > prevScrollY.current ? "down" : "up";
      const velocity = Math.abs(latest - prevScrollY.current);
      
      setScrollDirection(direction);
      setScrollVelocity(velocity);
      prevScrollY.current = latest;
    });

    return () => unsubscribe();
  }, [scrollY]);

  return {
    scrollY,
    scrollYProgress,
    scrollDirection,
    scrollVelocity,
  };
};

// 2. ENHANCED VIEWPORT DETECTION
export const useViewportIntersection = (
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [intersectionRatio, setIntersectionRatio] = useState(0);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        setIntersectionRatio(entry.intersectionRatio);
        setEntry(entry);
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1],
        ...options,
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [options]);

  return { ref, isIntersecting, intersectionRatio, entry };
};

// 3. EASING FUNCTIONS
export const easings = {
  // Cubic easing functions
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t: number) => 
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  
  // Elastic easing
  easeOutElastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : 
      Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  
  // Bounce easing
  easeOutBounce: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
  
  // Expo easing
  easeOutExpo: (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeInOutExpo: (t: number) => 
    t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ?
    Math.pow(2, 20 * t - 10) / 2 :
    (2 - Math.pow(2, -20 * t + 10)) / 2,
};

// 4. BONUS: MAP RANGE UTILITY
export const mapRange = (
  value: number,
  inputMin: number,
  inputMax: number,
  outputMin: number,
  outputMax: number,
  clamp = false
): number => {
  const mapped = ((value - inputMin) / (inputMax - inputMin)) * (outputMax - outputMin) + outputMin;
  
  if (clamp) {
    return Math.min(Math.max(mapped, Math.min(outputMin, outputMax)), Math.max(outputMin, outputMax));
  }
  
  return mapped;
};

// 5. BONUS: LERP (Linear Interpolation)
export const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

// Vector2 lerp for 2D animations
export const lerpVector2 = (
  start: { x: number; y: number },
  end: { x: number; y: number },
  factor: number
) => ({
  x: lerp(start.x, end.x, factor),
  y: lerp(start.y, end.y, factor),
});

// 6. SMOOTH SCROLL UTILITIES
export const useSmoothScroll = () => {
  const scrollY = useMotionValue(0);
  const smoothScrollY = useSpring(scrollY, { 
    stiffness: 100, 
    damping: 30, 
    mass: 1 
  });

  useEffect(() => {
    let animationFrame: number;
    
    const updateScroll = () => {
      scrollY.set(window.scrollY);
      animationFrame = requestAnimationFrame(updateScroll);
    };

    animationFrame = requestAnimationFrame(updateScroll);
    return () => cancelAnimationFrame(animationFrame);
  }, [scrollY]);

  return { scrollY, smoothScrollY };
};

// 7. PARALLAX UTILITIES
export const useParallax = (scrollY: MotionValue<number>, factor = 0.5) => {
  return useTransform(scrollY, (value) => value * factor);
};

// 8. STAGGER ANIMATION UTILITIES
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

export const staggerItem = {
  hidden: { 
    opacity: 0, 
    y: 60,
    scale: 0.9,
  },
  show: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.33, 1, 0.68, 1],
    },
  },
};

// 9. TEXT SPLITTING UTILITIES
export const splitText = (text: string, type: "words" | "chars" | "lines" = "words") => {
  switch (type) {
    case "words":
      return text.split(" ");
    case "chars":
      return text.split("");
    case "lines":
      return text.split("\n");
    default:
      return text.split(" ");
  }
};

// 10. MOUSE TRACKING
export const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", updateMousePosition);
    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, []);

  return mousePosition;
};

// 11. ELEMENT BOUNDS TRACKING
export const useElementBounds = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  const [bounds, setBounds] = useState<DOMRect | null>(null);

  useEffect(() => {
    const updateBounds = () => {
      if (ref.current) {
        setBounds(ref.current.getBoundingClientRect());
      }
    };

    updateBounds();
    window.addEventListener("resize", updateBounds);
    window.addEventListener("scroll", updateBounds);

    return () => {
      window.removeEventListener("resize", updateBounds);
      window.removeEventListener("scroll", updateBounds);
    };
  }, []);

  return { ref, bounds };
};

// 12. SCROLL SNAP UTILITIES
export const useScrollSnap = (snapPoints: number[], threshold = 50) => {
  const [currentSnap, setCurrentSnap] = useState(0);
  const { scrollY } = useScrollTracker();

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      const closest = snapPoints.reduce((prev, curr, index) => {
        return Math.abs(curr - latest) < Math.abs(snapPoints[prev] - latest) ? index : prev;
      }, 0);

      if (Math.abs(snapPoints[closest] - latest) < threshold) {
        setCurrentSnap(closest);
      }
    });

    return () => unsubscribe();
  }, [scrollY, snapPoints, threshold]);

  return { currentSnap, snapPoints };
}; 