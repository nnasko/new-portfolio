"use client";

import { motion, useTransform, useScroll } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useMediaQuery } from "./hooks/useMediaQuery";
import { useSound } from "./components/SoundProvider";
import { SectionTransition } from "./components/SectionTransition";
import { ScrollProgress } from "./components/ScrollProgress";
import { StickyHeader } from "./components/StickyHeader";
import { AnimatedText } from "./components/AnimatedText";
import { ParallaxSection } from "./components/ParallaxSection";
import { useScrollTracker, staggerContainer, staggerItem } from "../lib/animation-utils";
import { useRef, useState, useEffect } from "react";

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  mobileImage?: string;
  link: string;
  isVisible: boolean;
  priority: boolean;
  order: number;
}

const ScrollIndicator = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { scrollY } = useScrollTracker();
  const opacity = useTransform(scrollY, [0, isMobile ? 50 : 100], [1, 0]);

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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Horizontal scroll setup for work section
  const { scrollYProgress } = useScroll({
    target: workRef,
    offset: ["start start", "end end"],
  });

  const xTransform = useTransform(scrollYProgress, [0, 1], ["5%", "-85%"]);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const cookies = document.cookie.split(';');
      const authCookie = cookies.find(cookie => cookie.trim().startsWith('invoice-auth='));
      if (authCookie) {
        const authValue = authCookie.split('=')[1];
        // Check if the auth value matches the expected password via API
        try {
          const response = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: authValue }),
          });
          const data = await response.json();
          setIsAuthenticated(data.success);
        } catch (error) {
          console.error("Failed to verify authentication:", error);
          setIsAuthenticated(false);
        }
      }
    };

    checkAuth();
  }, []);

  // Fallback projects data
  const fallbackProjects: Project[] = [
    {
      id: "1",
      title: "surplush",
      description: "a platform for businesses to get essential supplies cheaper & the eco-friendly way",
      image: "/surplush/main.png",
      mobileImage: "/surplush/mobile-main.png",
      link: "/work/surplush",
      isVisible: true,
      priority: true,
      order: 0,
    },
    {
      id: "2",
      title: "kronos clothing",
      description: "my custom-built store for my clothing brand",
      image: "/kronos/main.png",
      mobileImage: "/kronos/mobile-main.png",
      link: "/work/kronos",
      isVisible: true,
      priority: false,
      order: 1,
    },
    {
      id: "3",
      title: "jacked fitness",
      description: "a place for people to find out more about jack and his abilities as a personal trainer",
      image: "/jacked/main.png",
      mobileImage: "/jacked/mobile-main.png",
      link: "/work/jacked",
      isVisible: true,
      priority: false,
      order: 2,
    },
  ];

  // Fetch projects from API with robust error handling
  useEffect(() => {
    const fetchProjects = async () => {
      // Set fallback projects immediately to ensure something is always displayed
      setProjects(fallbackProjects);
      setLoading(false);

      try {
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch("/api/projects", {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success && data.data && Array.isArray(data.data)) {
          const visibleProjects = data.data
            .filter((project: Project) => project.isVisible)
            .sort((a: Project, b: Project) => a.order - b.order);
          
          // Only update if we actually got projects from the API
          if (visibleProjects.length > 0) {
            setProjects(visibleProjects);
          }
        }
      } catch (error) {
        console.warn("Failed to fetch projects from API, using fallback:", error);
        // Fallback projects are already set above
      }
    };

    fetchProjects();
  }, []);

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900 relative">
      <ScrollProgress />
      
      {/* Enhanced Sticky Navigation */}
      <StickyHeader />

      {/* hero section */}
      <SectionTransition>
        <section
          id="top"
          className="relative min-h-screen flex items-center px-6 md:px-12 pt-24"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
            variants={staggerContainer}
          >
            <motion.div variants={staggerItem}>
              <AnimatedText
                className="text-2xl mb-6"
                type="words"
                animationType="slide"
                direction="up"
                stagger={0.1}
              >
                hi, i&apos;m atanas — a software developer focused on creating full-stack, user-friendly applications
              </AnimatedText>
            </motion.div>
            
            <motion.div
              className="flex gap-6 text-sm"
              variants={staggerItem}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/cv"
                  className="border border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 px-4 py-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  onClick={playClick}
                >
                  view cv
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="#work"
                  className="border border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 px-4 py-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  onClick={playClick}
                >
                  see my work
                </Link>
              </motion.div>
              {isAuthenticated && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/admin/projects"
                    className="border border-neutral-400 bg-neutral-200 dark:bg-neutral-700 dark:border-neutral-600 px-4 py-2 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                    onClick={playClick}
                  >
                    manage projects
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
          <ScrollIndicator />
        </section>
      </SectionTransition>

      {/* work section with horizontal scroll - using the working implementation */}
      <SectionTransition delay={0.1}>
        <motion.section ref={workRef} id="work" className="relative h-[400vh]">
          <div className="sticky top-0 h-screen flex items-center overflow-hidden">
            <AnimatedText
              className="absolute top-12 left-6 md:left-12 text-sm z-20"
              type="words"
              animationType="slide"
              direction="up"
            >
              selected work
            </AnimatedText>
            
            <motion.div
              className="flex gap-12 md:gap-20 px-6 md:px-12"
              style={{ x: xTransform }}
            >
              {loading ? (
                <div className="flex items-center justify-center w-full">
                  <motion.div
                    className="w-8 h-8 border-2 border-neutral-800 dark:border-neutral-200 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              ) : (
                projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    className="relative flex-shrink-0"
                    style={{
                      width: isMobile ? '85vw' : '75vw',
                      height: isMobile ? '70vh' : '80vh'
                    }}
                  >
                    <Link href={`/work/${project.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`} className="relative w-full h-full group cursor-pointer block">
                      <motion.div
                        className="relative w-full h-full overflow-hidden bg-neutral-100 dark:bg-neutral-800"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      >
                        <Image
                          src={isMobile ? (project.mobileImage || project.image) : project.image}
                          alt={project.title}
                          fill
                          sizes={isMobile ? "85vw" : "75vw"}
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          priority={project.priority}
                        />
                        
                        {/* Overlay with project info */}
                        <motion.div 
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 md:p-8"
                        >
                          <h3 className="text-white text-xl md:text-3xl font-light mb-2 md:mb-4">
                            {project.title}
                          </h3>
                          <p className="text-white/80 text-sm md:text-base leading-relaxed mb-4 md:mb-6">
                            {project.description}
                          </p>
                          <div className="flex items-center gap-2 text-white text-sm">
                            <span>view project</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                              />
                            </svg>
                          </div>
                        </motion.div>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>
        </motion.section>
      </SectionTransition>

      {/* about section with parallax */}
      <SectionTransition delay={0.2}>
        <ParallaxSection speed={0.3} opacity={true}>
          <motion.section
            id="about"
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
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  priority
                />
              </motion.div>
              <div>
                <AnimatedText
                  className="text-sm mb-12"
                  type="words"
                  animationType="slide"
                  direction="up"
                >
                  about
                </AnimatedText>
                <div className="space-y-6 text-sm">
                  <AnimatedText
                    type="words"
                    animationType="fade"
                    stagger={0.02}
                    delay={0.3}
                  >
                    i&apos;m a software developer with a focus on creating intuitive and efficient applications. my approach combines technical expertise with a deep understanding of user needs.
                  </AnimatedText>
                  <AnimatedText
                    type="words"
                    animationType="slide"
                    direction="left"
                    delay={0.6}
                  >
                    education/work:
                  </AnimatedText>
                  <motion.ul
                    className="space-y-4 text-neutral-600 dark:text-neutral-400"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                  >
                    {[
                      "• software development @ access creative college, 2023-2025",
                      "• developer lead @ surplush",
                      "• founder @ kronos",
                    ].map((item, index) => (
                      <motion.li key={index} variants={staggerItem}>
                        {item}
                      </motion.li>
                    ))}
                  </motion.ul>
                  <AnimatedText
                    type="words"
                    animationType="blur"
                    delay={1.2}
                  >
                    when i&apos;m not coding, you can find me exploring nature, improving my health at the gym or enjoying the company of friends.
                  </AnimatedText>
                </div>
              </div>
            </div>
          </motion.section>
        </ParallaxSection>
      </SectionTransition>

      {/* contact section */}
      <SectionTransition delay={0.3}>
        <motion.section
          id="contact"
          className="py-24 px-6 md:px-12"
        >
          <div className="max-w-2xl">
            <AnimatedText
              className="text-sm mb-12"
              type="words"
              animationType="slide"
              direction="up"
            >
              contact
            </AnimatedText>
            <AnimatedText
              className="text-2xl mb-8"
              type="words"
              animationType="scale"
              stagger={0.1}
            >
              have a project in mind? let&apos;s create something amazing together
            </AnimatedText>
            <motion.div
              className="flex flex-col gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <motion.div variants={staggerItem}>
                <Link
                  href="/hire"
                  className="inline-flex items-center gap-2 text-sm group"
                >
                  <span className="underline hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors">
                    start a project together
                  </span>
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </motion.svg>
                </Link>
              </motion.div>
              <div className="space-y-4 text-sm">
                {[
                  { label: "or reach out directly:", value: null },
                  { label: "email:", value: "me@atanaskyurkchiev.info", href: "mailto:me@atanaskyurkchiev.info" },
                  { label: "github:", value: "github.com/nnasko", href: "https://github.com/nnasko" },
                  { label: "linkedin:", value: "linkedin.com/in/atanas-kyurkchiev", href: "https://www.linkedin.com/in/atanas-kyurkchiev-36a609291/" },
                ].map((item, index) => (
                  <motion.p key={index} variants={staggerItem}>
                    {item.label}{" "}
                    {item.value && item.href ? (
                      <a
                        href={item.href}
                        target={item.href.startsWith("http") ? "_blank" : undefined}
                        rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="underline hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
                      >
                        {item.value}
                      </a>
                    ) : null}
                  </motion.p>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.section>
      </SectionTransition>

    </main>
  );
}
