"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { useSound } from "./SoundProvider";

interface MinimalLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const MinimalLink = ({
  href,
  children,
  className = "",
  onClick,
}: MinimalLinkProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { playClick } = useSound();

  const handleClick = () => {
    playClick();
    onClick?.();
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <Link
      href={href}
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
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
