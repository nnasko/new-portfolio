'use client';

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { AnimatedText } from "../components/AnimatedText";
import { SectionTransition } from "../components/SectionTransition";

export default function AboutPage() {
  return (
    <main className="min-h-screen pt-24 px-4 md:px-6 lg:px-12">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <SectionTransition>
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <AnimatedText
              className="text-3xl md:text-4xl lg:text-5xl mb-6 font-light"
              type="words"
              animationType="slide"
              direction="up"
              stagger={0.1}
            >
              about atanas kyurkchiev
            </AnimatedText>
            
            <div className="flex justify-center mb-8">
              <Image
                src="/me.png"
                alt="Atanas Kyurkchiev - Web Developer"
                width={200}
                height={200}
                className="rounded-full border-4 border-neutral-200 dark:border-neutral-700"
                priority
              />
            </div>
          </motion.div>
        </SectionTransition>

        {/* Bio Content */}
        <SectionTransition delay={0.2}>
          <motion.div
            className="prose prose-lg dark:prose-invert max-w-none"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="space-y-6 text-base md:text-lg leading-relaxed">
              <p>
                Hi, I'm Atanas Kyurkchiev, a professional web developer and digital solutions specialist based in Norwich, Norfolk. 
                I create modern, high-performance websites and web applications that help businesses grow and succeed online.
              </p>
              
              <p>
                With expertise in modern web technologies including React, Next.js, TypeScript, and Node.js, I build everything 
                from simple business websites to complex e-commerce platforms and custom web applications. My focus is on 
                delivering clean, user-focused solutions that drive real business results.
              </p>
              
              <p>
                I work with businesses of all sizes - from local Norwich startups to established companies across the UK. 
                Whether you need a professional business website, an e-commerce store, or a custom web application, 
                I provide end-to-end development services with transparent pricing and clear communication.
              </p>
              
              <p>
                My approach combines technical excellence with business understanding. I don't just build websites - 
                I create digital solutions that solve real problems and help businesses achieve their goals. Every project 
                is built with performance, scalability, and user experience as top priorities.
              </p>
            </div>
          </motion.div>
        </SectionTransition>

        {/* Skills & Technologies */}
        <SectionTransition delay={0.4}>
          <motion.div
            className="mt-16 mb-16"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-light mb-8">skills & technologies</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-4">frontend development</h3>
                <ul className="space-y-2 text-neutral-600 dark:text-neutral-400">
                  <li>React & Next.js</li>
                  <li>TypeScript & JavaScript</li>
                  <li>HTML5 & CSS3</li>
                  <li>Tailwind CSS</li>
                  <li>Responsive Design</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">backend development</h3>
                <ul className="space-y-2 text-neutral-600 dark:text-neutral-400">
                  <li>Node.js & Express</li>
                  <li>Database Design</li>
                  <li>API Development</li>
                  <li>Authentication Systems</li>
                  <li>Server Management</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">business solutions</h3>
                <ul className="space-y-2 text-neutral-600 dark:text-neutral-400">
                  <li>E-commerce Platforms</li>
                  <li>Payment Integration</li>
                  <li>SEO Optimization</li>
                  <li>Performance Optimization</li>
                  <li>Business Automation</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </SectionTransition>

        {/* Contact CTA */}
        <SectionTransition delay={0.6}>
          <motion.div
            className="text-center py-16 border-t border-neutral-200 dark:border-neutral-800"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <h2 className="text-2xl md:text-3xl font-light mb-6">ready to work together?</h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto">
              Let's discuss your project and create a digital solution that drives real results for your business.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/hire"
                className="inline-flex items-center gap-2 bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-8 py-4 rounded-md font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all duration-300"
              >
                start a project
              </Link>
              
              <a
                href="mailto:me@atanaskyurkchiev.info"
                className="inline-flex items-center gap-2 border border-neutral-400 dark:border-neutral-600 bg-transparent text-neutral-900 dark:text-neutral-100 px-8 py-4 rounded-md font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-300"
              >
                send email
              </a>
            </div>
          </motion.div>
        </SectionTransition>
        
      </div>
    </main>
  );
}
