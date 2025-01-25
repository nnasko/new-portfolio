"use client";

import { motion, useTransform, useMotionValue } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useMediaQuery } from "./hooks/useMediaQuery";
import { StyleExplanation } from "./components/StyleExplanation";
import { RevealText } from "./components/RevealText";
import { ProjectCard } from "./components/ProjectCard";
import { MinimalLink } from "./components/MinimalLink";
import { useSound } from "./components/SoundProvider";
import { SectionTransition } from "./components/SectionTransition";
import { ScrollProgress } from "./components/ScrollProgress";
import { useRef, useState, useEffect } from "react";

const projects = [
  {
    title: "surplush",
    description:
      "a platform for businesses to get essential supplies cheaper & the eco-friendly way",
    image: "/surplush/main.png",
    mobileImage: "/surplush/mobile-main.png",
    link: "/work/surplush",
  },
  {
    title: "kronos clothing",
    description: "my custom-built store for my clothing brand",
    image: "/kronos/main.png",
    mobileImage: "/kronos/mobile-main.png",
    link: "/work/kronos",
  },
  {
    title: "jacked fitness",
    description:
      "a place for people to find out more about jack and his abilities as a personal trainer",
    image: "/jacked/main.png",
    mobileImage: "/jacked/mobile-main.png",
    link: "/work/jacked",
  },
];

const ScrollIndicator = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const scrollY = useMotionValue(0);
  const opacity = useTransform(scrollY, [0, isMobile ? 50 : 100], [1, 0]);

  useEffect(() => {
    const handleScroll = () => {
      scrollY.set(window.scrollY || 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollY]);

  return (
    <motion.div
      className="absolute left-0 right-0 bottom-12 flex flex-col items-center gap-2 pointer-events-none"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2 }}
      style={{ opacity }}
    >
      <motion.p
        className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400 whitespace-nowrap"
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        scroll down
      </motion.p>
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-3 h-3 md:w-4 md:h-4 text-neutral-500 dark:text-neutral-400"
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
        />
      </motion.svg>
    </motion.div>
  );
};

