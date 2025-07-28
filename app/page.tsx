"use client";
import Image from "next/image";
import Link from "next/link";
import { useMediaQuery } from "./hooks/useMediaQuery";
import { useSound } from "./components/SoundAndRainProvider";
import { AnimatedText } from "./components/AnimatedText";
import { ProjectCard } from "./components/ProjectCard";
import { useState, useEffect, lazy, Suspense } from "react";

// Lazy load non-critical components
const SectionTransition = lazy(() => import("./components/SectionTransition").then(module => ({ default: module.SectionTransition })));
const ScrollProgress = lazy(() => import("./components/ScrollProgress").then(module => ({ default: module.ScrollProgress })));
const Navigation = lazy(() => import("./components/Navigation"));

// Lightweight loading fallback
function ComponentLoader() {
  return <div className="h-1 w-full bg-transparent" />;
}

// Optimized scroll indicator without heavy transforms
const ScrollIndicator = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Add scroll effect using simple class-based animation
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > (isMobile ? 30 : 60);
      document.body.classList.toggle('scrolled', scrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  return (
    <div className="absolute left-0 right-0 bottom-8 md:bottom-12 flex flex-col items-center gap-1 md:gap-2 pointer-events-none animate-fade-in scroll-fade">
      <p className="text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap animate-bounce-subtle">
        scroll down
      </p>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-3 h-3 text-neutral-500 dark:text-neutral-400 animate-bounce-subtle"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
        />
      </svg>
    </div>
  );
};

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

