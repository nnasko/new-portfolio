"use client";

import Link from "next/link";
import { useSound } from "./SoundAndRainProvider";

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
  const { playClick } = useSound();

  const handleClick = () => {
    playClick();
    onClick?.();
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
};
