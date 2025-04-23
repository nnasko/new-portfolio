"use client";

import { motion, useMotionValue, animate } from "framer-motion";
import Image from "next/image";
import { notFound } from "next/navigation";
import { use, Suspense } from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { RevealText } from "../../components/RevealText";
import { MinimalLink } from "../../components/MinimalLink";
import { useSound } from "../../components/SoundProvider";
import { ReadingTime } from "../../components/ReadingTime";
import { ViewCounter } from "../../components/ViewCounter";
import { useState, useEffect, useRef } from "react";
import { siteConfig } from "../../metadata";

interface Project {
  title: string;
  description: string;
  fullDescription: string;
  images: string[];
  mobileImages: string[];
  tech?: string[];
  link: string;
  year: string;
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

const projects = {
  surplush: {
    title: "surplush",
    description:
      "a platform for businesses to get essential supplies cheaper & the eco-friendly way",
    fullDescription: `
      overview:
      surplush is a next.js-powered marketplace revolutionizing how businesses source their essential supplies. the platform focuses on sustainability and cost-effectiveness, making eco-friendly supplies accessible to all businesses.

      the challenge:
      • reducing supply chain complexity and costs for businesses
      • making eco-friendly supplies more accessible and affordable
      • streamlining the ordering process for regular business supplies
      • implementing efficient delivery and inventory management

      the solution:
      developed a comprehensive platform focusing on three main areas:

      1. business experience
      • intuitive dashboard for order management
      • simplified reordering process
      • real-time stock availability
      • automated delivery scheduling
      • bulk ordering capabilities

      2. sustainability features
      • eco-friendly product highlighting
      • carbon footprint tracking
      • sustainable packaging options
      • waste reduction analytics
      • environmental impact reports

      3. supply chain optimization
      • direct supplier connections
      • smart inventory management
      • automated stock alerts
      • efficient delivery routing
      • bulk pricing calculations

      technical highlights:
      • next.js 15 with server components
      • typescript for type safety
      • mysql database with prisma orm
      • stripe payment processing
      • klaviyo email automation
      • zedify delivery integration
      • cloudinary media optimization
      • netlify edge functions
    `,
    images: [
      "/surplush/main.png",
      "/surplush/detail1.png",
      "/surplush/detail2.png",
    ],
    mobileImages: [
      "/surplush/mobile-main.png",
      "/surplush/mobile-detail1.png",
      "/surplush/mobile-detail2.png",
    ],
    tech: [
      "next.js",
      "typescript",
      "tailwind css",
      "stripe",
      "klaviyo",
      "zedify",
      "prisma",
      "mysql",
    ],
    link: "https://surplush.co.uk",
    year: "2024 - 2025",
  },
  kronos: {
    title: "kronos clothing",
    description: "my custom-built store for my clothing brand",
    fullDescription: `
      overview:
      kronos is a modern e-commerce platform built specifically for uk streetwear culture. the platform combines high-performance technology with sleek design to deliver an exceptional shopping experience.

      the challenge:
      • creating a modern, high-performance e-commerce platform for uk streetwear
      • managing complex inventory across multiple product categories
      • building an engaging customer experience with personalized features
      • implementing secure payment and user management systems

      the solution:
      developed a full-stack application with focus on three core areas:

      1. shopping experience
      • responsive, minimalist design with smooth animations
      • real-time cart updates and stock tracking
      • intuitive product navigation by categories
      • seamless checkout process with stripe

      2. product management
      • sophisticated inventory system with size-specific tracking
      • scheduled product releases
      • automated stock notifications
      • dynamic pricing and discount system
      • detailed product analytics

      3. customer engagement
      • personalized email campaigns via resend
      • custom newsletter system
      • promotional code engine
      • order tracking and notifications
      • customer feedback integration

      technical highlights:
      • next.js app router with server components
      • typescript for type safety
      • postgresql database with prisma orm
      • stripe payment integration
      • resend for transactional emails
      • responsive images with next/image
      • secure authentication system
      • automated deployment with netlify
    `,
    images: ["/kronos/main.png", "/kronos/detail1.png", "/kronos/detail2.png"],
    mobileImages: [
      "/kronos/mobile-main.png",
      "/kronos/mobile-detail1.png",
      "/kronos/mobile-detail2.png",
    ],
    tech: ["next.js", "typescript", "resend", "stripe", "prisma", "postgresql"],
    link: "https://wearkronos.store",
    year: "2024 - 2025",
  },
  jacked: {
    title: "jacked fitness",
    description:
      "a place for people to find out more about jack and his abilities as a personal trainer",
    fullDescription: `
      overview:
      jacked fitness is a modern platform designed to showcase professional training services and provide accessible fitness guidance. the site combines sleek design with practical functionality to help users start their fitness journey.

      the challenge:
      • creating an engaging platform to showcase personal training services
      • implementing a tiered pricing system with subscription capabilities
      • developing an intuitive interface for fitness content delivery
      • building a responsive system for client transformations and testimonials

      the solution:
      developed a comprehensive fitness platform focusing on three core areas:

      1. client experience
      • clean, responsive interface across all devices
      • easy-to-navigate program tiers (bronze to platinum)
      • monthly routine subscription service
      • interactive equipment tutorials
      • comprehensive faq section
      • before/after transformation gallery
      
      2. training programs
      • detailed program breakdowns
      • custom pricing tiers with feature comparison
      • equipment guides and tutorials
      • nutrition guidance integration

      3. engagement features
      • client transformation gallery
      • testimonials and success stories
      • equipment tutorial videos
      • responsive contact form
      • social media integration
      • newsletter subscription

      technical highlights:
      • next.js app router with server components
      • typescript for type safety
      • tailwind css for responsive design
      • postgresql database with prisma orm
      • stripe subscription system
      • responsive image optimization
      • custom animation system
      • automated deployment with netlify
    `,
    images: ["/jacked/main.png", "/jacked/detail1.png", "/jacked/detail2.png"],
    mobileImages: [
      "/jacked/mobile-main.png",
      "/jacked/mobile-detail1.png",
      "/jacked/mobile-detail2.png",
    ],
    tech: ["next.js", "typescript", "tailwind css", "prisma", "postgresql"],
    link: "https://jackedfitness.com",
    year: "2024 - 2025",
  },
};

function ImageGalleryWheel({ images, title }: { images: string[], title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);
  
  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      const imageWidth = width > 768 ? Math.min(800, width * 0.5) : width - 48;
      const imageHeight = (imageWidth * 9) / 16;
      
      setDimensions({
        width: imageWidth,
        height: imageHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleDragStart = () => {
    if (isAnimating) return false;
    setIsDragging(true);
  };

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number }; velocity: { x: number } }
  ) => {
    if (isAnimating) {
      dragX.set(0);
      setIsAnimating(false);
      return;
    }
    
    setIsDragging(false);
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    const threshold = dimensions.width * 0.15;
    
    if (Math.abs(offset) > threshold || Math.abs(velocity) > 300) {
      const direction = offset > 0 || velocity > 300 ? -1 : 1;
      const newIndex = (currentIndex + direction + images.length) % images.length;
      setCurrentIndex(newIndex);
    }

    setIsAnimating(true);
    animate(dragX, 0, {
      type: "spring",
      stiffness: 200,
      damping: 25,
      velocity: info.velocity.x * 0.5,
      onComplete: () => setIsAnimating(false)
    });
  };