export default function Home() {
  const { playClick } = useSound();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
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

  // Defer authentication check to not block initial render
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const cookies = document.cookie.split(';');
        const authCookie = cookies.find(cookie => cookie.trim().startsWith('invoice-auth='));
        if (authCookie) {
          const authValue = authCookie.split('=')[1];
          const response = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: authValue }),
          });
          const data = await response.json();
          setIsAuthenticated(data.success);
        }
      } catch (error) {
        console.error("Failed to verify authentication:", error);
        setIsAuthenticated(false);
      }
    };

    // Defer auth check by 100ms to not block critical rendering
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, []);

  // Optimize project fetching with immediate fallback
  useEffect(() => {
    // Set fallback projects immediately
    const sortedFallbackProjects = fallbackProjects.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority ? 1 : -1;
      }
      return a.order - b.order;
    });
    setProjects(sortedFallbackProjects);
    setLoading(false);

    // Defer API call to not block initial render
    const fetchProjects = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // Reduced timeout

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
              if (a.priority !== b.priority) {
                return b.priority ? 1 : -1;
              }
              return a.order - b.order;
            });
          
          if (visibleProjects.length > 0) {
            setProjects(visibleProjects);
          }
        }
      } catch (error) {
        console.warn("Failed to fetch projects from API, using fallback:", error);
      }
    };

    // Defer API call by 200ms
    const timer = setTimeout(fetchProjects, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900 relative">
      <Suspense fallback={<ComponentLoader />}>
        <ScrollProgress />
      </Suspense>

      {/* Enhanced Sticky Navigation */}
      <Suspense fallback={<ComponentLoader />}>
        <Navigation variant="sticky" />
      </Suspense>

      {/* hero section - optimized for mobile */}
      <Suspense fallback={<ComponentLoader />}>
        <SectionTransition>
          <section
            id="top"
            className="relative min-h-screen flex items-center px-4 md:px-6 lg:px-12 pt-20 md:pt-24"
          >
            <div className="max-w-6xl mx-auto w-full">
              <div className="grid lg:grid-cols-[2fr,1fr] gap-8 md:gap-12 items-center">
                <div className="max-w-4xl opacity-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <div>
                    <AnimatedText
                      className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-3 md:mb-4 font-light leading-tight"
                      type="words"
                      animationType="slide"
                      direction="up"
                      stagger={0.1}
                    >
                      web development services
                    </AnimatedText>
                    <AnimatedText
                      className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-neutral-600 dark:text-neutral-400 mb-6 md:mb-8 font-light leading-relaxed"
                      type="words"
                      animationType="slide"
                      direction="up"
                      stagger={0.08}
                      delay={0.3}
                    >
                      custom websites, e-commerce stores & web applications
                    </AnimatedText>
                    <AnimatedText
                      className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed max-w-3xl"
                      type="words"
                      animationType="slide"
                      direction="up"
                      stagger={0.05}
                      delay={0.6}
                    >
                      i build modern, high-performance websites and web applications that help businesses grow. from simple business sites to complex e-commerce platforms, i deliver clean, user-focused solutions that drive results.
                    </AnimatedText>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4 lg:gap-6 text-sm mt-8 md:mt-12 opacity-0 animate-fade-in" style={{ animationDelay: '1.2s' }}>
                    <div className="hover:scale-105 transition-transform">
                      <Link
                        href="/pricing"
                        className="inline-block w-full sm:w-auto text-center border border-neutral-900 bg-neutral-900 dark:bg-neutral-100 dark:border-neutral-100 text-neutral-50 dark:text-neutral-900 px-6 py-3 md:px-4 md:py-2 hover:bg-transparent hover:text-neutral-900 dark:hover:bg-transparent dark:hover:text-neutral-100 transition-colors rounded-lg"
                        onClick={playClick}
                      >
                        view pricing
                      </Link>
                    </div>
                    <div className="hover:scale-105 transition-transform">
                      <Link
                        href="/hire"
                        className="inline-block w-full sm:w-auto text-center border border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 px-6 py-3 md:px-4 md:py-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors rounded-lg"
                        onClick={playClick}
                      >
                        start project
                      </Link>
                    </div>
                    <div className="hover:scale-105 transition-transform">
                      <Link
                        href="#work"
                        className="inline-block w-full sm:w-auto text-center border border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 px-6 py-3 md:px-4 md:py-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors rounded-lg"
                        onClick={playClick}
                      >
                        view work
                      </Link>
                    </div>
                    {isAuthenticated && (
                      <div className="hover:scale-105 transition-transform">
                        <Link
                          href="/admin"
                          className="inline-block w-full rounded-md sm:w-auto text-center border border-neutral-400 bg-neutral-200 dark:bg-neutral-700 dark:border-neutral-600 px-6 py-3 md:px-4 md:py-2 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                          onClick={playClick}
                        >
                          admin dashboard
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Photo - hidden on mobile, visible on larger screens */}
                <div className="relative hidden lg:block opacity-0 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                  <div className="relative aspect-[3/4] max-w-sm mx-auto">
                    <Image
                      src="/me.png"
                      alt="atanas kyurkchiev"
                      fill
                      sizes="(max-width: 1024px) 0vw, 25vw"
                      quality={75}
                      className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                      priority
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    />
                    {/* Subtle overlay effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/20 to-transparent opacity-0 animate-fade-in" style={{ animationDelay: '1s' }} />
                  </div>
                </div>
              </div>
            </div>
            <ScrollIndicator />
          </section>
        </SectionTransition>
      </Suspense>

      {/* services section - optimized for mobile */}
      <Suspense fallback={<ComponentLoader />}>
        <SectionTransition delay={0.05}>
          <section id="services" className="min-h-screen flex items-center px-4 md:px-6 lg:px-12 py-16 md:py-24">
            <div className="max-w-6xl mx-auto w-full">
              <div className="mb-12 md:mb-16 opacity-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                {[
                  {
                    title: "personal websites",
                    description: "simple portfolio or personal brand websites to showcase your work and establish your online presence",
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    )
                  },
                  {
                    title: "business websites",
                    description: "professional websites that convert visitors into customers and represent your brand with modern design and essential features",
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m2.25-18v18m13.5-18v18m2.25-18v18M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.75m-.75 3h.75m-.75 3h.75m-3.75-18.75h3.75a1.125 1.125 0 011.125 1.125v3.375M21 10.125h.375c.621 0 1.125.504 1.125 1.125" />
                      </svg>
                    )
                  },
                  {
                    title: "e-commerce platforms",
                    description: "complete online stores with secure payment processing, inventory management, and customer-friendly shopping experiences",
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                      </svg>
                    )
                  },
                  {
                    title: "custom web applications",
                    description: "bespoke web applications with custom functionality, user authentication, and advanced features tailored to your specific needs",
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                      </svg>
                    )
                  },
                  {
                    title: "enterprise solutions",
                    description: "large-scale custom solutions with unlimited features, dedicated support, and advanced security for complex business requirements",
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15l-.75 18H5.25L4.5 3z" />
                      </svg>
                    )
                  },
                  {
                    title: "additional services",
                    description: "ongoing maintenance and support services to keep your website running smoothly and up-to-date",
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
                      </svg>
                    )
                  }
                ].map((service, index) => (
                  <div
                    key={service.title}
                    className="group p-4 md:p-6 border border-neutral-300 dark:border-neutral-700 bg-neutral-100/50 dark:bg-neutral-800/50 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-all duration-300 rounded-lg hover:-translate-y-1 opacity-0 animate-fade-in"
                    style={{ animationDelay: `${0.4 + index * 0.1}s` }}
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
                  </div>
                ))}
              </div>

              <div className="text-center mt-12 md:mt-16 opacity-0 animate-fade-in" style={{ animationDelay: '1.2s' }}>
                <div className="hover:scale-105 transition-transform">
                  <Link
                    href="/hire"
                    className="inline-block border border-neutral-900 dark:border-neutral-100 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-6 md:px-8 py-3 hover:bg-transparent hover:text-neutral-900 dark:hover:bg-transparent dark:hover:text-neutral-100 transition-colors text-sm"
                    onClick={playClick}
                  >
                    start your project
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </SectionTransition>
      </Suspense>

      {/* New mobile-optimized work section */}
      <Suspense fallback={<ComponentLoader />}>
        <SectionTransition delay={0.1}>
          <section id="work" className="py-16 md:py-24 px-4 md:px-6 lg:px-12">
            <div className="max-w-6xl mx-auto">
              <div className="mb-12 md:mb-16 opacity-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>
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
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 border-2 border-neutral-800 dark:border-neutral-200 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {projects.map((project, index) => (
                    <ProjectCard 
                      key={project.id} 
                      title={project.title}
                      description={project.description}
                      image={project.image}
                      mobileImage={project.mobileImage}
                      link={project.link}
                      priority={project.priority}
                      index={index}
                    />
                  ))}
                </div>
              )}

            </div>
          </section>
        </SectionTransition>
      </Suspense>

      {/* call to action section - optimized for mobile */}
      <Suspense fallback={<ComponentLoader />}>
        <SectionTransition delay={0.15}>
          <section className="py-16 md:py-24 px-4 md:px-6 lg:px-12 bg-neutral-100 dark:bg-neutral-800">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-8 md:mb-12 opacity-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>
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
              </div>

              <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center opacity-0 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <div className="hover:scale-105 transition-transform">
                  <Link
                    href="/hire"
                    className="inline-flex items-center rounded-md gap-3 border-2 border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-6 md:px-8 py-3 md:py-4 hover:bg-transparent hover:text-neutral-900 dark:hover:bg-transparent dark:hover:text-neutral-100 transition-colors text-sm md:text-base font-medium"
                    onClick={playClick}
                  >
                    start your project today
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-4 h-4 md:w-5 md:h-5 hover:translate-x-1 transition-transform"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </Link>
                </div>
                
                <div className="hover:scale-105 transition-transform">
                  <a
                    href="mailto:me@atanaskyurkchiev.info"
                    className="inline-flex items-center rounded-md gap-3 border border-neutral-400 dark:border-neutral-600 bg-transparent text-neutral-900 dark:text-neutral-100 px-6 md:px-8 py-3 md:py-4 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-sm md:text-base"
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
                </div>
              </div>

              <div className="mt-8 md:mt-12 text-center opacity-0 animate-fade-in" style={{ animationDelay: '0.9s' }}>
                <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-500">
                  free consultation • no commitment • quick response
                </p>
              </div>
            </div>
          </section>
        </SectionTransition>
      </Suspense>

      {/* contact section - optimized for mobile */}
      <Suspense fallback={<ComponentLoader />}>
        <SectionTransition delay={0.3}>
          <section id="contact" className="py-16 md:py-24 px-4 md:px-6 lg:px-12">
            <div className="max-w-2xl mx-auto">
              <AnimatedText
                className="text-sm mb-8 md:mb-12"
                type="words"
                animationType="slide"
                direction="up"
              >
                get in touch
              </AnimatedText>
              <div className="flex flex-col gap-6 md:gap-8 opacity-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div>
                  <Link
                    href="/hire"
                    className="inline-flex items-center gap-2 text-sm group"
                  >
                  </Link>
                </div>
                <div className="space-y-2 md:space-y-4 text-sm">
                  {[
                    { label: "and reach out directly:", value: null },
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
                    <p key={index} className="opacity-0 animate-fade-in" style={{ animationDelay: `${0.4 + index * 0.1}s` }}>
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
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </SectionTransition>
      </Suspense>
    </main>
  );
}
