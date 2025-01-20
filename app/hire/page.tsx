"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { MinimalLink } from "../components/MinimalLink";
import { RevealText } from "../components/RevealText";
import { SectionTransition } from "../components/SectionTransition";
import { useSound } from "../components/SoundProvider";

const steps = [
  {
    title: "discovery",
    description:
      "we'll discuss your project requirements, goals, and vision to ensure we're aligned on the desired outcome.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
      </svg>
    ),
  },
  {
    title: "planning",
    description:
      "together, we'll create a detailed project plan including timelines, milestones, and deliverables.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
        />
      </svg>
    ),
  },
  {
    title: "development",
    description:
      "i'll bring your vision to life with clean, efficient code and regular updates on progress.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
        />
      </svg>
    ),
  },
  {
    title: "delivery",
    description:
      "after thorough testing and your approval, we'll launch your project and ensure everything runs smoothly.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
        />
      </svg>
    ),
  },
];

export default function HirePage() {
  const { playClick } = useSound();
  const formRef = useRef<HTMLFormElement>(null);
  const processRef = useRef<HTMLDivElement>(null);

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-sm z-50">
        <MinimalLink
          href="/"
          className="text-sm hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
        >
          atanas kyurkchiev
        </MinimalLink>
        <MinimalLink
          href="/#work"
          className="text-sm hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
        >
          back to work
        </MinimalLink>
      </nav>

      {/* Hero Section */}
      <SectionTransition>
        <section className="relative min-h-screen flex items-center px-6 md:px-12">
          <div className="max-w-3xl">
            <RevealText>
              <h1 className="text-2xl sm:text-3xl mb-6">
                let&apos;s work together to bring your vision to life
              </h1>
            </RevealText>
            <RevealText>
              <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
                i specialize in creating modern, efficient, and user-friendly
                applications that solve real problems
              </p>
            </RevealText>
            <RevealText>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    formRef.current?.scrollIntoView({ behavior: "smooth" });
                    playClick();
                  }}
                  className="text-sm border border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 px-6 py-3 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  start a project
                </button>
                <button
                  onClick={() => {
                    processRef.current?.scrollIntoView({ behavior: "smooth" });
                    playClick();
                  }}
                  className="text-sm border border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 px-6 py-3 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  what&apos;s the process?
                </button>
              </div>
            </RevealText>
          </div>
        </section>
      </SectionTransition>

      {/* Process Section */}
      <SectionTransition>
        <section
          ref={processRef}
          className="min-h-screen flex flex-col justify-center px-6 md:px-12 py-24"
        >
          <div className="max-w-5xl mx-auto w-full">
            <RevealText>
              <h2 className="text-2xl sm:text-3xl mb-16 text-center">the process</h2>
            </RevealText>

            <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
              {steps.map((step, index) => (
                <RevealText key={step.title}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="group relative p-2 border border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-800/50 backdrop-blur-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <div className="w-8 h-8 bg-neutral-50 dark:bg-neutral-900 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-sm mb-2">
                      {index + 1}
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-2 bg-neutral-50 dark:bg-neutral-900 rounded-full">
                        {step.icon}
                      </div>
                      <h3 className="text-base sm:text-lg font-light">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {step.description}
                    </p>
                  </motion.div>
                </RevealText>
              ))}
            </div>
          </div>
        </section>
      </SectionTransition>

      {/* Contact Form Section */}
      <SectionTransition>
        <section
          ref={formRef}
          className="min-h-screen flex items-center px-6 md:px-12 py-24"
        >
          <div className="max-w-2xl w-full mx-auto">
            <RevealText>
              <h2 className="text-xl sm:text-2xl mb-12">ready to start your project?</h2>
            </RevealText>
            <form
              action="/api/contact"
              method="POST"
              className="space-y-6 sm:space-y-8"
            >
              <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
                <RevealText>
                  <div>
                    <label htmlFor="name" className="block text-sm mb-2">
                      name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full p-3 border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors md:cursor-none"
                    />
                  </div>
                </RevealText>

                <RevealText>
                  <div>
                    <label htmlFor="email" className="block text-sm mb-2">
                      email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full p-3 border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors md:cursor-none"
                    />
                  </div>
                </RevealText>
              </div>

              <RevealText>
                <div>
                  <label htmlFor="company" className="block text-sm mb-2">
                    company / organization (optional)
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    className="w-full p-3 border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors md:cursor-none"
                  />
                </div>
              </RevealText>

              <RevealText>
                <div>
                  <label htmlFor="project_type" className="block text-sm mb-2">
                    what type of project are you looking to build?
                  </label>
                  <select
                    id="project_type"
                    name="project_type"
                    required
                    className="w-full p-3 border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors appearance-none md:cursor-none"
                  >
                    <option value="">select a project type</option>
                    <option value="fullstack_app">full-stack web application</option>
                    <option value="ecommerce_custom">custom e-commerce platform</option>
                    <option value="saas">saas / subscription platform</option>
                    <option value="admin_dashboard">admin dashboard / cms</option>
                    <option value="api_development">api development / integration</option>
                    <option value="portfolio">portfolio / personal website</option>
                    <option value="business_website">business website / landing page</option>
                    <option value="web_app_mvp">web app mvp / prototype</option>
                    <option value="performance_optimization">performance optimization</option>
                    <option value="custom_development">custom development</option>
                  </select>
                </div>
              </RevealText>

              <RevealText>
                <div>
                  <label htmlFor="timeline" className="block text-sm mb-2">
                    what&apos;s your ideal timeline?
                  </label>
                  <select
                    id="timeline"
                    name="timeline"
                    required
                    className="w-full p-3 border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors appearance-none md:cursor-none"
                  >
                    <option value="">select a timeline</option>
                    <option value="1_month">within 1 month</option>
                    <option value="3_months">1-3 months</option>
                    <option value="6_months">3-6 months</option>
                    <option value="flexible">flexible</option>
                  </select>
                </div>
              </RevealText>

              <RevealText>
                <div>
                  <label htmlFor="budget" className="block text-sm mb-2">
                    what&apos;s your budget range?
                  </label>
                  <select
                    id="budget"
                    name="budget"
                    required
                    className="w-full p-3 border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors appearance-none md:cursor-none"
                  >
                    <option value="">select a budget range</option>
                    <option value="5k_10k">£500 - £1000</option>
                    <option value="1k_2k">£1000 - £2000</option>
                    <option value="2k_5k">£2000 - £5000</option>
                    <option value="5k_plus">£5000+</option>
                  </select>
                </div>
              </RevealText>

              <RevealText>
                <div>
                  <label htmlFor="message" className="block text-sm mb-2">
                    tell me about your project vision and goals
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    placeholder="What problem are you trying to solve? What features are most important to you? Any specific technologies or requirements?"
                    className="w-full p-3 border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors resize-none md:cursor-none"
                  ></textarea>
                </div>
              </RevealText>

              <RevealText>
                <button
                  type="submit"
                  className="w-full p-3 border border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-sm"
                >
                  send message
                </button>
              </RevealText>
            </form>
          </div>
        </section>
      </SectionTransition>
    </main>
  );
} 