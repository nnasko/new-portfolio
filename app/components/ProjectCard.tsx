"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
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

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const copyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`https://atanaskyurkchiev.info${link}`);
    showToast("Link copied to clipboard");
    playClick();
  };

  return (
    <div className="group relative">
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover="hover"
        className="relative"
      >
        <Link href={link} className="block">
          <RevealText>
            <motion.div
              className="relative h-[70vh] mb-4 transform-gpu"
              style={{
                transformStyle: "preserve-3d",
              }}
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
      </motion.div>
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
