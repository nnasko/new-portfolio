"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { RevealText } from "../components/RevealText";

export default function CV() {
  const [isPdfMode, setIsPdfMode] = useState(false);

  useEffect(() => {
    // Check if we're in PDF generation mode
    const urlParams = new URLSearchParams(window.location.search);
    const isPdf = urlParams.get("pdf") === "true";
    setIsPdfMode(isPdf);

    // Add class to body when in PDF mode
    if (isPdf) {
      document.body.classList.add("pdf-mode");
    }

    return () => {
      document.body.classList.remove("pdf-mode");
    };
  }, []);

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-24">
      {/* navigation - only show if not in PDF mode */}
      {!isPdfMode && (
        <nav className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-sm z-50">
          <Link
            href="/"
            className="text-sm hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
          >
            atanas kyurkchiev
          </Link>
          <a
            href="/cv.pdf"
            download
            className="text-sm border border-neutral-300 dark:border-neutral-700 px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            download cv
          </a>
        </nav>
      )}

      <div
        className={`max-w-4xl mx-auto px-6 md:px-12 py-12 ${
          isPdfMode ? "pt-0" : ""
        }`}
      >
        <div className={isPdfMode ? "" : "space-y-12"}>
          {/* header */}
          <header className="space-y-4">
            <RevealText>
              <h1 className="text-2xl">atanas kyurkchiev</h1>
            </RevealText>
            <RevealText>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                software developer focused on creating intuitive and efficient
                applications
              </p>
            </RevealText>
            <RevealText>
              <div className="flex gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                <a
                  href="mailto:me@atanaskyurkchiev.info"
                  className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                >
                  me@atanaskyurkchiev.info
                </a>
                <span>•</span>
                <a
                  href="https://github.com/nnasko"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                >
                  github.com/nnasko
                </a>
              </div>
            </RevealText>
          </header>

          {/* experience */}
          <section>
            <RevealText>
              <h2 className="text-sm mb-6">experience</h2>
            </RevealText>
            <div className="space-y-8">
              <div>
                <RevealText>
                  <h3 className="text-sm mb-1">developer lead @ surplush</h3>
                </RevealText>
                <RevealText>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                    2024 - present
                  </p>
                </RevealText>
                <RevealText>
                  <ul className="space-y-2 text-sm">
                    <li>
                      • leading development of a sustainable business supplies
                      platform
                    </li>
                    <li>
                      • implementing complex inventory and order management
                      systems
                    </li>
                    <li>
                      • integrating multiple third-party services (stripe,
                      klaviyo, zedify)
                    </li>
                    <li>• optimizing performance and user experience</li>
                  </ul>
                </RevealText>
              </div>

              <div>
                <RevealText>
                  <h3 className="text-sm mb-1">founder @ kronos clothing</h3>
                </RevealText>
                <RevealText>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                    2024 - present
                  </p>
                </RevealText>
                <RevealText>
                  <ul className="space-y-2 text-sm">
                    <li>
                      • developed and launched a custom e-commerce platform
                    </li>
                    <li>
                      • implemented secure payment processing and inventory
                      management
                    </li>
                    <li>• created automated email marketing systems</li>
                    <li>• managed all technical aspects of the business</li>
                  </ul>
                </RevealText>
              </div>
            </div>
          </section>

          {/* education */}
          <section>
            <RevealText>
              <h2 className="text-sm mb-6">education</h2>
            </RevealText>
            <div>
              <RevealText>
                <h3 className="text-sm mb-1">
                  software development @ access creative college
                </h3>
              </RevealText>
              <RevealText>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                  2023 - 2025
                </p>
              </RevealText>
              <RevealText>
                <ul className="space-y-2 text-sm">
                  <li>• full-stack web development</li>
                  <li>• software engineering principles</li>
                  <li>• agile methodologies</li>
                  <li>• database design and management</li>
                </ul>
              </RevealText>
            </div>
          </section>

          {/* skills */}
          <section>
            <RevealText>
              <h2 className="text-sm mb-6">technical skills</h2>
            </RevealText>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
              <div>
                <RevealText>
                  <h3 className="text-neutral-500 dark:text-neutral-400 mb-2">
                    languages
                  </h3>
                </RevealText>
                <RevealText>
                  <ul className="space-y-1">
                    <li>• typescript/javascript</li>
                    <li>• html/css</li>
                    <li>• sql</li>
                    <li>• python</li>
                  </ul>
                </RevealText>
              </div>
              <div>
                <RevealText>
                  <h3 className="text-neutral-500 dark:text-neutral-400 mb-2">
                    frameworks
                  </h3>
                </RevealText>
                <RevealText>
                  <ul className="space-y-1">
                    <li>• next.js</li>
                    <li>• react</li>
                    <li>• tailwind css</li>
                    <li>• prisma</li>
                  </ul>
                </RevealText>
              </div>
              <div>
                <RevealText>
                  <h3 className="text-neutral-500 dark:text-neutral-400 mb-2">
                    tools
                  </h3>
                </RevealText>
                <RevealText>
                  <ul className="space-y-1">
                    <li>• git</li>
                    <li>• vs code</li>
                    <li>• figma</li>
                    <li>• postman</li>
                  </ul>
                </RevealText>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
