'use client';

import { MinimalLink } from "../components/MinimalLink";
import { RevealText } from "../components/RevealText";

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <nav className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-sm z-50">
        <MinimalLink
          href="/"
          className="text-sm hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
        >
          atanas kyurkchiev
        </MinimalLink>
      </nav>

      <section className="relative min-h-screen flex items-center justify-center px-6 md:px-12">
        <div className="max-w-3xl text-center">
          <RevealText>
            <h1 className="text-2xl sm:text-3xl mb-6">
              you&apos;re currently offline
            </h1>
          </RevealText>
          <RevealText>
            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
              some content might not be available while you&apos;re offline. please check your internet connection and try again.
            </p>
          </RevealText>
          <RevealText>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="text-sm border border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 px-6 py-3 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                try again
              </button>
            </div>
          </RevealText>
        </div>
      </section>
    </main>
  );
} 