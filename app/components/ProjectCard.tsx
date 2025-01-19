"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { RevealText } from "./RevealText";
import { useSound } from "./SoundProvider";
import { useToast } from "./Toast";

interface ProjectCardProps {
  title: string;
  description: string;
  image: string;
  link: string;
  priority?: boolean;
}

export const ProjectCard = ({
  title,
  description,
  image,
  link,
  priority = false,
}: ProjectCardProps) => {
  const { playClick } = useSound();
  const { showToast } = useToast();

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
            className="relative h-[70vh] mb-4 overflow-hidden"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 80vw"
              quality={90}
              className="object-contain grayscale group-hover:grayscale-0 transition-all duration-500"
              priority={priority}
            />
          </motion.div>
        </RevealText>
        <RevealText>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm mb-2">{title}</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {description}
              </p>
            </div>
          </div>
        </RevealText>
      </Link>
      <motion.button
        onClick={copyLink}
        className="absolute top-4 right-4 p-3 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-50/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-full shadow-lg"
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
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
          />
        </svg>
      </motion.button>
    </div>
  );
};
