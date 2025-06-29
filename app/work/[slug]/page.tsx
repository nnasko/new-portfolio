"use client";

import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { notFound } from "next/navigation";
import { use, Suspense } from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { MinimalLink } from "../../components/MinimalLink";
import { useSound } from "../../components/SoundProvider";
import { ReadingTime } from "../../components/ReadingTime";
import { ViewCounter } from "../../components/ViewCounter";
import { useState, useEffect, useRef } from "react";
import { siteConfig } from "../../metadata";
import { 
  useScrollTracker, 
  useMousePosition,   
  useViewportIntersection,
  useParallax,
} from "../../../lib/animation-utils";

interface Project {
  id: string;
  title: string;
  description: string;
  overview?: string;
  fullDescription?: string;
  image: string;
  mobileImage?: string;
  images: string[];
  mobileImages: string[];
  technologies: string[];
  link: string;
  year?: string;
  isVisible: boolean;
  priority: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface ProjectSchema {
  "@context": "https://schema.org";
  "@type": "SoftwareApplication";
  name: string;
  description: string;
  applicationCategory: "WebApplication";
  operatingSystem: "Any";
  author: {
    "@type": "Person";
    name: string;
    url: string;
  };
  datePublished?: string;
  offers: {
    "@type": "Offer";
    availability: "https://schema.org/InStock";
    price: string;
    priceCurrency: string;
  };
}

// Enhanced scroll progress indicator
function ScrollProgressBar() {
  const { scrollYProgress } = useScrollTracker();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-neutral-200 dark:bg-neutral-800 z-50 origin-left"
      style={{ scaleX }}
    />
  );
}

// Magnetic effect component
function MagneticElement({ children, strength = 0.3 }: { children: React.ReactNode, strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const mousePosition = useMousePosition();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    if (!ref.current || !isHovered) {
      x.set(0);
      y.set(0);
      return;
    }

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (mousePosition.x - centerX) * strength;
    const deltaY = (mousePosition.y - centerY) * strength;
    
    x.set(deltaX);
    y.set(deltaY);
  }, [mousePosition, isHovered, strength, x, y]);

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
    >
      {children}
    </motion.div>
  );
}

