"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { RevealText } from "./RevealText";

interface ProjectCardProps {
  title: string;
  description: string;
  image: string;
  link: string;
  priority?: boolean;
}

export const ProjectCard = ({ title, description, image, link, priority = false }: ProjectCardProps) => {
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

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      whileHover="hover"
      className="group relative"
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
          <h3 className="text-sm mb-2">{title}</h3>
        </RevealText>
        <RevealText>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {description}
          </p>
        </RevealText>
      </Link>
    </motion.div>
  );
}; 