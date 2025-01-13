"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useMediaQuery } from "./hooks/useMediaQuery";

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

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* minimal navigation */}
      <nav className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-sm z-50">
        <Link
          href="/"
          className="text-sm hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
        >
          atanas kyurkchiev
        </Link>
        <div className="space-x-6 text-sm">
          <Link
            href="#work"
            className="hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
          >
            work
          </Link>
          <Link
            href="#about"
            className="hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
          >
            about
          </Link>
          <Link
            href="#contact"
            className="hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
          >
            contact
          </Link>
        </div>
      </nav>

      {/* hero */}
      <section className="min-h-screen flex items-center px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <h1 className="text-2xl mb-6">
            hi, i&apos;m atanas — a software developer focused on creating
            full-stack, user-friendly applications
          </h1>
          <div className="flex gap-6 text-sm">
            <Link
              href="/cv"
              className="border border-neutral-300 dark:border-neutral-700 px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              view cv
            </Link>
            <Link
              href="#work"
              className="border border-neutral-300 dark:border-neutral-700 px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              see my work
            </Link>
          </div>
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
        <h2 className="text-sm mb-12">selected work</h2>
        <div className="grid gap-12">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <Link href={project.link} className="block">
                <div
                  className={`relative ${
                    isMobile ? "h-[85vh]" : "h-[70vh]"
                  } mb-4 bg-neutral-100 dark:bg-neutral-800`}
                >
                  <Image
                    src={isMobile ? project.mobileImage : project.image}
                    alt={project.title}
                    fill
                    className="object-contain grayscale hover:grayscale-0 opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                <h3 className="text-sm mb-2">{project.title}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {project.description}
                </p>
              </Link>
            </motion.div>
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
        className="min-h-screen py-24 px-6 md:px-12 bg-neutral-100 dark:bg-neutral-800"
      >
        <div className="max-w-4xl grid md:grid-cols-[1fr,1.5fr] gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative aspect-[4/5] bg-neutral-200 dark:bg-neutral-700"
          >
            <Image
              src="/me.jpg"
              alt="atanas kyurkchiev"
              fill
              className="object-cover grayscale"
              priority
            />
          </motion.div>
          <div>
            <h2 className="text-sm mb-12">about</h2>
            <div className="space-y-6 text-sm">
              <p>
                i&apos;m a software developer with a focus on creating intuitive
                and efficient applications. my approach combines technical
                expertise with a deep understanding of user needs.
              </p>
              <p>education/work:</p>
              <ul className="space-y-4 text-neutral-600 dark:text-neutral-400">
                <li>
                  • software development @ access creative college, 2023-2025
                </li>
                <li>• developer lead @ surplush</li>
                <li>• founder @ kronos</li>
              </ul>
              <p>
                when i&apos;m not coding, you can find me exploring nature,
                improving my health at the gym or enjoying the company of
                friends.
              </p>
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
          <h2 className="text-sm mb-12">contact</h2>
          <p className="text-2xl mb-8">
            interested in working together? let&apos;s have a conversation
          </p>
          <div className="space-y-4 text-sm">
            <p>
              email:{" "}
              <a
                href="mailto:me@atanaskyurkchiev.info"
                className="underline hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
              >
                me@atanaskyurkchiev.info
              </a>
            </p>
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
          </div>
        </div>
      </motion.section>
    </main>
  );
}
