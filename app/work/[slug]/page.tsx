"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { RevealText } from "../../components/RevealText";

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
  const resolvedParams = use(params);
  const project = projects[resolvedParams.slug as keyof typeof projects];
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (!project) {
    notFound();
  }

  const images = isMobile ? project.mobileImages : project.images;

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-24">
      {/* navigation */}
      <nav className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-sm z-50">
        <RevealText direction="down">
          <Link
            href="/"
            className="text-sm hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
          >
            atanas kyurkchiev
          </Link>
        </RevealText>
        <RevealText direction="down">
          <Link
            href="/#work"
            className="text-sm hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
          >
            back to work
          </Link>
        </RevealText>
      </nav>

      <article className="px-6 md:px-12 py-12">
        {/* project images */}
        <div className="grid gap-12 mb-24">
          {images.map((image, index) => (
            <RevealText key={image}>
              <motion.div
                initial={{ scale: 0.95 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative aspect-[16/9]"
              >
                <Image
                  src={image}
                  alt={`${project.title} - image ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 80vw"
                  quality={90}
                  className="object-contain grayscale hover:grayscale-0 transition-all"
                  priority={index === 0}
                />
              </motion.div>
            </RevealText>
          ))}
        </div>

        {/* project content */}
        <div className="max-w-2xl">
          <RevealText>
            <h1 className="text-2xl mb-6">{project.title}</h1>
          </RevealText>
          <RevealText>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              {project.description}
            </p>
          </RevealText>
          <RevealText>
            <div className="flex gap-4 text-sm mb-12">
              <span>{project.year}</span>
              <span>•</span>
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
              >
                view live site
              </a>
            </div>
          </RevealText>
          
          {/* tech stack */}
          <RevealText>
            <div className="flex flex-wrap gap-2 mb-12">
              {project.tech?.map((tech) => (
                <span
                  key={tech}
                  className="text-xs px-2 py-1 border border-neutral-300 dark:border-neutral-700"
                >
                  {tech}
                </span>
              ))}
            </div>
          </RevealText>

          {/* full description */}
          <div className="space-y-6 text-sm whitespace-pre-line">
            {project.fullDescription.split('\n\n').map((paragraph, index) => (
              <RevealText key={index}>
                <p>{paragraph}</p>
              </RevealText>
            ))}
          </div>
        </div>
      </article>
    </main>
  );
}
