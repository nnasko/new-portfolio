'use client';

import { useRef, useState, useEffect, lazy, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatedText } from "../components/AnimatedText";
import { useSound } from "../components/SoundAndRainProvider";
import { motion } from "framer-motion";
import { Metadata } from "next";

// Lazy load components for performance
const SectionTransition = lazy(() => import("../components/SectionTransition").then(module => ({ default: module.SectionTransition })));
const ScrollProgress = lazy(() => import("../components/ScrollProgress").then(module => ({ default: module.ScrollProgress })));

// Component loader
function ComponentLoader() {
  return <div className="h-1 w-full bg-transparent" />;
}

// Local business testimonials data
const localTestimonials = [
  {
    name: "Surplush Team",
    business: "Surplush, Norwich",
    quote: "Atanas built our B2B marketplace platform that revolutionized how businesses source supplies. The platform reduced our clients' supply costs by 30% while promoting eco-friendly practices.",
    service: "B2B Marketplace Platform Development"
  },
  {
    name: "Jacked Fitness Team", 
    business: "Jacked Fitness, Norfolk",
    quote: "Our professional fitness platform doubled client inquiries and established a strong online presence. The tiered pricing system and subscription capabilities transformed our business model.",
    service: "Fitness Platform & Subscription System"
  },
  {
    name: "NR Surveyors Team",
    business: "NR Surveyors, Norwich",
    quote: "Working with a local Norwich developer who understands the property market made all the difference. Professional website that generates quality leads from across Norfolk.",
    service: "Professional Services Website & Lead Generation"
  }
];

const norwichAreas = [
  "Norwich City Centre", "Eaton", "Unthank Road", "Golden Triangle", 
  "Thorpe St Andrew", "Sprowston", "Hellesdon", "Bowthorpe", 
  "Costessey", "Cringleford", "Wymondham", "Long Stratton"
];

const webDevelopmentServices = [
  {
    title: "Business Websites",
    description: "Professional websites that establish credibility, generate leads, and grow your business online.",
    benefits: ["SEO optimization", "Mobile-first design", "Contact form integration", "Analytics setup"]
  },
  {
    title: "E-commerce Development", 
    description: "Complete online stores with secure payments, inventory management, and seamless user experience.",
    benefits: ["Secure payment processing", "Inventory management", "Order management", "Multi-channel integration"]
  },
  {
    title: "Web Applications",
    description: "Custom web applications that automate business processes and solve specific operational challenges.",
    benefits: ["Process automation", "Database integration", "User management", "API development"]
  },
  {
    title: "Technical Consulting",
    description: "Strategic guidance on technology choices, architecture decisions, and digital transformation.", 
    benefits: ["Technology audits", "Performance optimization", "Security reviews", "Scalability planning"]
  }
];

