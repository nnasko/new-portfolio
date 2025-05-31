"use client";

import { motion, useMotionValue, animate, useSpring, useTransform } from "framer-motion";
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

// Simplified image gallery with better performance
function SimplifiedImageGallery({ images, title }: { images: string[], title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);
  const { ref: galleryRef, isIntersecting } = useViewportIntersection({ threshold: 0.1 });
  
  const animateToIndex = (index: number) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCurrentIndex(index);
    
    animate(dragX, 0, {
      type: "spring",
      stiffness: 300,
      damping: 30,
      onComplete: () => setIsAnimating(false)
    });
  };

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number }; velocity: { x: number } }
  ) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    const threshold = 50;
    
    if (Math.abs(offset) > threshold || Math.abs(velocity) > 500) {
      const direction = offset > 0 || velocity > 500 ? -1 : 1;
      const newIndex = (currentIndex + direction + images.length) % images.length;
      animateToIndex(newIndex);
    } else {
      animate(dragX, 0, {
        type: "spring",
        stiffness: 300,
        damping: 30,
      });
    }
  };

  const handleDragStart = () => {
    setIsAnimating(true);
  };

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
      <div className="absolute top-4 right-4 z-20 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-sm px-2 py-1">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Main gallery container */}
      <motion.div 
        ref={containerRef}
        className="relative w-full h-[400px] md:h-[600px] overflow-hidden cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{ x: dragX }}
      >
        <div className="flex items-center justify-center h-full">
          {images.map((image, index) => {
            const offset = index - currentIndex;
            const isActive = index === currentIndex;
            
            return (
              <motion.div
                key={image}
                className="absolute w-full max-w-4xl h-full"
                initial={false}
                animate={{
                  x: `${offset * 100}%`,
                  scale: isActive ? 1 : 0.8,
                  opacity: Math.abs(offset) > 1 ? 0 : isActive ? 1 : 0.6,
                  zIndex: isActive ? 10 : 5,
                }}
                transition={{
                  duration: 0.5,
                  ease: [0.33, 1, 0.68, 1],
                }}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={image}
                    alt={`${title} - image ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 1024px"
                    quality={90}
                    className="object-contain"
                    priority={index === 0}
                    draggable={false}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
      
      {/* Navigation dots */}
      <div className="flex justify-center gap-2 mt-8">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => animateToIndex(index)}
            className={`w-8 h-1 transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-neutral-800 dark:bg-neutral-200' 
                : 'bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400 dark:hover:bg-neutral-600'
            }`}
            disabled={isAnimating}
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
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { playClick } = useSound();
  const { scrollY } = useScrollTracker();

  // Simplified parallax effects
  const heroParallax = useParallax(scrollY, 0.3);
  const contentParallax = useParallax(scrollY, 0.1);
  
  // Navigation backdrop opacity
  const navBackdropOpacity = useTransform(scrollY, [0, 100], [0, 1]);

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

  const images = isMobile ? 
    (project.mobileImages && project.mobileImages.length > 0 ? project.mobileImages : project.images || []) : 
    project.images || [];

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
          className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-50"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
        >
          <motion.div
            className="absolute inset-0 bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-200/50 dark:border-neutral-800/50"
            style={{
              opacity: navBackdropOpacity
            }}
          />
          
          <MagneticElement>
            <MinimalLink href="/" className="text-sm hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors relative z-10">
              atanas kyurkchiev
            </MinimalLink>
          </MagneticElement>
          
          <MagneticElement>
            <MinimalLink
              href="/#work"
              className="text-sm hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors relative z-10"
            >
              back to work
            </MinimalLink>
          </MagneticElement>
        </motion.nav>

        <div className="pt-24 px-6 md:px-12 max-w-6xl mx-auto">
          {/* Project header */}
          <motion.div 
            className="max-w-4xl mb-16 relative"
            style={{ y: heroParallax }}
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
              <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 leading-relaxed">
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
            className="grid md:grid-cols-[2fr,1fr] gap-16 max-w-6xl mb-24"
            style={{ y: contentParallax }}
          >
            {/* Main content */}
            <div className="space-y-8">
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
                    <p className="leading-relaxed text-base">{paragraph}</p>
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
                <h3 className="text-sm font-medium mb-6 uppercase tracking-wider">
                  Technologies Used
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
            className="relative w-full border-t border-neutral-200 dark:border-neutral-800 mt-32"
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
