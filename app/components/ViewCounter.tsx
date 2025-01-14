"use client";

import { useEffect, useState, useRef } from "react";

interface ViewCounterProps {
  slug: string;
  className?: string;
}

export const ViewCounter = ({ slug, className = "" }: ViewCounterProps) => {
  const [views, setViews] = useState<number>(0);
  const incrementRef = useRef(false);

  useEffect(() => {
    // Get initial view count
    fetch(`/api/views/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("ViewCounter - Initial views:", data);
        setViews(data.views);
      })
      .catch((error) =>
        console.error("ViewCounter - Error fetching views:", error)
      );

    // Only increment once per session and component instance
    const hasViewed = sessionStorage.getItem(`viewed-${slug}`);
    if (!hasViewed && !incrementRef.current) {
      incrementRef.current = true; // Mark as incremented immediately

      const incrementViews = async () => {
        try {
          const res = await fetch(`/api/views/${slug}`, { method: "POST" });
          const data = await res.json();
          console.log("ViewCounter - Updated views:", data);
          setViews(data.views);
          sessionStorage.setItem(`viewed-${slug}`, "true");
        } catch (error) {
          console.error("ViewCounter - Error incrementing views:", error);
        }
      };
      incrementViews();
    }
  }, [slug]);

  return (
    <span
      className={`text-sm text-neutral-500 dark:text-neutral-400 ${className}`}
    >
      {views.toLocaleString()} views
    </span>
  );
};
