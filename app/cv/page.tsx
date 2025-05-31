"use client";

import React, { useEffect, useState } from "react";
import { motion, useTransform, useSpring } from "framer-motion";
import { MinimalLink } from "../components/MinimalLink";
import { useSound } from "../components/SoundProvider";
import { AnimatedText } from "../components/AnimatedText";
import { 
  useScrollTracker, 
  useMousePosition, 
  staggerContainer, 
  staggerItem
} from "../../lib/animation-utils";

// Magnetic effect component
function MagneticElement({ children, strength = 0.3 }: { children: React.ReactNode, strength?: number }) {
  const mousePosition = useMousePosition();
  const [isHovered, setIsHovered] = useState(false);
  const [elementCenter, setElementCenter] = useState({ x: 0, y: 0 });
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setElementCenter({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }
  }, [isHovered]);

  const deltaX = isHovered ? (mousePosition.x - elementCenter.x) * strength : 0;
  const deltaY = isHovered ? (mousePosition.y - elementCenter.y) * strength : 0;

  return (
    <motion.div
      ref={ref}
      animate={{ x: deltaX, y: deltaY }}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </motion.div>
  );
}

// Floating skill badge
function SkillBadge({ skill, index, delay = 0 }: { skill: string, index: number, delay?: number }) {
  const { scrollY } = useScrollTracker();
  const floatY = useTransform(scrollY, [0, 1000], [0, Math.sin(index * 0.5) * 10]);

  return (
    <motion.li
      style={{ y: floatY }}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ 
        delay: delay + index * 0.1, 
        duration: 0.5,
        ease: [0.33, 1, 0.68, 1]
      }}
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      className="cursor-default"
    >
      • {skill}
    </motion.li>
  );
}

// Progress bar component
function ScrollProgress() {
  const { scrollYProgress } = useScrollTracker();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-px bg-neutral-300 dark:bg-neutral-700 z-50 origin-left"
      style={{ scaleX }}
    />
  );
}

// Section with enhanced animations
function AnimatedSection({ 
  children, 
  className = "", 
  delay = 0 
}: { 
  children: React.ReactNode, 
  className?: string, 
  delay?: number 
}) {
  return (
    <motion.section
      className={className}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.8, 
        delay,
        ease: [0.33, 1, 0.68, 1]
      }}
    >
      {children}
    </motion.section>
  );
}

