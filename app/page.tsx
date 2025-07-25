"use client";

import { motion, useTransform } from "framer-motion";
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
import { useState, useEffect } from "react";

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
  const opacity = useTransform(scrollY, [0, isMobile ? 30 : 60], [1, 0]);

  return (
    <motion.div
      className="absolute left-0 right-0 bottom-8 md:bottom-12 flex flex-col items-center gap-1 md:gap-2 pointer-events-none"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2 }}
      style={{ opacity }}
    >
      <motion.p
        className="text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap"
        animate={{ y: [0, 3, 0] }}
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
        className="w-3 h-3 text-neutral-500 dark:text-neutral-400"
        animate={{ y: [0, 3, 0] }}
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

// Enhanced Project Card Component
const ProjectCard = ({ project, index }: { project: Project; index: number }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { playClick } = useSound();

  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.1,
        ease: [0.33, 1, 0.68, 1]
      }}
    >
      <Link
        href={`/work/${project.title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")}`}
        className="block group cursor-pointer"
        onClick={playClick}
      >
        <motion.div
          className="relative overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
          whileHover={{ y: isMobile ? 0 : -5 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Project Image */}
          <div className="relative aspect-[16/10] md:aspect-[4/3] overflow-hidden">
            <Image
              src={isMobile ? project.mobileImage || project.image : project.image}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority={project.priority}
            />
            
            {/* Mobile-friendly overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 md:group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Mobile-visible project info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/80 to-transparent md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
              <div className="text-white">
                <p className="text-xs md:text-sm opacity-80 mb-1 lowercase">view project</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm">explore</span>
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
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-medium mb-2 md:mb-3 lowercase group-hover:text-neutral-600 dark:group-hover:text-neutral-400 transition-colors">
              {project.title}
            </h3>
            <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-3">
              {project.description}
            </p>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};

export default function Home() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { playClick } = useSound();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
      description: "helped a startup create a B2B platform that reduced supply costs by 30% while promoting eco-friendly business practices",
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
      description: "built a custom e-commerce store that increased online sales by 150% with modern design and seamless user experience",
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
      description: "developed a professional fitness website that doubled client inquiries and established strong online presence",
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
      // Set fallback projects immediately to ensure something is always displayed (with proper sorting)
      const sortedFallbackProjects = fallbackProjects.sort((a, b) => {
        // Sort by priority first (priority projects come first)
        if (a.priority !== b.priority) {
          return b.priority ? 1 : -1;
        }
        // Then sort by order
        return a.order - b.order;
      });
      setProjects(sortedFallbackProjects);
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
            .sort((a: Project, b: Project) => {
              // Sort by priority first (priority projects come first)
              if (a.priority !== b.priority) {
                return b.priority ? 1 : -1;
              }
              // Then sort by order
              return a.order - b.order;
            });
          
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

      {/* hero section - optimized for mobile */}
      <SectionTransition>
        <section
          id="top"
          className="relative min-h-screen flex items-center px-4 md:px-6 lg:px-12 pt-20 md:pt-24"
        >
          <div className="max-w-6xl mx-auto w-full">
            <div className="grid lg:grid-cols-[2fr,1fr] gap-8 md:gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-4xl"
                variants={staggerContainer}
              >
                <motion.div variants={staggerItem}>
                  <AnimatedText
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-3 md:mb-4 font-light leading-tight"
                    type="words"
                    animationType="slide"
                    direction="up"
                    stagger={0.1}
                  >
                    hi, i&apos;m atanas
                  </AnimatedText>
                  <AnimatedText
                    className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-neutral-600 dark:text-neutral-400 mb-6 md:mb-8 font-light leading-relaxed"
                    type="words"
                    animationType="slide"
                    direction="up"
                    stagger={0.08}
                    delay={0.3}
                  >
                    web developer & digital solutions specialist
                  </AnimatedText>
                  <AnimatedText
                    className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed max-w-3xl"
                    type="words"
                    animationType="slide"
                    direction="up"
                    stagger={0.05}
                    delay={0.6}
                  >
                    i help businesses grow with custom web applications, modern websites, and digital solutions that drive results. from concept to launch, i deliver high-quality, user-focused experiences that make your business stand out.
                  </AnimatedText>
                </motion.div>

                <motion.div
                  className="flex flex-col sm:flex-row gap-3 md:gap-4 lg:gap-6 text-sm mt-8 md:mt-12"
                  variants={staggerItem}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/hire"
                      className="inline-block w-full sm:w-auto text-center border border-neutral-900 bg-neutral-900 dark:bg-neutral-100 dark:border-neutral-100 text-neutral-50 dark:text-neutral-900 px-6 py-3 md:px-4 md:py-2 hover:bg-transparent hover:text-neutral-900 dark:hover:bg-transparent dark:hover:text-neutral-100 transition-colors"
                      onClick={playClick}
                    >
                      start a project
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="#work"
                      className="inline-block w-full sm:w-auto text-center border border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 px-6 py-3 md:px-4 md:py-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                      onClick={playClick}
                    >
                      view my work
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/cv"
                      className="inline-block w-full sm:w-auto text-center border border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 px-6 py-3 md:px-4 md:py-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                      onClick={playClick}
                    >
                      view cv
                    </Link>
                  </motion.div>
                  {isAuthenticated && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        href="/admin"
                        className="inline-block w-full sm:w-auto text-center border border-neutral-400 bg-neutral-200 dark:bg-neutral-700 dark:border-neutral-600 px-6 py-3 md:px-4 md:py-2 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                        onClick={playClick}
                      >
                        manage projects
                      </Link>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>

              {/* Photo - hidden on mobile, visible on larger screens */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 60 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 1.2, delay: 0.4, ease: [0.33, 1, 0.68, 1] }}
                className="relative hidden lg:block"
              >
                <div className="relative aspect-[3/4] max-w-sm mx-auto">
                  <Image
                    src="/me.png"
                    alt="atanas kyurkchiev"
                    fill
                    sizes="(max-width: 1024px) 0vw, 25vw"
                    quality={90}
                    className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                    priority
                  />
                  {/* Subtle overlay effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-neutral-900/20 to-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                  />
                </div>
              </motion.div>
            </div>
          </div>
          <ScrollIndicator />
        </section>
      </SectionTransition>

      {/* services section - optimized for mobile */}
      <SectionTransition delay={0.05}>
        <section id="services" className="min-h-screen flex items-center px-4 md:px-6 lg:px-12 py-16 md:py-24">
          <div className="max-w-6xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mb-12 md:mb-16"
            >
              <AnimatedText
                className="text-2xl md:text-3xl lg:text-4xl mb-4 md:mb-6 font-light"
                type="words"
                animationType="slide"
                direction="up"
                stagger={0.1}
              >
                services i offer
              </AnimatedText>
              <AnimatedText
                className="text-base md:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl"
                type="words"
                animationType="fade"
                delay={0.3}
                stagger={0.02}
              >
                comprehensive web development solutions tailored to help your business succeed in the digital landscape
              </AnimatedText>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {[
                {
                  title: "custom web applications",
                  description: "full-stack applications built with modern technologies like Next.js, React, and TypeScript for scalable business solutions",
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                    </svg>
                  )
                },
                {
                  title: "business websites",
                  description: "responsive, fast-loading websites that convert visitors into customers and represent your brand professionally",
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
                    </svg>
                  )
                },
                {
                  title: "e-commerce solutions",
                  description: "online stores with secure payment processing, inventory management, and customer-friendly shopping experiences",
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                    </svg>
                  )
                },
                {
                  title: "api development",
                  description: "robust backend APIs and database solutions to power your applications and integrate with third-party services",
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3v5.25a3 3 0 0 1-3 3M5.25 14.25 12 7.5l6.75 6.75" />
                    </svg>
                  )
                },
                {
                  title: "website optimization",
                  description: "performance improvements, SEO optimization, and user experience enhancements for existing websites",
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5 10.5 6.75L4.5 0.75h15L13.5 6.75l6.75 6.75H3.75Z" />
                    </svg>
                  )
                },
                {
                  title: "maintenance & support",
                  description: "ongoing technical support, security updates, and feature enhancements to keep your site running smoothly",
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
                    </svg>
                  )
                }
              ].map((service, index) => (
                <motion.div
                  key={service.title}
                  className="group p-4 md:p-6 border border-neutral-300 dark:border-neutral-700 bg-neutral-100/50 dark:bg-neutral-800/50 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-all duration-300"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: isMobile ? 0 : -5 }}
                >
                  <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                    <div className="text-neutral-800 dark:text-neutral-200 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors">
                      {service.icon}
                    </div>
                    <h3 className="text-base md:text-lg font-medium">{service.title}</h3>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors">
                    {service.description}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="text-center mt-12 md:mt-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/hire"
                  className="inline-block border border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-6 md:px-8 py-3 hover:bg-transparent hover:text-neutral-900 dark:hover:bg-transparent dark:hover:text-neutral-100 transition-colors text-sm"
                  onClick={playClick}
                >
                  discuss your project
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </SectionTransition>

      {/* New mobile-optimized work section */}
      <SectionTransition delay={0.1}>
        <section id="work" className="py-16 md:py-24 px-4 md:px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mb-12 md:mb-16"
            >
              <AnimatedText
                className="text-2xl md:text-3xl lg:text-4xl mb-4 md:mb-6 font-light"
                type="words"
                animationType="slide"
                direction="up"
                stagger={0.1}
              >
                client success stories
              </AnimatedText>
              <AnimatedText
                className="text-base md:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl"
                type="words"
                animationType="fade"
                delay={0.3}
                stagger={0.02}
              >
                real projects, real results. see how i&apos;ve helped businesses grow through innovative web solutions.
              </AnimatedText>
            </motion.div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <motion.div
                  className="w-8 h-8 border-2 border-neutral-800 dark:border-neutral-200 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {projects.map((project, index) => (
                  <ProjectCard key={project.id} project={project} index={index} />
                ))}
              </div>
            )}

            {/* View all work link */}
            <motion.div
              className="text-center mt-12 md:mt-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Link
                href="#work"
                className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors group"
                onClick={playClick}
              >
                <span>view all projects</span>
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
          </div>
        </section>
      </SectionTransition>

      {/* call to action section - optimized for mobile */}
      <SectionTransition delay={0.15}>
        <section className="py-16 md:py-24 px-4 md:px-6 lg:px-12 bg-neutral-100 dark:bg-neutral-800">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mb-8 md:mb-12"
            >
              <AnimatedText
                className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl mb-4 md:mb-6 font-light leading-tight"
                type="words"
                animationType="slide"
                direction="up"
                stagger={0.1}
              >
                ready to grow your business online?
              </AnimatedText>
              <AnimatedText
                className="text-base md:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto"
                type="words"
                animationType="fade"
                delay={0.3}
                stagger={0.02}
              >
                let&apos;s discuss your project and create a digital solution that drives real results for your business
              </AnimatedText>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/hire"
                  className="inline-flex items-center gap-3 border-2 border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-6 md:px-8 py-3 md:py-4 hover:bg-transparent hover:text-neutral-900 dark:hover:bg-transparent dark:hover:text-neutral-100 transition-colors text-sm md:text-base font-medium"
                  onClick={playClick}
                >
                  start your project today
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4 md:w-5 md:h-5"
                    whileHover={{ x: 5, rotate: -15 }}
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
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <a
                  href="mailto:me@atanaskyurkchiev.info"
                  className="inline-flex items-center gap-3 border border-neutral-400 dark:border-neutral-600 bg-transparent text-neutral-900 dark:text-neutral-100 px-6 md:px-8 py-3 md:py-4 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-sm md:text-base"
                  onClick={playClick}
                >
                  send a quick email
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4 md:w-5 md:h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 21.75 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                    />
                  </svg>
                </a>
              </motion.div>
            </motion.div>

            <motion.div
              className="mt-8 md:mt-12 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-500">
                free consultation • no commitment • quick response
              </p>
            </motion.div>
          </div>
        </section>
      </SectionTransition>

      {/* about section with parallax - optimized for mobile */}
      <SectionTransition delay={0.2}>
        <ParallaxSection speed={0.3} opacity={true}>
          <motion.section id="about" className="py-16 md:py-24 px-4 md:px-6 lg:px-12">
            <div className="max-w-4xl mx-auto grid md:grid-cols-[1fr,1.5fr] gap-8 md:gap-12 items-start">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative aspect-[4/5] max-w-sm mx-auto md:max-w-none"
              >
                <Image
                  src="/me.png"
                  alt="atanas kyurkchiev"
                  fill
                  sizes="(max-width: 768px) 80vw, 40vw"
                  quality={90}
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  priority
                />
              </motion.div>
              <div>
                <AnimatedText
                  className="text-sm mb-8 md:mb-12"
                  type="words"
                  animationType="slide"
                  direction="up"
                >
                  about
                </AnimatedText>
                <div className="space-y-4 md:space-y-6 text-sm">
                  <AnimatedText
                    type="words"
                    animationType="fade"
                    stagger={0.02}
                    delay={0.3}
                  >
                    i&apos;m an 18-year-old web developer from the UK with a passion for creating digital solutions that help businesses thrive. currently pursuing university studies while actively building projects for clients and continuously expanding my technical expertise.
                  </AnimatedText>
                  <AnimatedText
                    type="words"
                    animationType="slide"
                    direction="left"
                    delay={0.6}
                  >
                    background & achievements:
                  </AnimatedText>
                  <motion.ul
                    className="space-y-3 md:space-y-4 text-neutral-600 dark:text-neutral-400"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                  >
                    {[
                      "• 1 year of professional development experience, including team collaboration",
                      "• completed college studies in software development",
                      "• currently pursuing university studies while freelancing",
                      "• successfully delivered 4 client projects with measurable business results",
                      "• specialized in Next.js, React, TypeScript, and modern web technologies",
                    ].map((item, index) => (
                      <motion.li key={index} variants={staggerItem}>
                        {item}
                      </motion.li>
                    ))}
                  </motion.ul>
                  <AnimatedText type="words" animationType="blur" delay={1.2}>
                    despite my age, i bring fresh perspectives, cutting-edge technical skills, and a genuine commitment to helping businesses achieve their digital goals through innovative solutions.
                  </AnimatedText>
                </div>
              </div>
            </div>
          </motion.section>
        </ParallaxSection>
      </SectionTransition>

      {/* contact section - optimized for mobile */}
      <SectionTransition delay={0.3}>
        <motion.section id="contact" className="py-16 md:py-24 px-4 md:px-6 lg:px-12">
          <div className="max-w-2xl mx-auto">
            <AnimatedText
              className="text-sm mb-8 md:mb-12"
              type="words"
              animationType="slide"
              direction="up"
            >
              get in touch
            </AnimatedText>
            <AnimatedText
              className="text-xl md:text-2xl mb-6 md:mb-8"
              type="words"
              animationType="scale"
              stagger={0.1}
            >
              ready to transform your business with a powerful web presence?
            </AnimatedText>
            <motion.div
              className="flex flex-col gap-6 md:gap-8"
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
              <div className="space-y-3 md:space-y-4 text-sm">
                {[
                  { label: "or reach out directly:", value: null },
                  {
                    label: "email:",
                    value: "me@atanaskyurkchiev.info",
                    href: "mailto:me@atanaskyurkchiev.info",
                  },
                  {
                    label: "github:",
                    value: "github.com/nnasko",
                    href: "https://github.com/nnasko",
                  },
                  {
                    label: "linkedin:",
                    value: "linkedin.com/in/atanas-kyurkchiev",
                    href: "https://www.linkedin.com/in/atanas-kyurkchiev-36a609291/",
                  },
                ].map((item, index) => (
                  <motion.p key={index} variants={staggerItem}>
                    {item.label}{" "}
                    {item.value && item.href ? (
                      <a
                        href={item.href}
                        target={
                          item.href.startsWith("http") ? "_blank" : undefined
                        }
                        rel={
                          item.href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="underline hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors break-all"
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