// Clean image carousel with smooth animations
function SimplifiedImageGallery({ images, title }: { images: string[], title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const { ref: galleryRef, isIntersecting } = useViewportIntersection({ threshold: 0.1 });

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection;
      
      // Wrap around for infinite loop
      if (nextIndex >= images.length) {
        nextIndex = 0;
      } else if (nextIndex < 0) {
        nextIndex = images.length - 1;
      }
      
      return nextIndex;
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        paginate(-1);
      } else if (e.key === 'ArrowRight') {
        paginate(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <motion.div 
      ref={galleryRef as React.RefObject<HTMLDivElement>}
      className="w-full mb-24 relative"
      initial={{ opacity: 0, y: 60 }}
      animate={{ 
        opacity: isIntersecting ? 1 : 0,
        y: isIntersecting ? 0 : 60 
      }}
      transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
    >
      {/* Gallery counter */}
      <div className="absolute top-4 right-4 z-20 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-sm px-2 py-1 rounded">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Main gallery container */}
      <div className="relative w-full h-[400px] md:h-[600px] overflow-hidden bg-neutral-100 dark:bg-neutral-800 rounded-lg">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
            className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
          >
            <div className="relative w-full h-full max-w-4xl">
              <Image
                src={images[currentIndex]}
                alt={`${title} - image ${currentIndex + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 1024px"
                quality={90}
                className="object-contain select-none"
                priority
                draggable={false}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/80 dark:bg-black/80 hover:bg-white dark:hover:bg-black rounded-full transition-all duration-200 opacity-0 hover:opacity-100 focus:opacity-100"
          onClick={() => paginate(-1)}
          aria-label="Previous image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/80 dark:bg-black/80 hover:bg-white dark:hover:bg-black rounded-full transition-all duration-200 opacity-0 hover:opacity-100 focus:opacity-100"
          onClick={() => paginate(1)}
          aria-label="Next image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
      
      {/* Navigation dots */}
      <div className="flex justify-center gap-2 mt-8">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
            className={`h-2 transition-all duration-300 ${
              index === currentIndex 
                ? 'w-8 bg-neutral-800 dark:bg-neutral-200' 
                : 'w-2 bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400 dark:hover:bg-neutral-600'
            } rounded-full`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </motion.div>
  );
}

// Simplified tech badge component
function SimpleTechBadge({ tech, index }: { tech: string, index: number }) {
  return (
    <motion.span
      className="inline-block text-xs px-3 py-2 border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        delay: index * 0.05, 
        duration: 0.4,
        ease: [0.33, 1, 0.68, 1]
      }}
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
    >
      {tech}
    </motion.span>
  );
}

const getProjectSchema = (project: Project): ProjectSchema => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: project.title,
  description: project.description,
  applicationCategory: "WebApplication",
  operatingSystem: "Any",
  author: {
    "@type": "Person",
    name: siteConfig.author,
    url: siteConfig.url
  },
  datePublished: project.year?.split(" - ")[0],
  offers: {
    "@type": "Offer",
    availability: "https://schema.org/InStock",
    price: "0",
    priceCurrency: "GBP"
  }
});

function ProjectContent({ slug }: { slug: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const { scrollY, scrollDirection } = useScrollTracker();
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { playClick } = useSound();

  // Parallax effects
  const heroY = useTransform(scrollY, [0, 500], [0, -100]);
  const contentOpacity = useTransform(scrollY, [0, 200], [1, 0.8]);

  // Transform scroll position to header opacity and blur (matching StickyHeader)
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95]);
  const headerScale = useTransform(scrollY, [0, 200], [1, 0.98]);
  const blurValue = useTransform(scrollY, [0, 100], [0, 8]);
  const backgroundOpacity = useTransform(scrollY, [0, 50], [0.8, 1]);

  // Navigation scroll behavior (matching StickyHeader exactly)
  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      const currentScrollY = latest;
      const scrollDifference = Math.abs(currentScrollY - lastScrollY);

      // Show header when scrolling up or at the top
      if (scrollDirection === "up" || currentScrollY < 100) {
        setIsNavVisible(true);
      }
      // Hide header when scrolling down with sufficient velocity
      else if (scrollDirection === "down" && scrollDifference > 10 && currentScrollY > 200) {
        setIsNavVisible(false);
      }

      setLastScrollY(currentScrollY);
    });

    return () => unsubscribe();
  }, [scrollY, scrollDirection, lastScrollY]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch("/api/projects");
        const data = await response.json();
        
        if (data.success) {
          const projects = data.data.filter((p: Project) => p.isVisible);
          const foundProject = projects.find((p: Project) => {
            const projectSlug = p.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            return projectSlug === slug;
          });
          
          if (foundProject) {
            setProject(foundProject);
          }
        }
      } catch (error) {
        console.error("Failed to fetch project:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-2 h-2 bg-neutral-800 dark:bg-neutral-200 rounded-full"
            animate={{ scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="w-2 h-2 bg-neutral-800 dark:bg-neutral-200 rounded-full"
            animate={{ scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="w-2 h-2 bg-neutral-800 dark:bg-neutral-200 rounded-full"
            animate={{ scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
          />
        </motion.div>
      </div>
    );
  }

  if (!project) {
    notFound();
  }

  // Handle both single images and image arrays
  const images = (() => {
    if (isMobile) {
      // Mobile: prefer mobileImages array, fallback to mobileImage, then images array, then main image
      if (project.mobileImages && project.mobileImages.length > 0) {
        return project.mobileImages;
      } else if (project.mobileImage) {
        return [project.mobileImage];
      } else if (project.images && project.images.length > 0) {
        return project.images;
      } else if (project.image) {
        return [project.image];
      }
      return [];
    } else {
      // Desktop: prefer images array, fallback to main image, then mobile variants
      if (project.images && project.images.length > 0) {
        return project.images;
      } else if (project.image) {
        return [project.image];
      } else if (project.mobileImages && project.mobileImages.length > 0) {
        return project.mobileImages;
      } else if (project.mobileImage) {
        return [project.mobileImage];
      }
      return [];
    }
  })();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getProjectSchema(project))
        }}
      />
      <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        <ScrollProgressBar />
        
        {/* Enhanced navigation */}
        <motion.nav 
          className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
          style={{
            opacity: headerOpacity,
            backdropFilter: `blur(${blurValue}px)`,
            scale: headerScale,
          }}
          initial={{ y: 0 }}
          animate={{
            y: isNavVisible ? 0 : -100,
          }}
          transition={{
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          <div className="relative">
            {/* Background with dynamic opacity */}
            <motion.div
              className="absolute inset-0 bg-neutral-50/80 dark:bg-neutral-900/80 border-b border-neutral-200/50 dark:border-neutral-800/50"
              style={{
                opacity: backgroundOpacity,
              }}
            />

            {/* Content */}
            <div className="relative p-6 flex justify-between items-center">
              <MagneticElement>
                <MinimalLink href="/" className="text-sm hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors">
                  <div>
                    <div>atanas kyurkchiev</div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 font-normal">web developer</div>
                  </div>
                </MinimalLink>
              </MagneticElement>
              
              <MagneticElement>
                <MinimalLink
                  href="/#work"
                  className="text-sm hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
                >
                  back to work
                </MinimalLink>
              </MagneticElement>
            </div>
          </div>
        </motion.nav>

        <div className="pt-24 px-6 md:px-12 max-w-6xl mx-auto">
          {/* Project header */}
          <motion.div 
            className="max-w-4xl mb-16 relative"
            style={{ y: heroY }}
          >
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
              className="mb-8"
            >
              <h1 className="text-4xl md:text-6xl mb-6 leading-tight font-normal">
                {project.title}
              </h1>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.33, 1, 0.68, 1] }}
              className="mb-8"
            >
              <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-4xl">
                {project.description}
              </p>
            </motion.div>
            
            {project.overview && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-8"
              >
                <p className="text-lg text-neutral-500 dark:text-neutral-500 italic leading-relaxed">
                  {project.overview}
                </p>
              </motion.div>
            )}
            
            {/* Meta information */}
            <motion.div 
              className="flex flex-wrap gap-6 items-center text-sm text-neutral-600 dark:text-neutral-400"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {project.year && (
                <div className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-neutral-400 rounded-full"></span>
                  <span>{project.year}</span>
                </div>
              )}
              {project.fullDescription && (
                <div className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-neutral-400 rounded-full"></span>
                  <ReadingTime content={project.fullDescription} />
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 bg-neutral-400 rounded-full"></span>
                <ViewCounter slug={slug} />
              </div>
              <MagneticElement strength={0.2}>
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-neutral-100 transition-all duration-300 group"
                  onClick={playClick}
                >
                  <span>view live site</span>
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                    whileHover={{ x: 3, y: -3 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                    />
                  </motion.svg>
                </a>
              </MagneticElement>
            </motion.div>
          </motion.div>

          {/* Image gallery */}
          {images.length > 0 && (
            <SimplifiedImageGallery images={images} title={project.title} />
          )}

          {/* Content grid */}
          <motion.div 
            className="grid md:grid-cols-[2fr,1fr] gap-16 max-w-6xl mb-32"
            style={{ opacity: contentOpacity }}
          >
            {/* Main content */}
            <div className="space-y-8 overflow-hidden">
              {project.fullDescription ? (
                project.fullDescription.split("\n\n").map((paragraph: string, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ 
                      duration: 0.6, 
                      delay: index * 0.1,
                      ease: [0.33, 1, 0.68, 1]
                    }}
                  >
                    <p className="leading-relaxed text-base break-words">{paragraph}</p>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <p className="leading-relaxed text-neutral-500 dark:text-neutral-400 text-base">
                    Detailed project information will be available soon.
                  </p>
                </motion.div>
              )}
            </div>

            {/* Tech stack sidebar */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
            >
              <div className="sticky top-32">
                <h3 className="text-sm font-medium mb-6 tracking-wider">
                  technologies used
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(project.technologies || []).map((tech: string, index: number) => (
                    <SimpleTechBadge key={tech} tech={tech} index={index} />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Call to action section */}
          <motion.div 
            className="relative w-full border-t border-neutral-200 dark:border-neutral-800 mt-24 pt-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <div className="max-w-4xl mx-auto py-32">
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
              >
                <h2 className="text-3xl md:text-4xl mb-6 leading-tight">
                  ready to build your next digital experience?
                </h2>
                
                <p className="text-base text-neutral-600 dark:text-neutral-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                  let&apos;s collaborate on creating something exceptional that drives results and exceeds expectations.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <MagneticElement strength={0.4}>
                    <MinimalLink
                      href="/hire"
                      className="inline-flex items-center gap-3 text-sm border-2 border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-8 py-4 hover:bg-transparent hover:text-neutral-900 dark:hover:bg-transparent dark:hover:text-neutral-100 transition-all duration-300"
                    >
                      <span>start a project</span>
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
                    </MinimalLink>
                  </MagneticElement>
                  
                  <MagneticElement strength={0.3}>
                    <MinimalLink
                      href="/#work"
                      className="text-sm border border-neutral-300 dark:border-neutral-700 bg-transparent px-8 py-4 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-300"
                    >
                      view more work
                    </MinimalLink>
                  </MagneticElement>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
}

export default function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-2 h-2 bg-neutral-800 dark:bg-neutral-200 rounded-full"
            animate={{ scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="w-2 h-2 bg-neutral-800 dark:bg-neutral-200 rounded-full"
            animate={{ scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="w-2 h-2 bg-neutral-800 dark:bg-neutral-200 rounded-full"
            animate={{ scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
          />
        </motion.div>
      </div>
    }>
      <ProjectContent slug={slug} />
    </Suspense>
  );
}