export default function CV() {
  const [isPdfMode, setIsPdfMode] = useState(false);
  const [theme, setTheme] = useState('light');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  // Make sound optional to prevent errors in headless environments
  let playClick = () => {}; // Default no-op function
  try {
    const soundHook = useSound();
    playClick = soundHook.playClick;
  } catch {
    // Keep the no-op function if sound fails
  }
  
  const { scrollY } = useScrollTracker();
  
  // Parallax effect for header
  const headerY = useTransform(scrollY, [0, 300], [0, -50]);
  const headerOpacity = useTransform(scrollY, [0, 200], [1, 0.8]);
  
  // Navigation background opacity transform - moved to top level
  const navBackgroundOpacity = useTransform(scrollY, [0, 100], [0, 1]);

  useEffect(() => {
    // Ensure we're in a browser environment
    if (typeof window === 'undefined') return;
    
    try {
      // Check if we're in PDF generation mode
      const urlParams = new URLSearchParams(window.location.search);
      const isPdf = urlParams.get("pdf") === "true";
      const urlTheme = urlParams.get("theme") || 'light';
      
      setIsPdfMode(isPdf);
      setTheme(urlTheme);

      // Add class to body when in PDF mode
      if (isPdf) {
        document.body.classList.add("pdf-mode");
        // Apply theme for PDF
        if (urlTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else {
        // Detect current theme from system/user preference
        try {
          const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ||
                        document.documentElement.classList.contains('dark');
          setTheme(isDark ? 'dark' : 'light');
        } catch {
          // Fallback if matchMedia is not available
          setTheme('light');
        }
      }
    } catch (error) {
      console.error('Error in CV useEffect:', error);
      // Fallback values
      setIsPdfMode(false);
      setTheme('light');
    }

    return () => {
      try {
        document.body.classList.remove("pdf-mode");
      } catch {
        // Ignore errors during cleanup
      }
    };
  }, []);

  const handleDownloadPdf = async () => {
    try {
      playClick();
    } catch {
      // Ignore sound errors
    }
    
    setIsGeneratingPdf(true);
    try {
      const response = await fetch('/api/cv/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `atanas-kyurkchiev-cv-${theme}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('PDF generation failed:', error);
      
      // Try browser print as fallback
      try {
        const originalTitle = document.title;
        document.title = `atanas-kyurkchiev-cv-${theme}`;
        document.body.classList.add("pdf-mode");
        
        // Open print dialog
        if (window.print) {
          window.print();
        } else {
          throw new Error('Print not available');
        }
        
        // Restore original state
        setTimeout(() => {
          document.title = originalTitle;
          document.body.classList.remove("pdf-mode");
        }, 1000);
      } catch {
        // Final fallback to static PDF
        const a = document.createElement('a');
        a.href = '/cv.pdf';
        a.download = 'atanas-kyurkchiev-cv.pdf';
        a.click();
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const skills = {
    languages: ["typescript/javascript", "html/css", "sql", "python"],
    frameworks: ["next.js", "react", "tailwind css", "prisma"],
    tools: ["git", "vs code", "figma", "postman"]
  };

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900 relative">
      {!isPdfMode && <ScrollProgress />}
      
      {/* Enhanced navigation */}
      {!isPdfMode && (
        <motion.nav 
          className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-40"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
        >
          <motion.div
            className="absolute inset-0 bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-200/50 dark:border-neutral-800/50"
            style={{
              opacity: navBackgroundOpacity
            }}
          />
          
          <MagneticElement>
            <MinimalLink
              href="/"
              className="text-sm hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors relative z-10"
            >
              atanas kyurkchiev
            </MinimalLink>
          </MagneticElement>
          
          <MagneticElement>
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="text-sm border border-neutral-300 dark:border-neutral-700 px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-300 relative z-10 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isGeneratingPdf ? 'generating...' : 'download cv'}</span>
              {!isGeneratingPdf && (
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4 inline-block ml-2"
                  whileHover={{ y: 2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                  />
                </motion.svg>
              )}
              {isGeneratingPdf && (
                <motion.div
                  className="w-4 h-4 border border-current border-t-transparent rounded-full ml-2 inline-block"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              )}
            </button>
          </MagneticElement>
        </motion.nav>
      )}

      <div className={`max-w-4xl mx-auto px-6 md:px-12 ${isPdfMode ? "py-12" : "pt-32 pb-16"}`}>
        <div className={isPdfMode ? "" : "space-y-20"}>
          {/* Enhanced header */}
          <motion.header 
            className="space-y-6 relative"
            style={{ y: headerY, opacity: headerOpacity }}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.33, 1, 0.68, 1] }}
            >
              <AnimatedText
                className="text-4xl md:text-5xl font-light mb-4"
                type="chars"
                animationType="slide"
                direction="up"
                stagger={0.03}
              >
                atanas kyurkchiev
              </AnimatedText>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl">
                software developer focused on creating intuitive and efficient applications that solve real problems
              </p>
            </motion.div>
            
            <motion.div
              className="flex flex-wrap gap-6 text-sm text-neutral-500 dark:text-neutral-400"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={staggerItem}>
                <MagneticElement strength={0.2}>
                  <a
                    href="mailto:me@atanaskyurkchiev.info"
                    className="inline-flex items-center gap-2 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors group"
                    onClick={playClick}
                  >
                    <motion.svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                      whileHover={{ scale: 1.2 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                      />
                    </motion.svg>
                    me@atanaskyurkchiev.info
                  </a>
                </MagneticElement>
              </motion.div>
              
              <motion.div variants={staggerItem} className="flex items-center">
                <span className="w-1 h-1 bg-neutral-400 rounded-full"></span>
              </motion.div>
              
              <motion.div variants={staggerItem}>
                <MagneticElement strength={0.2}>
                  <a
                    href="https://github.com/nnasko"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors group"
                    onClick={playClick}
                  >
                    <motion.svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      className="w-4 h-4"
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </motion.svg>
                    github.com/nnasko
                  </a>
                </MagneticElement>
              </motion.div>
            </motion.div>
          </motion.header>

          {/* Enhanced experience section */}
          <AnimatedSection delay={0.1}>
            <AnimatedText
              className="text-xl mb-8 uppercase tracking-wider"
              type="words"
              animationType="slide"
              direction="up"
            >
              experience
            </AnimatedText>
            
            <motion.div 
              className="space-y-12"
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <motion.div 
                variants={staggerItem}
                className="relative group"
                whileHover={{ x: 10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute left-0 top-0 bottom-0 w-px bg-neutral-200 dark:bg-neutral-800 group-hover:bg-neutral-400 dark:group-hover:bg-neutral-600 transition-colors"></div>
                <div className="pl-8">
                  <h3 className="text-lg mb-2 font-medium">developer lead @ surplush</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">2024 - present</p>
                  <motion.ul 
                    className="space-y-3 text-sm"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                  >
                    {[
                      "leading development of a sustainable business supplies platform",
                      "implementing complex inventory and order management systems",
                      "integrating multiple third-party services (stripe, klaviyo, zedify)",
                      "optimizing performance and user experience"
                    ].map((item, index) => (
                      <motion.li 
                        key={index}
                        variants={staggerItem}
                        className="flex items-start gap-3"
                      >
                        <span className="w-1 h-1 bg-neutral-400 rounded-full mt-2 flex-shrink-0"></span>
                        {item}
                      </motion.li>
                    ))}
                  </motion.ul>
                </div>
              </motion.div>

              <motion.div 
                variants={staggerItem}
                className="relative group"
                whileHover={{ x: 10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute left-0 top-0 bottom-0 w-px bg-neutral-200 dark:bg-neutral-800 group-hover:bg-neutral-400 dark:group-hover:bg-neutral-600 transition-colors"></div>
                <div className="pl-8">
                  <h3 className="text-lg mb-2 font-medium">founder @ kronos clothing</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">2024 - present</p>
                  <motion.ul 
                    className="space-y-3 text-sm"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                  >
                    {[
                      "developed and launched a custom e-commerce platform",
                      "implemented secure payment processing and inventory management",
                      "created automated email marketing systems",
                      "managed all technical aspects of the business"
                    ].map((item, index) => (
                      <motion.li 
                        key={index}
                        variants={staggerItem}
                        className="flex items-start gap-3"
                      >
                        <span className="w-1 h-1 bg-neutral-400 rounded-full mt-2 flex-shrink-0"></span>
                        {item}
                      </motion.li>
                    ))}
                  </motion.ul>
                </div>
              </motion.div>
            </motion.div>
          </AnimatedSection>

          {/* Enhanced education section */}
          <AnimatedSection delay={0.2}>
            <AnimatedText
              className="text-xl mb-8 uppercase tracking-wider"
              type="words"
              animationType="slide"
              direction="up"
            >
              education
            </AnimatedText>
            
            <motion.div 
              className="relative group"
              whileHover={{ x: 10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-px bg-neutral-200 dark:bg-neutral-800 group-hover:bg-neutral-400 dark:group-hover:bg-neutral-600 transition-colors"></div>
              <div className="pl-8">
                <h3 className="text-lg mb-2 font-medium">software development @ access creative college</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">2023 - 2025</p>
                <motion.ul 
                  className="space-y-3 text-sm"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                >
                  {[
                    "full-stack web development",
                    "software engineering principles",
                    "agile methodologies",
                    "database design and management"
                  ].map((item, index) => (
                    <motion.li 
                      key={index}
                      variants={staggerItem}
                      className="flex items-start gap-3"
                    >
                      <span className="w-1 h-1 bg-neutral-400 rounded-full mt-2 flex-shrink-0"></span>
                      {item}
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
            </motion.div>
          </AnimatedSection>

          {/* Enhanced skills section */}
          <AnimatedSection delay={0.3}>
            <AnimatedText
              className="text-xl mb-8 uppercase tracking-wider"
              type="words"
              animationType="slide"
              direction="up"
            >
              technical skills
            </AnimatedText>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {Object.entries(skills).map(([category, skillList], categoryIndex) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    delay: categoryIndex * 0.1,
                    duration: 0.6,
                    ease: [0.33, 1, 0.68, 1]
                  }}
                >
                  <h3 className="text-neutral-500 dark:text-neutral-400 mb-4 text-sm uppercase tracking-wider">
                    {category}
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {skillList.map((skill, index) => (
                      <SkillBadge 
                        key={skill} 
                        skill={skill} 
                        index={index}
                        delay={categoryIndex * 0.1}
                      />
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </main>
  );
}
