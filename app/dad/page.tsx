"use client";

import { motion, useTransform, useScroll } from "framer-motion";
import Image from "next/image";
import { useRef, useEffect, useState } from "react";
import { ParallaxSection } from "../components/ParallaxSection";
import { AnimatedText } from "../components/AnimatedText";
import { RevealText } from "../components/RevealText";
import { SectionTransition } from "../components/SectionTransition";
import { useScrollTracker } from "../../lib/animation-utils";

const ScrollIndicator = () => {
  const { scrollY } = useScrollTracker();
  const opacity = useTransform(scrollY, [0, 100], [1, 0]);

  return (
    <motion.div
      className="absolute left-0 right-0 bottom-12 flex flex-col items-center gap-2 pointer-events-none"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2 }}
      style={{ opacity }}
    >
      <motion.p
        className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400"
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        scroll through the memories
      </motion.p>
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-3 h-3 md:w-4 md:h-4 text-neutral-500 dark:text-neutral-400"
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
        />
      </motion.svg>
    </motion.div>
  );
};

const HeartIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    animate={{ 
      scale: [1, 1.2, 1],
    }}
    transition={{ 
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
  </motion.svg>
);

const FloatingHearts = () => {
  const [hearts, setHearts] = useState<Array<{ id: number; x: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    const generateHearts = () => {
      const newHearts = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 8 + Math.random() * 4,
      }));
      setHearts(newHearts);
    };

    generateHearts();
    const interval = setInterval(generateHearts, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute text-red-400 opacity-20"
          style={{ left: `${heart.x}%` }}
          initial={{ y: "100vh", opacity: 0, scale: 0 }}
          animate={{ 
            y: "-10vh", 
            opacity: [0, 0.3, 0.3, 0],
            scale: [0, 1, 1, 0],
            rotate: [0, 360]
          }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <HeartIcon className="w-4 h-4" />
        </motion.div>
      ))}
    </div>
  );
};



export default function DadBirthdayPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.3]);
  
  const memoryRefs = useRef<(HTMLElement | null)[]>([]);
  const imageRefs = useRef<(HTMLElement | null)[]>([]);

  const memories = [
    {
      title: "The Greatest Dad",
      message: "From the moment I was born, you've been my hero, my guide, and my biggest supporter. Your love has shaped who I am today.",
      image: "/1.jpg",
      side: "left"
    },
    {
      title: "Always There",
      message: "Through every scraped knee, every bad day, every triumph and every setback - you've always been there with a hug, a joke, or just the right words.",
      image: "/2.png",
      side: "right"
    },
    {
      title: "Life Lessons",
      message: "You taught me to be kind, to work hard, to never give up, and to always find the humor in life. These lessons are the greatest gifts you've given me.",
      image: "/3.jpg",
      side: "left"
    },
    {
      title: "My Role Model",
      message: "Your strength, wisdom, and compassion inspire me every day. I hope to be half the person you are.",
      image: "/4.jpeg",
      side: "right"
    },
    {
      title: "Thank You",
      message: "For all the sacrifices you made, all the love you gave, and all the memories we've created together. I am so grateful to be your child.",
      image: "/5.jpeg",
      side: "left"
    }
  ];



  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-orange-50 to-yellow-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
      <FloatingHearts />
      
      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-orange-100/50 to-yellow-100/50 dark:from-orange-900/20 dark:to-yellow-900/20"
          style={{ y: heroY, opacity: heroOpacity }}
        />
        
        <motion.div 
          className="relative z-10 text-center px-6 max-w-4xl mx-auto"
          style={{ y: heroY }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
            className="mb-8"
          >
            <HeartIcon className="w-16 h-16 md:w-24 md:h-24 text-red-500 mx-auto" />
          </motion.div>

          <AnimatedText
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-wide text-neutral-900 dark:text-neutral-100 mb-6"
            type="chars"
            stagger={0.05}
            delay={1}
            animationType="scale"
          >
            Happy Birthday Dad!
          </AnimatedText>

          <RevealText className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-300 mb-8">
            A journey through our memories together
          </RevealText>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5, duration: 0.8 }}
            className="text-lg md:text-xl text-neutral-500 dark:text-neutral-400"
          >
            With all my love ❤️
          </motion.div>
        </motion.div>

        <ScrollIndicator />
      </section>

      {/* Memory Sections */}
      {memories.map((memory, index) => (
        <SectionTransition key={index}>
          <section 
            ref={(el) => {
              if (memoryRefs.current) {
                memoryRefs.current[index] = el;
              }
            }}
            className="min-h-screen flex items-center py-20"
          >
            <div className="container mx-auto px-6">
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
                memory.side === "right" ? "lg:grid-flow-col-dense" : ""
              }`}>
                {/* Text Content */}
                <div style={{ zIndex: 20, position: 'relative' }}>
                  <ParallaxSection
                    speed={0.3}
                    className={`space-y-8 ${memory.side === "right" ? "lg:col-start-2" : ""}`}
                    opacity
                  >
                  <AnimatedText
                    className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-neutral-100"
                    type="words"
                    stagger={0.1}
                    animationType="slide"
                    direction="up"
                  >
                    {memory.title}
                  </AnimatedText>

                  <RevealText className="text-lg md:text-xl leading-relaxed text-neutral-600 dark:text-neutral-300">
                    {memory.message}
                  </RevealText>

                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3 text-red-500"
                  >
                    <HeartIcon className="w-8 h-8" />
                    <span className="text-xl font-medium">Love you, Dad</span>
                  </motion.div>
                </ParallaxSection>
                </div>

                                 {/* Image */}
                <div style={{ zIndex: 20, position: 'relative' }}>
                  <ParallaxSection
                    speed={0.2}
                    direction="down"
                    scale
                    className={`${memory.side === "right" ? "lg:col-start-1 lg:row-start-1" : ""}`}
                  >
                  <div
                    ref={(el) => {
                      console.log(`Setting image ref ${index}:`, el);
                      if (imageRefs.current) {
                        imageRefs.current[index] = el;
                      }
                    }}
                    className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl hover:scale-105 hover:rotate-2 transition-transform duration-300"
                    style={{ zIndex: 20 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-200/50 to-yellow-200/50 dark:from-orange-800/30 dark:to-yellow-800/30 z-10" />
                    <Image
                      src={memory.image}
                      alt={`Memory: ${memory.title}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div
                      className="absolute inset-0 border-4 border-white/50 rounded-2xl opacity-100"
                    />
                  </div>
                </ParallaxSection>
                </div>
              </div>
            </div>
          </section>
        </SectionTransition>
      ))}

      {/* Final Birthday Message */}
      <SectionTransition>
        <section className="min-h-screen flex items-center justify-center py-20">
          <div className="text-center px-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <div className="flex justify-center gap-4 mb-8">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.2, duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <HeartIcon className="w-8 h-8 md:w-12 md:h-12 text-red-500" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <AnimatedText
              className="text-3xl md:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-neutral-100 mb-8"
              type="words"
              stagger={0.15}
              animationType="scale"
            >
              You&apos;re the best dad in the world
            </AnimatedText>

            <RevealText className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-300 mb-12">
              Here&apos;s to another year of amazing memories together!
            </RevealText>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              viewport={{ once: true }}
              className="text-lg md:text-xl text-neutral-500 dark:text-neutral-400 space-y-4"
            >
              <p>Happy Birthday, Dad! 🎉</p>
              <p className="font-medium">With endless love and gratitude,</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Nasko ❤️</p>
            </motion.div>
          </div>
        </section>
      </SectionTransition>
    </div>
  );
} 