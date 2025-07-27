"use client";

import Image from "next/image";
import Link from "next/link";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useSound } from "./SoundProvider";
import { motion } from "framer-motion";

interface ProjectCardProps {
  title: string;
  description: string;
  image: string;
  mobileImage?: string;
  link: string;
  priority?: boolean;
  index: number;
}

export const ProjectCard = ({
  title,
  description,
  image,
  mobileImage,
  priority = false,
  index,
}: ProjectCardProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { playClick } = useSound();

  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.8,
        delay: index * 0.1,
        ease: [0.33, 1, 0.68, 1],
      }}
    >
      <Link
        href={`/work/${title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")}`}
        className="block group cursor-pointer"
        onClick={playClick}
      >
        <motion.div
          className="relative overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg"
          whileHover={{ y: isMobile ? 0 : -5 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Project Image */}
          <div className="relative aspect-[16/10] md:aspect-[4/3] overflow-hidden">
            <Image
              src={
                isMobile ? mobileImage || image : image
              }
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority={priority}
              loading={priority ? "eager" : "lazy"}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />

            {/* Mobile-friendly overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 md:group-hover:opacity-100 transition-opacity duration-300" />

            {/* Mobile-visible project info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/80 to-transparent md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
              <div className="text-white">
                <div className="flex items-center gap-2">
                  <p className="text-xs md:text-sm opacity-80 mb-1 lowercase">
                    view project
                  </p>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-medium mb-2 md:mb-3 lowercase group-hover:text-neutral-600 dark:group-hover:text-neutral-400 transition-colors">
              {title}
            </h3>
            <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-3">
              {description}
            </p>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};