export default function WebDeveloperNorwichPage() {
  const { playClick } = useSound();

  return (
    <main className="min-h-screen relative">
      <Suspense fallback={<ComponentLoader />}>
        <ScrollProgress />
      </Suspense>

      {/* Hero Section */}
      <Suspense fallback={<ComponentLoader />}>
        <SectionTransition>
          <section className="py-28 md:py-32 px-4 md:px-6 lg:px-12">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <AnimatedText
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight font-light"
                    type="words"
                    animationType="slide"
                    direction="up"
                    stagger={0.08}
                  >
                    atanas kyurkchiev
                  </AnimatedText>
                  
                  <AnimatedText
                    className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 mb-2 leading-relaxed max-w-4xl mx-auto"
                    type="words"
                    animationType="fade"
                    delay={0.4}
                    stagger={0.02}
                  >
                    web developer norwich
                  </AnimatedText>

                  <AnimatedText
                    className="text-base md:text-lg text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed max-w-4xl mx-auto"
                    type="words"
                    animationType="fade"
                    delay={0.6}
                    stagger={0.02}
                  >
                    professional web developer creating modern, high-performance websites and applications. 
                    custom solutions that drive real business results.
                  </AnimatedText>
                </motion.div>
                
                <motion.div
                  className="flex justify-center mb-8"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <div className="relative">
                    <Image
                      src="/me.png"
                      alt="Atanas Kyurkchiev - Web Developer Norwich"
                      width={120}
                      height={120}
                      className="rounded-full border-4 border-neutral-200 dark:border-neutral-700"
                    />
                  </div>
                </motion.div>

                <motion.div
                  className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                >
                  <Link
                    href="/hire"
                    className="bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-8 py-4 rounded-md font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all duration-300"
                    onClick={playClick}
                  >
                    get free quote
                  </Link>
                  
                  <Link
                    href="tel:+447894424985"
                    className="border border-neutral-400 dark:border-neutral-600 bg-transparent text-neutral-900 dark:text-neutral-100 px-8 py-4 rounded-md font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-300"
                  >
                    call now
                  </Link>
                </motion.div>

                {/* Local area coverage */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="text-sm text-neutral-500 dark:text-neutral-500"
                >
                  <p className="mb-2">serving:</p>
                  <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
                    {norwichAreas.map((area, index) => (
                      <span key={area} className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-xs">
                        {area}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        </SectionTransition>
      </Suspense>

      {/* Why Choose Local Section */}
      <Suspense fallback={<ComponentLoader />}>
        <SectionTransition delay={0.1}>
          <section className="py-16 md:py-24 px-4 md:px-6 lg:px-12 bg-neutral-100 dark:bg-neutral-800">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <AnimatedText
                  className="text-2xl md:text-3xl lg:text-4xl mb-6 font-light"
                  type="words"
                  animationType="slide"
                  direction="up"
                  stagger={0.1}
                >
                  why work with me?
                </AnimatedText>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    title: "Technical Excellence",
                    description: "Modern development practices, clean code, and performance-first approach. Every project built with scalability and maintainability in mind."
                  },
                  {
                    title: "Personal Service",
                    description: "Direct communication with me throughout the project. No account managers or middlemen - just clear, honest collaboration."
                  },
                  {
                    title: "Fast Delivery",
                    description: "Efficient development process with regular updates and quick turnaround times. Same-day responses guaranteed."
                  },
                  {
                    title: "Business-Focused Solutions",
                    description: "Not just websites - digital solutions that solve real business problems and drive measurable results."
                  },
                  {
                    title: "Full-Stack Expertise",
                    description: "From frontend design to backend architecture, database optimization to API integrations - complete technical capability."
                  },
                  {
                    title: "Ongoing Partnership",
                    description: "Long-term support, maintenance, and growth strategies. Your success is my success."
                  }
                ].map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    className="p-6 bg-white dark:bg-neutral-900 rounded-lg hover:shadow-lg transition-all duration-300"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <h3 className="text-lg font-medium mb-3">{benefit.title}</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </SectionTransition>
      </Suspense>

      {/* Services for Norfolk Businesses */}
      <Suspense fallback={<ComponentLoader />}>
        <SectionTransition delay={0.15}>
          <section className="py-16 md:py-24 px-4 md:px-6 lg:px-12">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <AnimatedText
                  className="text-2xl md:text-3xl lg:text-4xl mb-6 font-light"
                  type="words"
                  animationType="slide"
                  direction="up"
                  stagger={0.1}
                >
                  web development services
                </AnimatedText>
                <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
                  comprehensive solutions from simple business websites to complex web applications. 
                  modern technology, proven results, transparent pricing.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {webDevelopmentServices.map((service, index) => (
                  <motion.div
                    key={service.title}
                    className="p-8 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-neutral-300 dark:hover:border-neutral-600 transition-all duration-300"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                  >
                    <h3 className="text-xl font-medium mb-4">{service.title}</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
                      {service.description}
                    </p>
                    <ul className="space-y-2">
                      {service.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-neutral-900 dark:bg-neutral-100 rounded-full flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </SectionTransition>
      </Suspense>

      {/* Local Testimonials */}
      <Suspense fallback={<ComponentLoader />}>
        <SectionTransition delay={0.2}>
          <section className="py-16 md:py-24 px-4 md:px-6 lg:px-12 bg-neutral-100 dark:bg-neutral-800">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <AnimatedText
                  className="text-2xl md:text-3xl lg:text-4xl mb-6 font-light"
                  type="words"
                  animationType="slide" 
                  direction="up"
                  stagger={0.1}
                >
                  recent projects
                </AnimatedText>
                <p className="text-lg text-neutral-600 dark:text-neutral-400">
                  real projects, real results, real impact
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {localTestimonials.map((testimonial, index) => (
                  <motion.div
                    key={testimonial.name}
                    className="p-6 bg-white dark:bg-neutral-900 rounded-lg"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <div className="mb-4">
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed mb-4">
                        "{testimonial.quote}"
                      </p>
                      <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
                        <p className="font-medium">{testimonial.name}</p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-500">{testimonial.business}</p>
                        <p className="text-xs text-neutral-400 dark:text-neutral-600 mt-1">{testimonial.service}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </SectionTransition>
      </Suspense>

      {/* Call to Action */}
      <Suspense fallback={<ComponentLoader />}>
        <SectionTransition delay={0.25}>
          <section className="py-16 md:py-24 px-4 md:px-6 lg:px-12">
            <div className="max-w-4xl mx-auto text-center">
                              <AnimatedText
                  className="text-2xl md:text-3xl lg:text-4xl mb-6 font-light"
                  type="words"
                  animationType="slide"
                  direction="up"
                  stagger={0.1}
                >
                  ready to start your project?
                </AnimatedText>
                
                <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto">
                  get a free consultation and project quote. let's discuss how we can build 
                  something amazing together that drives real results for your business.
                </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/hire"
                  className="bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-8 py-4 rounded-md font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all duration-300"
                  onClick={playClick}
                >
                  start your project today
                </Link>
                
                <a
                  href="mailto:me@atanaskyurkchiev.info"
                  className="border border-neutral-400 dark:border-neutral-600 bg-transparent text-neutral-900 dark:text-neutral-100 px-8 py-4 rounded-md font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-300"
                  onClick={playClick}
                >
                  send a quick email
                </a>
              </div>

              <div className="mt-8 text-center">
                <p className="text-xs text-neutral-500 dark:text-neutral-500">
                  free consultation • transparent pricing • response within 24 hours
                </p>
                <div className="mt-4 text-sm">
                  <Link href="/" className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 underline transition-colors">
                    ← back to main portfolio
                  </Link>
                  {" | "}
                  <Link href="/pricing" className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 underline transition-colors">
                    view transparent pricing
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </SectionTransition>
      </Suspense>
    </main>
  );
}
