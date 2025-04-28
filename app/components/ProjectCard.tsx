"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { RevealText } from "./RevealText";
import { useSound } from "./SoundProvider";
import { useToast } from "./Toast";
import { motion, useInView, useAnimation } from "framer-motion";
import { useRef, useEffect, useState } from "react";

interface ProjectCardProps {
  title: string;
  description: string;
  image: string;
  link: string;
  priority?: boolean;
  index: number;
  onVisibilityChange?: (index: number, isVisible: boolean) => void;
}

export const ProjectCard = ({
  title,
  description,
  image,
  link,
  priority = false,
  index,
  onVisibilityChange,
}: ProjectCardProps) => {
  const router = useRouter();
  const { playClick } = useSound();
  const { showToast } = useToast();
  const ref = useRef(null);
  const mouseDownTime = useRef<number>(0);
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressControls = useAnimation();
  
  const isInView = useInView(ref, { 
    amount: 0.6,
    margin: "-10% 0px -10% 0px"
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      onVisibilityChange?.(index, isInView);
    }, 100);
    return () => clearTimeout(timer);
  }, [isInView, index, onVisibilityChange]);

  const copyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`https://atanaskyurkchiev.info${link}`);
    showToast("Link copied to clipboard");
    playClick();
  };

  // Navigation threshold in milliseconds (500ms = 0.5 seconds)
  const navigationThreshold = 500;

  const handleMouseDown = () => {
    mouseDownTime.current = Date.now();
    setIsHolding(true);
    setHoldProgress(0);
    
    // Start the timer to update hold progress
    let startTime = Date.now();
    holdTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / navigationThreshold, 1);
      setHoldProgress(progress);
      
      if (progress >= 1) {
        clearInterval(holdTimerRef.current as NodeJS.Timeout);
      }
    }, 10);
  };

  const handleMouseUp = () => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
    }
    setIsHolding(false);
    setHoldProgress(0);
  };

  useEffect(() => {
    // Clean up interval on unmount
    return () => {
      if (holdTimerRef.current) {
        clearInterval(holdTimerRef.current);
      }
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    const clickDuration = Date.now() - mouseDownTime.current;
    
    if (clickDuration > navigationThreshold) {
      e.preventDefault();
      playClick();
      router.push(link);
    }
  };

  return (
    <motion.div 
      ref={ref}
      className="group relative select-none"
      layout
      animate={{
        scale: isInView ? 1.03 : 0.97,
        opacity: isInView ? 1 : 0.8
      }}
      transition={{ 
        duration: 0.3,
        layout: { duration: 0.3 }
      }}
    >
      <div 
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick} 
        className="block cursor-pointer relative"
      >
        {/* Hold to navigate indicator */}
        {isHolding && (
          <div className="absolute top-4 right-4 z-10 border border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 px-4 py-2 text-xs flex items-center gap-3">
            <span>hold to view project</span>
            <div className="w-16 h-1 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-neutral-500 dark:bg-neutral-400 rounded-full" 
                style={{ width: `${holdProgress * 100}%` }}
              />
            </div>
          </div>
        )}
        
        <RevealText>
          <div className="relative h-[50vh] md:h-[70vh] mb-8 overflow-hidden">
            <div className="absolute inset-0">
              <Image
                src={image}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, 80vw"
                quality={90}
                className="object-contain pointer-events-none"
                priority={priority}
                draggable={false}
              />
            </div>
          </div>
        </RevealText>
        <RevealText>
          <div className="flex justify-between items-start select-none">
            <div className="w-full">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm select-none">{title}</h3>
                <motion.button
                  onClick={copyLink}
                  className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Copy project link"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                    />
                  </svg>
                </motion.button>
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 select-none">
                {description}
              </p>
            </div>
          </div>
        </RevealText>
      </div>
    </motion.div>
  );
};
