"use client";

import { motion, MotionValue, useTransform, useAnimate } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { RevealText } from "./RevealText";
import { useSound } from "./SoundProvider";
import { useToast } from "./Toast";
import { useEffect } from "react";

interface ProjectCardProps {
  title: string;
  description: string;
  image: string;
  link: string;
  priority?: boolean;
  isActive: MotionValue<number>;
  index: number;
}

export const ProjectCard = ({
  title,
  description,
  image,
  link,
  priority = false,
  isActive,
  index,
}: ProjectCardProps) => {
  const { playClick } = useSound();
  const { showToast } = useToast();
  const [scope, animate] = useAnimate();

  // Transform the current project index into a boolean for this card
  const isCurrentlyActive = useTransform(isActive, (value) => {
    const distance = Math.abs(value - index);
    return distance < 0.5;
  });
  
  // Update animation when active state changes
  useEffect(() => {
    return isCurrentlyActive.on("change", (latest) => {
      animate(scope.current, latest ? {
        scale: 1.05,
        y: 0,
        opacity: 1,
        filter: "grayscale(0)",
      } : {
        scale: 0.95,
        y: 0,
        opacity: 0.5,
        filter: "grayscale(1)",
      }, {
        duration: 0.8,
        ease: [0.25, 0.1, 0, 1]
      });
    });
  }, [isCurrentlyActive, animate, scope]);

  const copyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`https://atanaskyurkchiev.info${link}`);
    showToast("Link copied to clipboard");
    playClick();
  };

  return (
    <div className="group relative">
      <Link href={link} className="block">
        <RevealText>
          <motion.div
            ref={scope}
            className="relative h-[50vh] md:h-[70vh] mb-8 overflow-hidden"
            initial={{
              scale: 0.95,
              y: 0,
              opacity: 0.5,
              filter: "grayscale(1)",
            }}
          >
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
          </motion.div>
        </RevealText>
        <RevealText>
          <motion.div 
            className="flex justify-between items-start"
            style={{ opacity: useTransform(isCurrentlyActive, (active) => active ? 1 : 0.5) }}
          >
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
          </motion.div>
        </RevealText>
      </Link>
    </div>
  );
};
