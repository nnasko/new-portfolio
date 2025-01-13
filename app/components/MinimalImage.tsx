"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";

interface MinimalImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export const MinimalImage = ({
  src,
  alt,
  className = "",
  priority = false,
}: MinimalImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 z-10" />
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="h-full w-full relative"
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 80vw"
          quality={90}
          className="object-contain"
          onLoadingComplete={() => setIsLoaded(true)}
          priority={priority}
        />
      </motion.div>
    </div>
  );
};
