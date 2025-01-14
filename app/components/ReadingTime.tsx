import { useEffect, useState } from "react";

interface ReadingTimeProps {
  content: string;
  className?: string;
}

export const ReadingTime = ({ content, className = "" }: ReadingTimeProps) => {
  const [readingTime, setReadingTime] = useState<number>(0);

  useEffect(() => {
    const wordsPerMinute = 200; // Average reading speed
    const words = content.trim().split(/\s+/).length;
    const time = Math.ceil(words / wordsPerMinute);
    setReadingTime(time);
  }, [content]);

  return (
    <div
      className={`text-sm text-neutral-500 dark:text-neutral-400 ${className}`}
    >
      {readingTime} min read
    </div>
  );
};
