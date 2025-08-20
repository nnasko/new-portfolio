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
                Hi, I'm Atanas Kyurkchiev, an 18-year-old web developer and computer science student from <a href="/web-developer-norwich" className="underline hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Norwich, Norfolk</a>. 
                I'm passionate about creating modern web applications and learning new technologies while studying at <a href="https://lancaster.ac.uk" target="_blank" rel="noopener noreferrer" className="underline hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Lancaster University</a>.
              </p>
              
              <p>
                With expertise in modern web technologies including <a href="https://react.dev" target="_blank" rel="noopener noreferrer" className="underline hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">React</a>, 
                <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Next.js</a>, 
                <a href="https://typescriptlang.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">TypeScript</a>, and 
                <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Node.js</a>, I build everything 
                from personal portfolios to complex full-stack applications. My focus is on clean code, great user experiences, and continuous learning.
              </p>
              
              <p>
                Currently balancing my Computer Science studies with running <a href="https://kyurkchiev.group" target="_blank" rel="noopener noreferrer" className="underline hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Kyurkchiev Group</a>, 
                my digital solutions company. Whether it's academic projects, personal experiments, or professional work, 
                I enjoy tackling challenging problems and building solutions that make a difference.
              </p>
              
              <p>
                My approach combines academic learning with practical application. I believe in building with modern best practices, 
                performance optimization, and accessibility in mind. Every project is an opportunity to learn something new and 
                push the boundaries of what's possible with web technologies. You can see some of my work in my <Link href="/work" className="underline hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">project portfolio</Link>.
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
                  <li><a href="https://react.dev" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">React</a> & <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Next.js</a></li>
                  <li><a href="https://typescriptlang.org" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">TypeScript</a> & <a href="https://javascript.info" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">JavaScript</a></li>
                  <li><a href="https://html.spec.whatwg.org" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">HTML5</a> & <a href="https://css3.info" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">CSS3</a></li>
                  <li><a href="https://tailwindcss.com" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Tailwind CSS</a></li>
                  <li>Responsive Design</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">backend development</h3>
                <ul className="space-y-2 text-neutral-600 dark:text-neutral-400">
                  <li><a href="https://nodejs.org" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Node.js</a> & <a href="https://expressjs.com" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Express</a></li>
                  <li><a href="https://prisma.io" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Prisma</a> & Database Design</li>
                  <li>REST API Development</li>
                  <li>Authentication Systems</li>
                  <li>Server Management</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">tools & platforms</h3>
                <ul className="space-y-2 text-neutral-600 dark:text-neutral-400">
                  <li><a href="https://git-scm.com" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Git</a> & <a href="https://github.com/nnasko" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">GitHub</a></li>
                  <li><a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Vercel</a> Deployment</li>
                  <li><a href="https://figma.com" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Figma</a> Design</li>
                  <li>Performance Optimization</li>
                  <li><Link href="/cv" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">View Full CV</Link></li>
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
