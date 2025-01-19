"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { notFound } from "next/navigation";
import { use } from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { RevealText } from "../../components/RevealText";
import { MinimalLink } from "../../components/MinimalLink";
import { useSound } from "../../components/SoundProvider";
import { ReadingTime } from "../../components/ReadingTime";
import { ViewCounter } from "../../components/ViewCounter";

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
    link: "https://dev.surplush.co.uk",
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

export default function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const project = projects[slug as keyof typeof projects];
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { playClick } = useSound();

  if (!project) {
    notFound();
  }

  const images = isMobile ? project.mobileImages : project.images;

  return (
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

        {/* project images */}
        <div className="grid md:grid-cols-[1.5fr,1fr] gap-6 mb-24">
          {/* Main large image */}
          <RevealText>
            <motion.div
              initial={{ scale: 0.95 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative h-[75vh] w-full"
            >
              <Image
                src={images[0]}
                alt={`${project.title} - main image`}
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                quality={90}
                className="object-contain grayscale hover:grayscale-0 transition-all"
                priority
              />
            </motion.div>
          </RevealText>

          {/* Two smaller stacked images */}
          <div className="grid grid-rows-2 gap-6">
            {images.slice(1, 3).map((image, index) => (
              <RevealText key={image}>
                <motion.div
                  initial={{ scale: 0.95 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.8 }}
                  className="relative h-[35vh] w-full"
                >
                  <Image
                    src={image}
                    alt={`${project.title} - detail ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 35vw"
                    quality={90}
                    className="object-contain grayscale hover:grayscale-0 transition-all"
                    priority={index === 0}
                  />
                </motion.div>
              </RevealText>
            ))}
          </div>
        </div>

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
                      className="text-xs px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-full"
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
        <div className="w-full border-t border-neutral-200 dark:border-neutral-800 mt-32 pt-32">
          <div className="max-w-3xl mx-auto px-6 md:px-12">
            <RevealText>
              <p className="text-sm mb-12 text-center">
                like what you see? check out more of my{" "}
                <MinimalLink
                  href="/#work"
                  className="underline hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
                >
                  work
                </MinimalLink>{" "}
                or{" "}
                <MinimalLink
                  href="/#contact"
                  className="underline hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
                >
                  get in touch
                </MinimalLink>
              </p>
            </RevealText>
          </div>
        </div>
      </div>
    </main>
  );
}
