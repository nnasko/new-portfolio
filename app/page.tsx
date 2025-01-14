"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useMediaQuery } from "./hooks/useMediaQuery";
import { StyleExplanation } from "./components/StyleExplanation";
import { RevealText } from "./components/RevealText";
import { ProjectCard } from "./components/ProjectCard";
import { MinimalLink } from "./components/MinimalLink";
import { useSound } from "./components/SoundProvider";

const projects = [
  {
    title: "surplush",
    description:
      "a platform for businesses to get essential supplies cheaper & the eco-friendly way",
    image: "/surplush/main.png",
    mobileImage: "/surplush/mobile-main.png",
    link: "/work/surplush",
  },
  {
    title: "kronos clothing",
    description: "my custom-built store for my clothing brand",
    image: "/kronos/main.png",
    mobileImage: "/kronos/mobile-main.png",
    link: "/work/kronos",
  },
  {
    title: "jacked fitness",
    description:
      "a place for people to find out more about jack and his abilities as a personal trainer",
    image: "/jacked/main.png",
    mobileImage: "/jacked/mobile-main.png",
    link: "/work/jacked",
  },
];

export default function Home() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { playClick } = useSound();

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* minimal navigation */}
      <nav className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-sm z-50">
        <MinimalLink
          href="#top"
          className="text-sm hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
        >
          atanas kyurkchiev
        </MinimalLink>
        <div className="space-x-6 text-sm">
          <MinimalLink
            href="#work"
            className="hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
          >
            work
          </MinimalLink>
          <MinimalLink
            href="#about"
            className="hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
          >
            about
          </MinimalLink>
          <MinimalLink
            href="#contact"
            className="hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
          >
            contact
          </MinimalLink>
        </div>
      </nav>

      {/* hero */}
      <section
        id="top"
        className="min-h-screen flex items-center px-6 md:px-12"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <RevealText>
            <h1 className="text-2xl mb-6">
              hi, i&apos;m atanas{" "}
              <span className="relative inline-flex items-center gap-2">
                — <StyleExplanation />
              </span>{" "}
              a software developer focused on creating full-stack, user-friendly
              applications
            </h1>
          </RevealText>
          <RevealText>
            <div className="flex gap-6 text-sm">
              <Link
                href="/cv"
                className="border border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 px-4 py-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                onClick={playClick}
              >
                view cv
              </Link>
              <Link
                href="#work"
                className="border border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 px-4 py-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                onClick={playClick}
              >
                see my work
              </Link>
            </div>
          </RevealText>
        </motion.div>
      </section>

      {/* work */}
      <motion.section
        id="work"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="min-h-screen py-24 px-6 md:px-12"
      >
        <RevealText>
          <h2 className="text-sm mb-12">selected work</h2>
        </RevealText>
        <div className="grid gap-12">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.title}
              title={project.title}
              description={project.description}
              image={isMobile ? project.mobileImage : project.image}
              link={project.link}
              priority={index === 0}
            />
          ))}
        </div>
      </motion.section>

      {/* about */}
      <motion.section
        id="about"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="min-h-screen py-24 px-6 md:px-12"
      >
        <div className="max-w-4xl grid md:grid-cols-[1fr,1.5fr] gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative aspect-[4/5]"
          >
            <Image
              src="/me.jpg"
              alt="atanas kyurkchiev"
              fill
              sizes="(max-width: 768px) 100vw, 80vw"
              quality={90}
              className="object-cover grayscale hover:grayscale-0 transition-all"
              priority
            />
          </motion.div>
          <div>
            <RevealText>
              <h2 className="text-sm mb-12">about</h2>
            </RevealText>
            <div className="space-y-6 text-sm">
              <RevealText>
                <p>
                  i&apos;m a software developer with a focus on creating
                  intuitive and efficient applications. my approach combines
                  technical expertise with a deep understanding of user needs.
                </p>
              </RevealText>
              <RevealText>
                <p>education/work:</p>
              </RevealText>
              <ul className="space-y-4 text-neutral-600 dark:text-neutral-400">
                <RevealText>
                  <li>
                    • software development @ access creative college, 2023-2025
                  </li>
                </RevealText>
                <RevealText>
                  <li>• developer lead @ surplush</li>
                </RevealText>
                <RevealText>
                  <li>• founder @ kronos</li>
                </RevealText>
              </ul>
              <RevealText>
                <p>
                  when i&apos;m not coding, you can find me exploring nature,
                  improving my health at the gym or enjoying the company of
                  friends.
                </p>
              </RevealText>
            </div>
          </div>
        </div>
      </motion.section>

      {/* contact */}
      <motion.section
        id="contact"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="min-h-screen py-24 px-6 md:px-12 flex items-center"
      >
        <div className="max-w-2xl">
          <RevealText>
            <h2 className="text-sm mb-12">contact</h2>
          </RevealText>
          <RevealText>
            <p className="text-2xl mb-8">
              interested in working together? let&apos;s have a conversation
            </p>
          </RevealText>
          <div className="space-y-4 text-sm">
            <RevealText>
              <p>
                email:{" "}
                <a
                  href="mailto:me@atanaskyurkchiev.info"
                  className="underline hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
                >
                  me@atanaskyurkchiev.info
                </a>
              </p>
            </RevealText>
            <RevealText>
              <p>
                github:{" "}
                <a
                  href="https://github.com/nnasko"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
                >
                  github.com/nnasko
                </a>
              </p>
            </RevealText>
            <RevealText>
              <p>
                linkedin:{" "}
                <a
                  href="https://www.linkedin.com/in/atanas-kyurkchiev-36a609291/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
                >
                  linkedin.com/in/atanas-kyurkchiev
                </a>
              </p>
            </RevealText>
          </div>
        </div>
      </motion.section>
    </main>
  );
}
