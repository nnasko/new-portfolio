"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";

export const PageLoadProgress = () => {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[200] h-[1px] bg-neutral-900 dark:bg-neutral-100 origin-left"
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{
        scaleX: isLoading ? 1 : 0,
        opacity: isLoading ? 0.2 : 0,
      }}
      transition={{
        duration: 0.5,
        ease: "easeInOut",
      }}
    />
  );
}; 