  const animateToIndex = (index: number, instant = false) => {
    if (isAnimating || isDragging) return;
    
    setIsAnimating(true);
    setCurrentIndex(index);

    if (instant) {
      dragX.set(0);
      setIsAnimating(false);
    } else {
      // Single smooth animation
      animate(dragX, 0, {
        type: "spring",
        stiffness: 150,
        damping: 22,
        onComplete: () => {
          setIsAnimating(false);
        }
      });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (isAnimating || isDragging) return;
    
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      const direction = e.deltaX > 0 ? 1 : -1;
      const newIndex = (currentIndex + direction + images.length) % images.length;
      animateToIndex(newIndex);
    }
  };

  if (dimensions.width === 0) return null;

  const getStackStyles = (index: number) => {
    const totalImages = images.length;
    const position = (index - currentIndex + totalImages) % totalImages;
    
    let zIndex = totalImages - Math.abs(position);
    if (position === 0) zIndex = totalImages;

    let translateX = 0;
    let translateZ = 0;
    let rotateY = 0;
    let opacity = 1;
    let scale = 1;
    
    const currentDrag = dragX.get();
    
    if (position === 0) {
      // Current image
      translateZ = 50;
      translateX = currentDrag;
      scale = 1.04;
    } else if (position === 1 || position === -totalImages + 1) {
      // Next image
      translateX = dimensions.width * 0.75;
      translateZ = -50;
      rotateY = -15;
      opacity = 0.7;
      scale = 0.96;
      if (currentDrag < 0) {
        const progress = Math.min(Math.abs(currentDrag) / dimensions.width, 1);
        translateX += currentDrag * 0.5;
        rotateY += progress * 15;
        opacity = 0.7 + progress * 0.3;
        scale = 0.96 + progress * 0.08;
      }
    } else if (position === totalImages - 1 || position === -1) {
      // Previous image
      translateX = -dimensions.width * 0.75;
      translateZ = -50;
      rotateY = 15;
      opacity = 0.7;
      scale = 0.96;
      if (currentDrag > 0) {
        const progress = Math.min(currentDrag / dimensions.width, 1);
        translateX += currentDrag * 0.5;
        rotateY -= progress * 15;
        opacity = 0.7 + progress * 0.3;
        scale = 0.96 + progress * 0.08;
      }
    } else if (position > 1) {
      // Stack to the right
      translateX = dimensions.width * (0.75 + position * 0.1);
      translateZ = -100 - position * 25;
      rotateY = -15;
      opacity = 0.5;
      scale = 0.92;
    } else {
      // Stack to the left
      translateX = -dimensions.width * (0.75 + Math.abs(position) * 0.1);
      translateZ = -100 - Math.abs(position) * 25;
      rotateY = 15;
      opacity = 0.5;
      scale = 0.92;
    }

    return {
      zIndex,
      transform: `translate3d(${translateX}px, 0, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity,
      transition: isAnimating ? 'all 0.3s cubic-bezier(0.2, 0, 0.2, 1)' : 'none',
    };
  };

  return (
    <div className="w-full mb-24 relative">
      <motion.div 
        ref={containerRef}
        className="relative h-[500px] md:h-[600px] flex items-center cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onWheel={handleWheel}
        style={{ x: dragX }}
      >
        <div className="absolute inset-0 flex items-center justify-center perspective-[2000px]">
          <div className="relative preserve-3d w-full h-full flex items-center justify-center">
            {images.map((image, index) => (
              <motion.div
                key={image}
                className="absolute origin-center preserve-3d"
                style={{
                  width: dimensions.width,
                  height: dimensions.height,
                  ...getStackStyles(index),
                }}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={image}
                    alt={`${title} - image ${index + 1}`}
                    fill
                    sizes={`(max-width: 768px) 100vw, 800px`}
                    quality={90}
                    className="object-contain"
                    priority={index === 0}
                    draggable={false}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
      
      {/* Navigation dots */}
      <div className="flex justify-center gap-3 mt-8">
        {images.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => !isAnimating && animateToIndex(index)}
            className={`w-2.5 h-2.5 rounded-none transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-neutral-800 dark:bg-neutral-200 scale-125' 
                : 'bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400 dark:hover:bg-neutral-600'
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            disabled={isAnimating}
          />
        ))}
      </div>
    </div>
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
  const project = projects[slug as keyof typeof projects];
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { playClick } = useSound();

  if (!project) {
    notFound();
  }

  const images = isMobile ? project.mobileImages : project.images;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getProjectSchema(project))
        }}
      />
      <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        {/* navigation */}
        <nav className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-sm z-50">
          <MinimalLink href="/" className="text-sm hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors">
            atanas kyurkchiev
          </MinimalLink>
          <MinimalLink
            href="/#work"
            className="text-sm hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
          >
            back to work
          </MinimalLink>
        </nav>

        <div className="pt-24 px-6 md:px-12 max-w-7xl mx-auto">
          {/* project header */}
          <div className="max-w-3xl mb-16">
            <RevealText>
              <h1 className="text-3xl mb-4">{project.title}</h1>
            </RevealText>
            <RevealText>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
                {project.description}
              </p>
            </RevealText>
            <div className="flex flex-wrap gap-4 items-center text-sm">
              <RevealText>
                <span>{project.year}</span>
              </RevealText>
              <span>•</span>
              <RevealText>
                <ReadingTime content={project.fullDescription} />
              </RevealText>
              <span>•</span>
              <RevealText>
                <ViewCounter slug={slug} />
              </RevealText>
              <span>•</span>
              <RevealText>
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
                  onClick={playClick}
                >
                  view live site
                </a>
              </RevealText>
            </div>
          </div>

          {/* project images - replaced with gallery wheel */}
          <RevealText>
            <ImageGalleryWheel images={images} title={project.title} />
          </RevealText>

          {/* project content */}
          <div className="grid md:grid-cols-[2fr,1fr] gap-12 max-w-6xl">
            {/* main content */}
            <div className="space-y-8 text-sm">
              {project.fullDescription.split("\n\n").map((paragraph, index) => (
                <RevealText key={index}>
                  <p className="leading-relaxed">{paragraph}</p>
                </RevealText>
              ))}
            </div>

            {/* tech stack sidebar */}
            <div className="space-y-8">
              <RevealText>
                <div className="sticky top-24">
                  <h3 className="text-sm font-medium mb-4">Technologies Used</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tech?.map((tech) => (
                      <span
                        key={tech}
                        className="text-xs px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-none"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </RevealText>
            </div>
          </div>

          {/* Call to action section */}
          <div className="relative w-full border-t border-neutral-200 dark:border-neutral-800 mt-32">
            <div className="max-w-3xl mx-auto py-32">
              <RevealText>
                <div className="text-center px-6 md:px-12">
                  <p className="text-2xl sm:text-3xl mb-12">
                    ready to build your next digital experience?
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <MinimalLink
                      href="/hire"
                      className="text-sm border border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 px-8 py-3 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                    >
                      start a project
                    </MinimalLink>
                    <MinimalLink
                      href="/#work"
                      className="text-sm border border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 px-8 py-3 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                    >
                      view more work
                    </MinimalLink>
                  </div>
                </div>
              </RevealText>
            </div>
          </div>
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
        <p className="text-sm">Loading...</p>
      </div>
    }>
      <ProjectContent slug={slug} />
    </Suspense>
  );
}
