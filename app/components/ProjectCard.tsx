"use client";

import Image from "next/image";
import Link from "next/link";
import { RevealText } from "./RevealText";
import { useSound } from "./SoundProvider";
import { useToast } from "./Toast";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect } from "react";

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
  const { playClick } = useSound();
  const { showToast } = useToast();
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    amount: 0.6,
    margin: "-10% 0px -10% 0px" // Add some margin to reduce updates near edges
  });

  // Report visibility changes to parent with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      onVisibilityChange?.(index, isInView);
    }, 100); // Add small delay to reduce update frequency
    return () => clearTimeout(timer);
  }, [isInView, index, onVisibilityChange]);

  const copyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`https://atanaskyurkchiev.info${link}`);
    showToast("Link copied to clipboard");
    playClick();
  };

  return (
    <motion.div 
      ref={ref}
      className="group relative"
      layout // Use layout animations for better performance
      animate={{
        scale: isInView ? 1.03 : 0.97, // Reduce scale difference for smoother animation
        opacity: isInView ? 1 : 0.8
      }}
      transition={{ 
        duration: 0.3, // Reduce duration for snappier response
        layout: { duration: 0.3 } // Add layout transition
      }}
    >
      <Link href={link} className="block">
        <RevealText>
          <div className="relative h-[50vh] md:h-[70vh] mb-8 overflow-hidden">
            <div className="absolute inset-0">
              <Image
                src={image}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, 80vw"
                quality={90}
                className="object-contain"
                priority={priority}
              />
            </div>
          </div>
        </RevealText>
        <RevealText>
          <div className="flex justify-between items-start">
            <div className="w-full">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm">{title}</h3>
                <motion.button
                  onClick={copyLink}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
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
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {description}
              </p>
            </div>
          </div>
        </RevealText>
      </Link>
    </motion.div>
  );
};
