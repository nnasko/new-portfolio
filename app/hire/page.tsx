'use client';

import { useRef, useState } from "react";
import { MinimalLink } from "../components/MinimalLink";
import { RevealText } from "../components/RevealText";
import { SectionTransition } from "../components/SectionTransition";
import { useSound } from "../components/SoundProvider";
import { useToast } from "../components/Toast";
import { motion, AnimatePresence } from "framer-motion";

// no cap, these steps be fire
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

// fr fr these form steps be lit
const formSteps = [
  {
    title: "project type",
    description: "what kind of project are we cooking up?",
  },
  {
    title: "timeline & budget",
    description: "when do you need this to be bussin?",
  },
  {
    title: "contact info",
    description: "how can we reach you fam?",
  },
];

export default function HirePage() {
  const { playClick } = useSound();
  const { showToast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const processRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    projectType: '',
    timeline: '',
    budget: '',
    name: '',
    email: '',
    company: '',
    message: '',
    otherProjectType: '',
  });

  const handleFormSubmit = async () => {
    // validate all required fields first
    if (!formData.projectType) {
      showToast('Please select a project type');
      setCurrentStep(0);
      return;
    }

    if (formData.projectType === 'other' && !formData.otherProjectType) {
      showToast('Please specify your project type');
      setCurrentStep(0);
      return;
    }

    if (!formData.timeline) {
      showToast('Please select a timeline');
      setCurrentStep(1);
      return;
    }

    if (!formData.budget) {
      showToast('Please select a budget range');
      setCurrentStep(1);
      return;
    }

    if (!formData.message) {
      showToast('Please tell us about your project');
      setCurrentStep(1);
      return;
    }

    if (!formData.name) {
      showToast('Please enter your name');
      setCurrentStep(2);
      return;
    }

    if (!formData.email) {
      showToast('Please enter your email');
      setCurrentStep(2);
      return;
    }

    try {
      console.log('Sending form data:', formData);
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      console.log('API Response:', result);
      
      if (!response.ok) {
        showToast(result.error || 'Failed to send message. Please try again.');
        return;
      }

      showToast(result.message);
      setFormData({
        projectType: '',
        timeline: '',
        budget: '',
        name: '',
        email: '',
        company: '',
        message: '',
        otherProjectType: '',
      });
      setCurrentStep(0);
    } catch (error) {
      console.error('API Error:', error);
      showToast('Failed to send message. Please try again.');
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const nextStep = () => {
    playClick();
    setCurrentStep(prev => Math.min(prev + 1, formSteps.length - 1));
  };

  const prevStep = () => {
    playClick();
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const renderFormStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <label className="block text-sm mb-2">
              what type of project are you looking to build?
            </label>
            <select
              value={formData.projectType}
              onChange={(e) => setFormData(prev => ({ ...prev, projectType: e.target.value }))}
              required
              className="w-full p-3 border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors appearance-none"
            >
              <option value="">select a project type</option>
              <option value="personal">personal website / portfolio</option>
              <option value="business">business website / landing page</option>
              <option value="ecommerce">e-commerce store</option>
              <option value="blog">blog / content site</option>
              <option value="marketplace">marketplace platform</option>
              <option value="community">community / social platform</option>
              <option value="other">other</option>
            </select>
            
            {formData.projectType === 'other' && (
              <div className="mt-4">
                <label className="block text-sm mb-2">
                  please specify your project type
                </label>
                <input
                  type="text"
                  value={formData.otherProjectType || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, otherProjectType: e.target.value }))}
                  required
                  placeholder="describe your project type"
                  className="w-full p-3 border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors"
                />
              </div>
            )}
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm mb-2">
                what&apos;s your ideal timeline?
              </label>
              <select
                value={formData.timeline}
                onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                required
                className="w-full p-3 border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors appearance-none"
              >
                <option value="">select a timeline</option>
                <option value="1_month">within 1 month</option>
                <option value="3_months">1-3 months</option>
                <option value="6_months">3-6 months</option>
                <option value="flexible">flexible</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-2">
                what&apos;s your budget range?
              </label>
              <select
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                required
                className="w-full p-3 border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors appearance-none"
              >
                <option value="">select a budget range</option>
                <option value="500_1k">£500 - £1,000</option>
                <option value="1k_2k">£1,000 - £2,000</option>
                <option value="2k_5k">£2,000 - £5,000</option>
                <option value="5k_plus">£5,000+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-2">
                tell me about your project
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                required
                rows={4}
                placeholder="What features do you need? Any specific requirements or ideas?"
                className="w-full p-3 border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors resize-none"
              ></textarea>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm mb-2">
                  name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full p-3 border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm mb-2">
                  email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="w-full p-3 border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="company" className="block text-sm mb-2">
                company / organization (optional)
              </label>
              <input
                type="text"
                id="company"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                className="w-full p-3 border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-sm z-50">
        <MinimalLink
          href="/"
          className="text-sm hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors cursor-pointer"
        >
          atanas kyurkchiev
        </MinimalLink>
        <MinimalLink
          href="/#work"
          className="text-sm hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors cursor-pointer"
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
                  className="text-sm border border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 px-6 py-3 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                >
                  start a project
                </button>
                <button
                  onClick={() => {
                    processRef.current?.scrollIntoView({ behavior: "smooth" });
                    playClick();
                  }}
                  className="text-sm border border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 px-6 py-3 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
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
                <RevealText key={`step-${step.title}-${index}`}>
                  <div
                    className="group relative p-2 border border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-800/50 backdrop-blur-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <div className="w-8 h-8 bg-neutral-50 dark:bg-neutral-900 rounded-none border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-sm mb-2">
                      {index + 1}
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-2 bg-neutral-50 dark:bg-neutral-900 rounded-none">
                        {step.icon}
                      </div>
                      <h3 className="text-base sm:text-lg font-light">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
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

            <div className="mb-8">
              <div className="flex justify-between mb-8">
                {formSteps.map((step, index) => (
                  <div
                    key={step.title}
                    className={`flex-1 text-center ${
                      index === currentStep
                        ? 'text-neutral-900 dark:text-neutral-100'
                        : 'text-neutral-400 dark:text-neutral-600'
                    }`}
                  >
                    <div className="relative">
                      <div
                        className={`w-8 h-8 mx-auto rounded-none border-2 flex items-center justify-center mb-2 ${
                          index === currentStep
                            ? 'border-neutral-900 dark:border-neutral-100'
                            : index < currentStep
                            ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100'
                            : 'border-neutral-300 dark:border-neutral-700'
                        }`}
                      >
                        {index < currentStep ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-neutral-900 dark:text-neutral-900"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <span className={index < currentStep ? 'text-neutral-900 dark:text-neutral-900' : ''}>
                            {index + 1}
                          </span>
                        )}
                      </div>
                      {index < formSteps.length - 1 && (
                        <div
                          className={`absolute top-4 left-full w-full h-0.5 -translate-y-1/2 ${
                            index < currentStep
                              ? 'bg-neutral-900 dark:bg-neutral-100'
                              : 'bg-neutral-300 dark:bg-neutral-700'
                          }`}
                        ></div>
                      )}
                    </div>
                    <span className="text-sm hidden sm:block">{step.title}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderFormStep()}
                  </motion.div>
                </AnimatePresence>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className={`px-6 py-2 border border-neutral-300 dark:border-neutral-700 rounded cursor-pointer ${
                      currentStep === 0
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                    disabled={currentStep === 0}
                  >
                    previous
                  </button>
                  
                  {currentStep === formSteps.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleFormSubmit}
                      className="px-6 py-2 bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 rounded hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
                    >
                      submit
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-6 py-2 bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 rounded hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
                    >
                      next
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </section>
      </SectionTransition>
    </main>
  );
} 