export default function Home() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { playClick } = useSound();
  const workRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const updateConstraints = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.scrollWidth;
        const windowWidth = window.innerWidth;
        setDragConstraints({
          right: 0,
          left: -(containerWidth - windowWidth + 48)
        });
      }
    };

    updateConstraints();
    window.addEventListener('resize', updateConstraints);
    return () => window.removeEventListener('resize', updateConstraints);
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    if (containerRef.current) {
      // If shift key is pressed or this is a horizontal scroll event
      if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        containerRef.current.scrollLeft += e.deltaX || e.deltaY;
      }
      // For trackpad horizontal scrolling
      else if (e.deltaX !== 0) {
        e.preventDefault();
        containerRef.current.scrollLeft += e.deltaX;
      }
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <ScrollProgress />
      {/* minimal navigation */}
      <nav className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-sm z-50">
        <MinimalLink
          href="#top"
          className="text-sm hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors relative"
        >
          atanas kyurkchiev
        </MinimalLink>
        <div className="space-x-6 text-sm">
          <MinimalLink
            href="#work"
            className="hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
          >
            work
          </MinimalLink>
          <MinimalLink
            href="#about"
            className="hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
          >
            about
          </MinimalLink>
          <MinimalLink
            href="#contact"
            className="hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
          >
            contact
          </MinimalLink>
        </div>
      </nav>

      {/* hero */}
      <SectionTransition>
        <section
          id="top"
          className="relative min-h-screen flex items-center px-6 md:px-12"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <RevealText>
              <h1 className="text-2xl mb-6">
                hi, i&apos;m atanas{" "}
                <span className="relative inline-flex items-center gap-2">
                  — <StyleExplanation />
                </span>{" "}
                a software developer focused on creating full-stack,
                user-friendly applications
              </h1>
            </RevealText>
            <RevealText>
              <div className="flex gap-6 text-sm">
                <Link
                  href="/cv"
                  className="border border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 px-4 py-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  onClick={playClick}
                >
                  view cv
                </Link>
                <Link
                  href="#work"
                  className="border border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 px-4 py-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  onClick={playClick}
                >
                  see my work
                </Link>
              </div>
            </RevealText>
          </motion.div>
          <ScrollIndicator />
        </section>
      </SectionTransition>

      {/* work */}
      <SectionTransition delay={0.1}>
        <motion.section ref={workRef} id="work" className="relative py-24">
          <RevealText>
            <h2 className="mb-12 px-6 md:px-12 text-sm">
              selected work
            </h2>
          </RevealText>
          <motion.div
            ref={containerRef}
            className="overflow-x-auto overflow-y-hidden scrollbar-hide"
            onWheel={handleWheel}
          >
            <motion.div
              className="flex gap-12 px-6 md:px-12"
              drag="x"
              dragConstraints={dragConstraints}
              dragElastic={0.1}
              dragTransition={{ 
                bounceStiffness: 100,
                bounceDamping: 20
              }}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setIsDragging(false)}
              whileTap={{ cursor: isDragging ? "grabbing" : "grab" }}
              style={{ cursor: isDragging ? "grabbing" : "grab" }}
            >
              {projects.map((project, index) => (
                <motion.div
                  key={project.title}
                  className="relative flex-shrink-0 w-[85vw] md:w-[60vw] select-none pb-12"
                >
                  <ProjectCard
                    title={project.title}
                    description={project.description}
                    image={isMobile ? project.mobileImage : project.image}
                    link={project.link}
                    priority={index === 0}
                    index={index}
                  />
                </motion.div>
              ))}
              {/* Spacer div for end padding */}
              <div className="w-[6vw] md:w-[20vw] flex-shrink-0" aria-hidden="true" />
            </motion.div>
          </motion.div>
        </motion.section>
      </SectionTransition>

      {/* about */}
      <SectionTransition delay={0.2}>
        <motion.section
          id="about"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="py-24 px-6 md:px-12"
        >
          <div className="max-w-4xl grid md:grid-cols-[1fr,1.5fr] gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative aspect-[4/5]"
            >
              <Image
                src="/me.jpg"
                alt="atanas kyurkchiev"
                fill
                sizes="(max-width: 768px) 100vw, 80vw"
                quality={90}
                className="object-cover grayscale hover:grayscale-0 transition-all"
                priority
              />
            </motion.div>
            <div>
              <RevealText>
                <h2 className="text-sm mb-12">about</h2>
              </RevealText>
              <div className="space-y-6 text-sm">
                <RevealText>
                  <p>
                    i&apos;m a software developer with a focus on creating
                    intuitive and efficient applications. my approach combines
                    technical expertise with a deep understanding of user needs.
                  </p>
                </RevealText>
                <RevealText>
                  <p>education/work:</p>
                </RevealText>
                <ul className="space-y-4 text-neutral-600 dark:text-neutral-400">
                  <RevealText>
                    <li>
                      • software development @ access creative college,
                      2023-2025
                    </li>
                  </RevealText>
                  <RevealText>
                    <li>• developer lead @ surplush</li>
                  </RevealText>
                  <RevealText>
                    <li>• founder @ kronos</li>
                  </RevealText>
                </ul>
                <RevealText>
                  <p>
                    when i&apos;m not coding, you can find me exploring nature,
                    improving my health at the gym or enjoying the company of
                    friends.
                  </p>
                </RevealText>
              </div>
            </div>
          </div>
        </motion.section>
      </SectionTransition>

      {/* contact */}
      <SectionTransition delay={0.3}>
        <motion.section
          id="contact"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="py-24 px-6 md:px-12"
        >
          <div className="max-w-2xl">
            <RevealText>
              <h2 className="text-sm mb-12">contact</h2>
            </RevealText>
            <RevealText>
              <p className="text-2xl mb-8">
                have a project in mind? let&apos;s create something amazing
                together
              </p>
            </RevealText>
            <RevealText>
              <div className="flex flex-col gap-8">
                <Link
                  href="/hire"
                  className="inline-flex items-center gap-2 text-sm group"
                >
                  <span className="underline hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors">
                    start a project together
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </Link>
                <div className="space-y-4 text-sm">
                  <RevealText>
                    <p>or reach out directly:</p>
                  </RevealText>
                  <RevealText>
                    <p>
                      email:{" "}
                      <a
                        href="mailto:me@atanaskyurkchiev.info"
                        className="underline hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
                      >
                        me@atanaskyurkchiev.info
                      </a>
                    </p>
                  </RevealText>
                  <RevealText>
                    <p>
                      github:{" "}
                      <a
                        href="https://github.com/nnasko"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
                      >
                        github.com/nnasko
                      </a>
                    </p>
                  </RevealText>
                  <RevealText>
                    <p>
                      linkedin:{" "}
                      <a
                        href="https://www.linkedin.com/in/atanas-kyurkchiev-36a609291/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
                      >
                        linkedin.com/in/atanas-kyurkchiev
                      </a>
                    </p>
                  </RevealText>
                </div>
              </div>
            </RevealText>
          </div>
        </motion.section>
      </SectionTransition>
    </main>
  );
}
