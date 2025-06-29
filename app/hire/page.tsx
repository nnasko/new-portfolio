'use client';

import { useRef, useState, useEffect } from "react";
import { MinimalLink } from "../components/MinimalLink";
import { RevealText } from "../components/RevealText";
import { SectionTransition } from "../components/SectionTransition";
import { AnimatedText } from "../components/AnimatedText";
import { useSound } from "../components/SoundProvider";
import { useToast } from "../components/Toast";
import { motion, AnimatePresence, useTransform, useSpring } from "framer-motion";
import { staggerContainer, staggerItem, useScrollTracker, useMousePosition, useViewportIntersection } from "../../lib/animation-utils";

// Enhanced Magnetic Element with stronger effects
function MagneticElement({ children, strength = 0.4 }: { children: React.ReactNode, strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const mousePosition = useMousePosition();
  const x = useSpring(0, { stiffness: 200, damping: 20 });
  const y = useSpring(0, { stiffness: 200, damping: 20 });

  useEffect(() => {
    if (!ref.current || !isHovered) {
      x.set(0);
      y.set(0);
      return;
    }

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (mousePosition.x - centerX) * strength;
    const deltaY = (mousePosition.y - centerY) * strength;
    
    x.set(deltaX);
    y.set(deltaY);
  }, [mousePosition, isHovered, strength, x, y]);

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}

// Type for process step
interface ProcessStepType {
  title: string;
  description: string;
  icon: React.ReactNode;
}

// Enhanced Process Step Component
function ProcessStep({ step, index, isActive }: { step: ProcessStepType, index: number, isActive: boolean }) {
  const { ref, isIntersecting } = useViewportIntersection({ threshold: 0.3 });
  
  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="group relative"
      initial={{ opacity: 0, y: 60 }}
      animate={{ 
        opacity: isIntersecting ? 1 : 0,
        y: isIntersecting ? 0 : 60 
      }}
      transition={{
        duration: 0.8,
        delay: index * 0.1,
        ease: [0.33, 1, 0.68, 1],
      }}
    >
      <MagneticElement strength={0.3}>
        <div className={`p-8 border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 transition-all duration-500 h-full group-hover:bg-neutral-100 dark:group-hover:bg-neutral-700 ${isActive ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-100 dark:bg-neutral-700' : ''}`}>
          <div className="flex items-center gap-6 mb-6">
            <motion.div
              className={`w-12 h-12 flex items-center justify-center text-sm border-2 transition-all duration-300 ${isActive ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900' : 'border-neutral-400 dark:border-neutral-600'}`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {index + 1}
            </motion.div>
            <h3 className="text-lg font-medium lowercase">
              {step.title}
            </h3>
          </div>
          <div className="mb-6 text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors duration-300">
            {step.icon}
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors duration-300">
            {step.description}
          </p>
        </div>
      </MagneticElement>
    </motion.div>
  );
}

// Enhanced Form Field Component
function FormField({ 
  label, 
  children, 
  error, 
  required = false,
  description 
}: { 
  label: string, 
  children: React.ReactNode, 
  error?: string,
  required?: boolean,
  description?: string 
}) {
  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <label className="block text-sm text-neutral-600 dark:text-neutral-400 lowercase">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {description && (
        <p className="text-xs text-neutral-500 dark:text-neutral-500 lowercase">
          {description}
        </p>
      )}
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-red-500 dark:text-red-400 lowercase"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Enhanced Button Component
function EnhancedButton({ 
  children, 
  variant = 'primary', 
  onClick, 
  disabled = false,
  type = 'button',
  className = ''
}: {
  children: React.ReactNode,
  variant?: 'primary' | 'secondary',
  onClick?: () => void,
  disabled?: boolean,
  type?: 'button' | 'submit',
  className?: string
}) {
  return (
    <MagneticElement strength={0.2}>
      <motion.button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`
          relative overflow-hidden transition-all duration-300 group
          ${variant === 'primary' 
            ? 'border-2 border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 hover:bg-transparent hover:text-neutral-900 dark:hover:bg-transparent dark:hover:text-neutral-100' 
            : 'border border-neutral-300 dark:border-neutral-700 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }
          px-8 py-3 text-sm lowercase
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
          initial={false}
        />
        <span className="relative z-10">{children}</span>
      </motion.button>
    </MagneticElement>
  );
}

// Project process steps
const steps = [
  {
    title: "discovery",
    description:
      "we&apos;ll discuss your project requirements, goals, and vision to ensure we&apos;re aligned on the desired outcome.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-8 h-8"
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
      "together, we&apos;ll create a detailed project plan including timelines, milestones, and deliverables.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-8 h-8"
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
      "i&apos;ll bring your vision to life with clean, efficient code and regular updates on progress.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-8 h-8"
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
      "after thorough testing and your approval, we&apos;ll launch your project and ensure everything runs smoothly.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-8 h-8"
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

// Form steps
const formSteps = [
  {
    title: "project type",
    description: "what kind of project are we cooking up?",
  },
  {
    title: "timeline & budget",
    description: "when do you need this to be ready?",
  },
  {
    title: "contact info",
    description: "how can we reach you?",
  },
];

export default function HirePage() {
  const { playClick } = useSound();
  const { showToast } = useToast();
  const { scrollY, scrollDirection } = useScrollTracker();
  const formRef = useRef<HTMLFormElement>(null);
  const processRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
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

  // Enhanced parallax effects
  const heroY = useTransform(scrollY, [0, 500], [0, -100]);
  const processY = useTransform(scrollY, [500, 1500], [0, -50]);

  // Transform scroll position to header opacity and blur (matching StickyHeader)
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95]);
  const headerScale = useTransform(scrollY, [0, 200], [1, 0.98]);
  const blurValue = useTransform(scrollY, [0, 100], [0, 8]);
  const backgroundOpacity = useTransform(scrollY, [0, 50], [0.8, 1]);

  // Navigation scroll behavior (matching StickyHeader exactly)
  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      const currentScrollY = latest;
      const scrollDifference = Math.abs(currentScrollY - lastScrollY);

      // Show header when scrolling up or at the top
      if (scrollDirection === "up" || currentScrollY < 100) {
        setIsNavVisible(true);
      }
      // Hide header when scrolling down with sufficient velocity
      else if (scrollDirection === "down" && scrollDifference > 10 && currentScrollY > 200) {
        setIsNavVisible(false);
      }

      setLastScrollY(currentScrollY);
    });

    return () => unsubscribe();
  }, [scrollY, scrollDirection, lastScrollY]);

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 0:
        if (!formData.projectType) {
          errors.projectType = 'please select a project type';
        }
        if (formData.projectType === 'other' && !formData.otherProjectType) {
          errors.otherProjectType = 'please specify your project type';
        }
        break;
      case 1:
        if (!formData.timeline) {
          errors.timeline = 'please select a timeline';
        }
        if (!formData.budget) {
          errors.budget = 'please select a budget range';
        }
        if (!formData.message) {
          errors.message = 'please tell us about your project';
        }
        break;
      case 2:
        if (!formData.name) {
          errors.name = 'please enter your name';
        }
        if (!formData.email) {
          errors.email = 'please enter your email';
        }
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
          errors.email = 'please enter a valid email address';
        }
        break;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async () => {
    // Validate all steps
    const allValid = [0, 1, 2].every(step => validateStep(step));
    
    if (!allValid) {
      showToast('please complete all required fields');
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
      setFormErrors({});
    } catch (error) {
      console.error('API Error:', error);
      showToast('Failed to send message. Please try again.');
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      playClick();
      setCurrentStep(prev => Math.min(prev + 1, formSteps.length - 1));
    }
  };

  const prevStep = () => {
    playClick();
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const renderFormStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
          >
            <FormField 
              label="what type of project are you looking to build?" 
              required
              error={formErrors.projectType}
            >
              <motion.select
                value={formData.projectType}
                onChange={(e) => handleInputChange('projectType', e.target.value)}
                className="w-full p-4 border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-all duration-300 appearance-none lowercase"
                whileFocus={{ scale: 1.01 }}
              >
                <option value="" className="lowercase">select a project type</option>
                <option value="personal" className="lowercase">personal website / portfolio</option>
                <option value="business" className="lowercase">business website / landing page</option>
                <option value="ecommerce" className="lowercase">e-commerce store</option>
                <option value="blog" className="lowercase">blog / content site</option>
                <option value="marketplace" className="lowercase">marketplace platform</option>
                <option value="community" className="lowercase">community / social platform</option>
                <option value="other" className="lowercase">other</option>
              </motion.select>
            </FormField>
            
            <AnimatePresence>
              {formData.projectType === 'other' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FormField 
                    label="please specify your project type" 
                    required
                    error={formErrors.otherProjectType}
                  >
                    <motion.input
                      type="text"
                      value={formData.otherProjectType}
                      onChange={(e) => handleInputChange('otherProjectType', e.target.value)}
                      placeholder="describe your project type"
                      className="w-full p-4 border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-all duration-300 lowercase"
                      whileFocus={{ scale: 1.01 }}
                    />
                  </FormField>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      case 1:
        return (
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
          >
            <FormField 
              label="what's your ideal timeline?" 
              required
              error={formErrors.timeline}
            >
              <motion.select
                value={formData.timeline}
                onChange={(e) => handleInputChange('timeline', e.target.value)}
                className="w-full p-4 border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-all duration-300 appearance-none lowercase"
                whileFocus={{ scale: 1.01 }}
              >
                <option value="" className="lowercase">select a timeline</option>
                <option value="1_month" className="lowercase">within 1 month</option>
                <option value="3_months" className="lowercase">1-3 months</option>
                <option value="6_months" className="lowercase">3-6 months</option>
                <option value="flexible" className="lowercase">flexible</option>
              </motion.select>
            </FormField>

            <FormField 
              label="what's your budget range?" 
              required
              error={formErrors.budget}
            >
              <motion.select
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                className="w-full p-4 border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-all duration-300 appearance-none lowercase"
                whileFocus={{ scale: 1.01 }}
              >
                <option value="" className="lowercase">select a budget range</option>
                <option value="500_1k" className="lowercase">£500 - £1,000</option>
                <option value="1k_2k" className="lowercase">£1,000 - £2,000</option>
                <option value="2k_5k" className="lowercase">£2,000 - £5,000</option>
                <option value="5k_plus" className="lowercase">£5,000+</option>
              </motion.select>
            </FormField>

            <FormField 
              label="tell me about your project" 
              required
              description="what features do you need? any specific requirements or ideas?"
              error={formErrors.message}
            >
              <motion.textarea
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                rows={5}
                placeholder="describe your project vision, required features, and any specific ideas you have..."
                className="w-full p-4 border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-all duration-300 resize-none lowercase"
                whileFocus={{ scale: 1.01 }}
              />
            </FormField>
          </motion.div>
        );
      case 2:
        return (
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
          >
            <div className="grid sm:grid-cols-2 gap-8">
              <FormField 
                label="name" 
                required
                error={formErrors.name}
              >
                <motion.input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full p-4 border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-all duration-300 lowercase"
                  whileFocus={{ scale: 1.01 }}
                />
              </FormField>

              <FormField 
                label="email" 
                required
                error={formErrors.email}
              >
                <motion.input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full p-4 border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-all duration-300 lowercase"
                  whileFocus={{ scale: 1.01 }}
                />
              </FormField>
            </div>

            <FormField 
              label="company / organization" 
              description="optional - let me know if this is for a business"
              error={formErrors.company}
            >
              <motion.input
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="w-full p-4 border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-all duration-300 lowercase"
                whileFocus={{ scale: 1.01 }}
              />
            </FormField>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900 relative overflow-hidden">
      {/* Enhanced Navigation */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          opacity: headerOpacity,
          backdropFilter: `blur(${blurValue}px)`,
          scale: headerScale,
        }}
        initial={{ y: 0 }}
        animate={{
          y: isNavVisible ? 0 : -100,
        }}
        transition={{
          duration: 0.3,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      >
        <div className="relative">
          {/* Background with dynamic opacity */}
                      <motion.div
              className="absolute inset-0 bg-neutral-50/80 dark:bg-neutral-900/80 border-b border-neutral-200/50 dark:border-neutral-800/50"
              style={{
                opacity: backgroundOpacity,
              }}
            />

          {/* Content */}
          <div className="relative p-6 flex justify-between items-center">
            <MagneticElement>
              <MinimalLink
                href="/"
                className="text-sm hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors cursor-pointer"
              >
                <div>
                  <div>atanas kyurkchiev</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 font-normal">web developer</div>
                </div>
              </MinimalLink>
            </MagneticElement>
            <MagneticElement>
              <MinimalLink
                href="/#work"
                className="text-sm hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors cursor-pointer"
              >
                back to work
              </MinimalLink>
            </MagneticElement>
          </div>
        </div>
      </motion.nav>

      {/* Enhanced Hero Section */}
      <SectionTransition>
        <motion.section 
          className="relative min-h-screen flex items-center px-6 md:px-12"
          style={{ y: heroY }}
        >
          <div className="max-w-5xl relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.33, 1, 0.68, 1] }}
            >
              <AnimatedText
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-8 leading-tight font-light"
                type="words"
                animationType="slide"
                direction="up"
                stagger={0.08}
              >
                let&apos;s work together to bring your vision to life
              </AnimatedText>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.33, 1, 0.68, 1] }}
            >
              <AnimatedText
                className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 mb-12 leading-relaxed max-w-3xl"
                type="words"
                animationType="fade"
                delay={0.6}
                stagger={0.02}
              >
                i specialize in creating modern, efficient, and user-friendly applications that solve real problems and drive meaningful results for your business.
              </AnimatedText>
            </motion.div>
            
            <motion.div
              className="flex flex-col sm:flex-row gap-6"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={staggerItem}>
                <EnhancedButton
                  variant="primary"
                  onClick={() => {
                    formRef.current?.scrollIntoView({ behavior: "smooth" });
                    playClick();
                  }}
                  className="group"
                >
                  <span className="flex items-center gap-3">
                    start a project
                    <motion.svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                      whileHover={{ x: 5, rotate: -15 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </motion.svg>
                  </span>
                </EnhancedButton>
              </motion.div>
              
              <motion.div variants={staggerItem}>
                <EnhancedButton
                  variant="secondary"
                  onClick={() => {
                    processRef.current?.scrollIntoView({ behavior: "smooth" });
                    playClick();
                  }}
                >
                  what&apos;s the process?
                </EnhancedButton>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Background decoration */}
          <motion.div
            className="absolute top-1/2 right-10 w-96 h-96 border border-neutral-300 dark:border-neutral-700 opacity-20"
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          />
        </motion.section>
      </SectionTransition>

      {/* Enhanced Process Section */}
      <SectionTransition>
        <motion.section
          ref={processRef}
          className="min-h-screen flex flex-col justify-center px-6 md:px-12 py-24 relative"
          style={{ y: processY }}
        >
          <div className="max-w-7xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
              className="mb-20"
            >
              <AnimatedText
                className="text-3xl sm:text-4xl md:text-5xl mb-6 font-light"
                type="words"
                animationType="slide"
                direction="up"
                stagger={0.1}
              >
                the process
              </AnimatedText>
              <AnimatedText
                className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl"
                type="words"
                animationType="fade"
                delay={0.3}
                stagger={0.02}
              >
                a collaborative approach focused on understanding your needs and delivering exceptional results.
              </AnimatedText>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <ProcessStep
                  key={`step-${step.title}-${index}`}
                  step={step}
                  index={index}
                  isActive={false}
                />
              ))}
            </div>
          </div>
        </motion.section>
      </SectionTransition>

      {/* Enhanced Contact Form Section */}
      <SectionTransition>
        <section
          ref={formRef}
          className="min-h-screen flex items-center px-6 md:px-12 py-24"
        >
          <div className="max-w-3xl w-full mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
              className="mb-12"
            >
              <RevealText>
                <h2 className="text-2xl sm:text-3xl md:text-4xl mb-6 font-light lowercase">ready to start your project?</h2>
              </RevealText>
              <RevealText>
                <p className="text-lg text-neutral-600 dark:text-neutral-400 lowercase">
                  let&apos;s discuss your vision and make it a reality.
                </p>
              </RevealText>
            </motion.div>

            <motion.div 
              className="border border-neutral-300 dark:border-neutral-700 p-8 bg-neutral-100/50 dark:bg-neutral-800/50 backdrop-blur-sm relative overflow-hidden"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.33, 1, 0.68, 1] }}
            >
              {/* Progress indicator */}
              <div className="flex justify-between mb-12">
                {formSteps.map((step, index) => (
                  <div
                    key={step.title}
                    className={`flex-1 text-center transition-all duration-500 ${
                      index === currentStep
                        ? 'text-neutral-900 dark:text-neutral-100'
                        : 'text-neutral-400 dark:text-neutral-600'
                    }`}
                  >
                    <div className="relative">
                      <motion.div
                        className={`w-10 h-10 mx-auto flex items-center justify-center mb-3 border-2 transition-all duration-500 ${
                          index === currentStep
                            ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100'
                            : index < currentStep
                            ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100'
                            : 'border-neutral-300 dark:border-neutral-700'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {index < currentStep ? (
                          <motion.svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-neutral-50 dark:text-neutral-900"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </motion.svg>
                        ) : (
                          <span className={`text-sm ${index === currentStep ? 'text-neutral-50 dark:text-neutral-900' : ''}`}>
                            {index + 1}
                          </span>
                        )}
                      </motion.div>
                      {index < formSteps.length - 1 && (
                        <motion.div
                          className={`absolute top-5 left-full w-full h-0.5 -translate-y-1/2 transition-all duration-500 ${
                            index < currentStep
                              ? 'bg-neutral-900 dark:bg-neutral-100'
                              : 'bg-neutral-300 dark:bg-neutral-700'
                          }`}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: index < currentStep ? 1 : 0 }}
                          transition={{ duration: 0.5, delay: index < currentStep ? 0.3 : 0 }}
                        />
                      )}
                    </div>
                    <span className="text-sm hidden sm:block lowercase font-medium">{step.title}</span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-500 hidden sm:block lowercase mt-1">{step.description}</span>
                  </div>
                ))}
              </div>

              {/* Form content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
                  className="mb-8"
                >
                  {renderFormStep()}
                </motion.div>
              </AnimatePresence>

              {/* Navigation buttons */}
              <div className="flex justify-between items-center pt-8 border-t border-neutral-200 dark:border-neutral-800">
                <EnhancedButton
                  variant="secondary"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={currentStep === 0 ? 'opacity-0 pointer-events-none' : ''}
                >
                  <span className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                      />
                    </svg>
                    previous
                  </span>
                </EnhancedButton>
                
                {currentStep === formSteps.length - 1 ? (
                  <EnhancedButton
                    variant="primary"
                    onClick={handleFormSubmit}
                  >
                    <span className="flex items-center gap-3">
                      send message
                      <motion.svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                        whileHover={{ x: 5, y: -5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                        />
                      </motion.svg>
                    </span>
                  </EnhancedButton>
                ) : (
                  <EnhancedButton
                    variant="primary"
                    onClick={nextStep}
                  >
                    <span className="flex items-center gap-2">
                      next
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                        />
                      </svg>
                    </span>
                  </EnhancedButton>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      </SectionTransition>
    </main>
  );
} 