import { useState } from "react";

export const StyleExplanation = () => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="w-5 h-5 rounded-full border border-neutral-300 dark:border-neutral-700 text-xs flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        aria-label="Style information"
      >
        i
      </button>

      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-sm text-neutral-600 dark:text-neutral-400 shadow-sm border border-neutral-200 dark:border-neutral-700">
          <p>
            this portfolio embraces minimalism through consistent lowercase
            styling
          </p>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2.5 h-2.5 bg-neutral-100 dark:bg-neutral-800 border-r border-b border-neutral-200 dark:border-neutral-700"></div>
        </div>
      )}
    </div>
  );
};
