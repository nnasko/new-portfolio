"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

interface MinimalLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export const MinimalLink = ({
  href,
  children,
  className = "",
}: MinimalLinkProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={href}
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="absolute -bottom-0.5 left-0 right-0 h-px bg-current origin-left"
      />
    </Link>
  );
};
