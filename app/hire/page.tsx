'use client';

import { useRef, useState, useEffect, lazy, Suspense, useMemo, useCallback } from "react";
import Link from "next/link";
import { AnimatedText } from "../components/AnimatedText";
import { useSound } from "../components/SoundAndRainProvider";
import { useToast } from "../components/Toast";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const ThreeShowcase = dynamic(() => import("../components/ThreeShowcase"), { ssr: false });

// Lazy load non-critical components
const SectionTransition = lazy(() => import("../components/SectionTransition").then(module => ({ default: module.SectionTransition })));

const ScrollProgress = lazy(() => import("../components/ScrollProgress").then(module => ({ default: module.ScrollProgress })));

// Lightweight loading fallback
function ComponentLoader() {
  return <div className="h-1 w-full bg-transparent" />;
}

// Pricing configuration
const PRICING_CONFIG = {
  basePackages: {
    personal: { min: 300, max: 600, name: "personal website" },
    business: { min: 500, max: 800, name: "business website" },
    ecommerce: { min: 800, max: 1500, name: "e-commerce platform" },
    saas: { min: 1500, max: 3000, name: "custom web application" },
    enterprise: { min: 3000, max: 8000, name: "enterprise solution" }
  },
  // Features included in each tier
  includedFeatures: {
    personal: [
      "responsive website design",
      "up to 4 pages", 
      "contact forms",
      "basic seo setup",
      "mobile-first approach",
      "photo galleries",
      "social media links"
    ],
    business: [
      "responsive website design",
      "up to 6 pages",
      "advanced contact forms", 
      "seo optimization setup",
      "google analytics integration",
      "mobile-first approach",
      "photo galleries",
      "social media links",
      "content management system",
      "basic performance optimization"
    ],
    ecommerce: [
      "responsive website design",
      "up to 6 pages",
      "advanced contact forms",
      "seo optimization setup", 
      "google analytics integration",
      "mobile-first approach",
      "photo galleries",
      "social media links",
      "content management system",
      "basic performance optimization",
      "product catalog & management",
      "secure payment processing",
      "inventory tracking system",
      "customer account system",
      "order management dashboard",
      "email notifications",
      "advanced seo optimization"
    ],
    saas: [
      "responsive website design",
      "unlimited pages",
      "advanced contact forms",
      "seo optimization setup",
      "google analytics integration", 
      "mobile-first approach",
      "photo galleries",
      "social media links",
      "content management system",
      "basic performance optimization",
      "product catalog & management",
      "secure payment processing", 
      "inventory tracking system",
      "customer account system",
      "order management dashboard",
      "email notifications",
      "advanced seo optimization",
      "custom user authentication",
      "admin dashboard & analytics",
      "api development & integrations",
      "database design & optimization",
      "third-party service integrations",
      "advanced features & automation"
    ],
    enterprise: [
      "completely custom solution",
      "unlimited everything",
      "dedicated project manager",
      "24/7 priority support",
      "unlimited revisions"
    ]
  },
  features: {
    // Content & Management
    blog: { 
      price: 100, 
      name: "blog/news section", 
      description: "share updates, articles, and company news with your audience",
      category: "Content & Management"
    },
    
    // Business Features
    booking: { 
      price: 300, 
      name: "online appointment booking", 
      description: "let customers book appointments or services directly from your website",
      category: "Business Features"
    },
    
    // Customer Experience
    liveChat: { 
      price: 150, 
      name: "live chat support", 
      description: "chat with visitors in real-time to answer questions and close sales",
      category: "Customer Experience"
    },
    multiLanguage: { 
      price: 350, 
      name: "multiple languages", 
      description: "serve customers in different languages with automatic translation",
      category: "Customer Experience"
    },
    
    // Advanced Integrations
    thirdParty: { 
      price: 250, 
      name: "connect with your tools", 
      description: "integrate with accounting software, CRM, email marketing tools, etc.",
      category: "Advanced Integrations"
    },
    automation: { 
      price: 300, 
      name: "workflow automation", 
      description: "automate repetitive tasks like sending emails, updating spreadsheets",
      category: "Advanced Integrations"
    }
  },
  additionalServices: {
    maintenance: {
      price: "dynamic", // Will be calculated based on package
      name: "ongoing maintenance",
      description: "regular updates, security patches, and technical support"
    }
  },
  // Maintenance pricing based on package
  maintenancePricing: {
    personal: 50,
    business: 100,
    ecommerce: 150,
    saas: 200,
    enterprise: 300
  },
  timeline: {
    rush: 1.3, // +30% for rush delivery
    normal: 1,
    flexible: 0.9 // -10% for flexible timeline
  },
  maintenance: {
    basic: 200,
    standard: 400,
    premium: 800
  }
};

// Enhanced Form Field Component with memoization
const FormField = ({ 
  label, 
  children, 
  error, 
  required = false,
  description,
  className = ""
}: { 
  label: string | React.ReactNode, 
  children: React.ReactNode, 
  error?: string,
  required?: boolean,
  description?: string,
  className?: string
}) => {
  return (
    <motion.div
      className={`space-y-2 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {typeof label === 'string' ? (
          <>
            {label}{required && <span className="text-red-500 ml-1">*</span>}
          </>
        ) : (
          <div className="flex items-center gap-1">
            {label}{required && <span className="text-red-500 ml-1">*</span>}
          </div>
        )}
      </label>
      {description && (
        <p className="text-xs text-neutral-500 dark:text-neutral-500">
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
            className="text-xs text-red-500 dark:text-red-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Memoized Feature toggle component
const FeatureToggle = ({ 
  feature, 
  description,
  selected, 
  onToggle, 
  price 
}: { 
  feature: string,
  description: string,
  selected: boolean, 
  onToggle: () => void, 
  price: number 
}) => {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      className={`p-4 border rounded-md text-left transition-all duration-300 ${
        selected 
          ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-100 dark:bg-neutral-800' 
          : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
            selected 
              ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100' 
              : 'border-neutral-300 dark:border-neutral-700'
          }`}>
            {selected && (
              <svg className="w-2 h-2 text-neutral-50 dark:text-neutral-900" fill="currentColor" viewBox="0 0 8 8">
                <path d="M6.564.75L3.59 3.724 1.436 1.57.75 2.256l2.842 2.84L7.25 1.436z"/>
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium mb-1">{feature}</div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">{description}</div>
          </div>
        </div>
        <div className="flex-shrink-0">
          <span className="text-sm font-bold">+£{price}</span>
        </div>
      </div>
    </motion.button>
  );
};

// Memoized pricing estimate component
const PricingEstimate = ({ estimate, breakdown }: { 
  estimate: { min: number, max: number }, 
  breakdown: Array<{ item: string, price: number | string }> 
}) => {
  return (
    <motion.div
      className="sticky top-8 p-6 border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 rounded-md"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold">project estimate</h3>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      </div>
      
      {breakdown.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-2xl mb-2">💭</div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            select your project type to see a detailed estimate
          </p>
          <div className="text-xl font-bold">£300 - £8,000+</div>
          <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-2">
            typical project range
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-4">
            {breakdown.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">{item.item}</span>
                <span className="font-medium">{typeof item.price === 'number' ? `£${item.price}` : item.price}</span>
              </div>
            ))}
          </div>
          
          <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">estimated total:</span>
              <span className="text-xl font-bold">£{estimate.min.toLocaleString()} - £{estimate.max.toLocaleString()}</span>
            </div>
          </div>
        </>
      )}
      
      <div className="mt-4 p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded border">
        <div className="flex items-start gap-2">
          <div className="text-blue-500 mt-0.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              <strong>What&apos;s included:</strong> All estimates include responsive design, contact forms, photo galleries, basic SEO, social media links, visitor analytics, SSL security, and 30 days of support after launch.
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-2">
              Final price confirmed after project discussion
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Form steps with better organization
const formSteps = [
  {
    title: "project basics",
    description: "tell us about your project type and goals",
  },
  {
    title: "features & scope",
    description: "select the features you need",
  },
  {
    title: "timeline & preferences",
    description: "when do you need this completed?",
  },
  {
    title: "contact details",
    description: "how can we reach you?",
  },
];

export default function HirePage() {
  const { playClick } = useSound();
  const { showToast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    // Project basics
    projectType: 'business', // Default to business website to show estimate from start
    projectGoal: '',
    businessType: '',
    currentChallenge: '',
    targetAudience: '',
    hasExistingWebsite: '',
    timeline: 'normal',
    
    // Features
    selectedFeatures: [] as string[],
    designPreference: '',
    contentReady: '',
    
    // Additional services
    selectedAdditionalServices: [] as string[],
    needsMaintenance: false,
    maintenanceLevel: 'basic',
    needsHosting: false,
    needsDomain: false,
    
    // Contact
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
    budget: '',
    hearAboutUs: '',
    
    // Package pre-selection
    selectedPackage: '',
  });

  // Handle URL parameters for package selection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const packageParam = urlParams.get('package');
      
      if (packageParam) {
        setFormData(prev => ({
          ...prev,
          selectedPackage: packageParam,
          projectType: packageParam === 'business' ? 'business' : 
                      packageParam === 'ecommerce' ? 'ecommerce' : 
                      packageParam === 'platform' ? 'saas' : ''
        }));
      }
    }
  }, []);

  // Memoized pricing calculation to reduce re-renders
  const calculateEstimate = useCallback(() => {
    const { projectType, selectedFeatures, selectedAdditionalServices, timeline } = formData;
    
    if (!projectType) {
      return { min: 0, max: 0 };
    }

    const basePackage = PRICING_CONFIG.basePackages[projectType as keyof typeof PRICING_CONFIG.basePackages];
    if (!basePackage) return { min: 0, max: 0 };

    const baseMin = basePackage.min;
    const baseMax = basePackage.max;

    // Add feature costs
    const featureCosts = selectedFeatures.reduce((total, feature) => {
      const featureConfig = PRICING_CONFIG.features[feature as keyof typeof PRICING_CONFIG.features];
      return total + (featureConfig?.price || 0);
    }, 0);

    // Add additional service costs (only for non-percentage services)
    const additionalServiceCosts = selectedAdditionalServices.reduce((total, service) => {
      const serviceConfig = PRICING_CONFIG.additionalServices[service as keyof typeof PRICING_CONFIG.additionalServices];
      if (serviceConfig && !serviceConfig.price.includes('%') && !serviceConfig.price.includes('/month')) {
        // Extract numeric value from price string like "£300-600"
        const priceMatch = serviceConfig.price.match(/£(\d+)(?:-(\d+))?/);
        if (priceMatch) {
          const minPrice = parseInt(priceMatch[1]);
          return total + minPrice; // Use minimum price for calculation
        }
      }
      return total;
    }, 0);

    // Apply timeline multiplier
    const timelineMultiplier = PRICING_CONFIG.timeline[timeline as keyof typeof PRICING_CONFIG.timeline] || 1;

    const totalMin = Math.round((baseMin + featureCosts + additionalServiceCosts) * timelineMultiplier);
    const totalMax = Math.round((baseMax + featureCosts + additionalServiceCosts) * timelineMultiplier);

    return { min: totalMin, max: totalMax };
  }, [formData.projectType, formData.selectedFeatures, formData.selectedAdditionalServices, formData.timeline]);

  // Memoized pricing breakdown to reduce re-renders
  const getPricingBreakdown = useCallback(() => {
    const { projectType, selectedFeatures, selectedAdditionalServices, timeline, needsMaintenance, maintenanceLevel } = formData;
    const breakdown = [];

    if (projectType) {
      const basePackage = PRICING_CONFIG.basePackages[projectType as keyof typeof PRICING_CONFIG.basePackages];
      if (basePackage) {
        breakdown.push({
          item: basePackage.name,
          price: `£${basePackage.min} - £${basePackage.max}`
        });
      }
    }

    selectedFeatures.forEach(feature => {
      const featureConfig = PRICING_CONFIG.features[feature as keyof typeof PRICING_CONFIG.features];
      if (featureConfig) {
        breakdown.push({
          item: featureConfig.name,
          price: featureConfig.price
        });
      }
    });

    selectedAdditionalServices.forEach(service => {
      const serviceConfig = PRICING_CONFIG.additionalServices[service as keyof typeof PRICING_CONFIG.additionalServices];
      if (serviceConfig) {
        // Calculate dynamic price for maintenance
        let servicePrice = serviceConfig.price;
        if (service === 'maintenance' && projectType) {
          const maintenancePrice = PRICING_CONFIG.maintenancePricing[projectType as keyof typeof PRICING_CONFIG.maintenancePricing];
          servicePrice = maintenancePrice ? `£${maintenancePrice}/month` : 'contact for pricing';
        }
        
        breakdown.push({
          item: serviceConfig.name,
          price: servicePrice
        });
      }
    });

    if (timeline === 'rush') {
      breakdown.push({
        item: 'rush delivery',
        price: '+30%'
      });
    } else if (timeline === 'flexible') {
      breakdown.push({
        item: 'flexible timeline',
        price: '-10%'
      });
    }

    if (needsMaintenance) {
      const maintenanceCost = PRICING_CONFIG.maintenance[maintenanceLevel as keyof typeof PRICING_CONFIG.maintenance];
      breakdown.push({
        item: `${maintenanceLevel} maintenance`,
        price: `£${maintenanceCost}/month`
      });
    }

    return breakdown;
  }, [formData]);

  // Memoize expensive calculations
  const estimate = useMemo(() => calculateEstimate(), [calculateEstimate]);
  const breakdown = useMemo(() => getPricingBreakdown(), [getPricingBreakdown]);

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 0:
        if (!formData.projectType) {
          errors.projectType = 'please select a project type';
        }
        if (!formData.projectGoal) {
          errors.projectGoal = 'please describe your project goal';
        }
        break;
      case 1:
        if (!formData.designPreference) {
          errors.designPreference = 'please select a design preference';
        }
        break;
      case 2:
        if (!formData.timeline) {
          errors.timeline = 'please select a timeline';
        }
        break;
      case 3:
        if (!formData.name) {
          errors.name = 'please enter your name';
        }
        if (!formData.email) {
          errors.email = 'please enter your email';
        }
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
          errors.email = 'please enter a valid email address';
        }
        if (!formData.message) {
          errors.message = 'please provide project details';
        }
        break;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async () => {
    const allValid = [0, 1, 2, 3].every(step => validateStep(step));
    
    if (!allValid) {
      showToast('please complete all required fields');
      return;
    }

    try {
      const estimate = calculateEstimate();
      const breakdown = getPricingBreakdown();
      
      const submissionData = {
        ...formData,
        estimate,
        breakdown
      };

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        showToast(result.error || 'failed to send message. please try again.');
        return;
      }

      showToast(result.message || 'project inquiry sent successfully! we\'ll be in touch soon.');
      
      // Reset form
      setFormData({
        projectType: '',
        projectGoal: '',
        businessType: '',
        currentChallenge: '',
        targetAudience: '',
        hasExistingWebsite: '',
        timeline: 'normal',
        selectedFeatures: [],
        selectedAdditionalServices: [],
        designPreference: '',
        contentReady: '',
        needsMaintenance: false,
        maintenanceLevel: 'basic',
        needsHosting: false,
        needsDomain: false,
        name: '',
        email: '',
        company: '',
        phone: '',
        message: '',
        budget: '',
        hearAboutUs: '',
        selectedPackage: '',
      });
      setCurrentStep(0);
      setFormErrors({});
    } catch (error) {
      console.error('Error submitting form:', error);
      showToast('failed to send message. please try again.');
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

  // Optimized input change handler to reduce re-renders
  const handleInputChange = useCallback((field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [formErrors]);

  // Optimized feature toggle to reduce re-renders
  const toggleFeature = useCallback((feature: string) => {
    setFormData(prev => {
      const updatedFeatures = prev.selectedFeatures.includes(feature)
        ? prev.selectedFeatures.filter(f => f !== feature)
        : [...prev.selectedFeatures, feature];
      
      return { ...prev, selectedFeatures: updatedFeatures };
    });
  }, []);

  // Optimized service toggle to reduce re-renders
  const toggleAdditionalService = useCallback((service: string) => {
    setFormData(prev => {
      const updatedServices = prev.selectedAdditionalServices.includes(service)
        ? prev.selectedAdditionalServices.filter(s => s !== service)
        : [...prev.selectedAdditionalServices, service];
      
      return { ...prev, selectedAdditionalServices: updatedServices };
    });
  }, []);

  const renderFormStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {formData.selectedPackage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    package pre-selected: {formData.selectedPackage}
                  </p>
                </div>
              </motion.div>
            )}

            <FormField 
              label={
                <div className="flex items-center gap-2">
                  <span>what type of project do you need?</span>
                  <div className="relative group">
                    <button
                      type="button"
                      className="w-4 h-4 rounded-full bg-neutral-300 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-400 dark:hover:bg-neutral-500 transition-colors flex items-center justify-center text-xs font-medium"
                    >
                      i
                    </button>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-96 p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="space-y-1">
                          <div className="font-medium">personal</div>
                          <div className="text-neutral-600 dark:text-neutral-400">portfolio, showcase work</div>
                          <div className="text-xs text-neutral-500">£300-600</div>
                        </div>
                        <div className="space-y-1">
                          <div className="font-medium">business</div>
                          <div className="text-neutral-600 dark:text-neutral-400">services, get leads</div>
                          <div className="text-xs text-neutral-500">£500-800</div>
                        </div>
                        <div className="space-y-1">
                          <div className="font-medium">e-commerce</div>
                          <div className="text-neutral-600 dark:text-neutral-400">sell products online</div>
                          <div className="text-xs text-neutral-500">£800-1500</div>
                        </div>
                        <div className="space-y-1">
                          <div className="font-medium">web app</div>
                          <div className="text-neutral-600 dark:text-neutral-400">custom functionality</div>
                          <div className="text-xs text-neutral-500">£1500-3000</div>
                        </div>
                        <div className="space-y-1 col-span-2 text-center">
                          <div className="font-medium">enterprise</div>
                          <div className="text-neutral-600 dark:text-neutral-400">large scale solution</div>
                          <div className="text-xs text-neutral-500">£3000-8000+</div>
                        </div>
                      </div>
                      <div className="text-neutral-500 dark:text-neutral-500 border-t border-neutral-200 dark:border-neutral-700 pt-2 text-center">
                        not sure? start with business - we can always expand later
                      </div>
                      {/* Tooltip arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-neutral-800"></div>
                    </div>
                  </div>
                </div>
              }
              required
              description="we've pre-selected 'business website' to show you an estimate - feel free to change it"
              error={formErrors.projectType}
            >
              <select
                value={formData.projectType}
                onChange={(e) => handleInputChange('projectType', e.target.value)}
                className="w-full p-3 border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 rounded-md focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-all duration-300"
              >
                <option value="">select project type</option>
                <option value="personal">personal website / portfolio (£300-600)</option>
                <option value="business">business website (£500-800)</option>
                <option value="ecommerce">e-commerce store (£800-1500)</option>
                <option value="saas">custom web application (£1500-3000)</option>
                <option value="enterprise">enterprise solution (£3000-8000+)</option>
              </select>
            </FormField>

            <FormField 
              label="tell us about your business and what you want to achieve" 
              required
              description="help us understand your situation so we can build the perfect solution"
              error={formErrors.projectGoal}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                    what type of business do you run?
                  </label>
                  <input
                    type="text"
                    value={formData.businessType || ''}
                    onChange={(e) => handleInputChange('businessType', e.target.value)}
                    placeholder="e.g., marketing agency, restaurant, fitness studio, online retailer..."
                    className="w-full p-3 border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 rounded-md focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                    what&apos;s your main challenge right now?
                  </label>
                  <textarea
                    value={formData.currentChallenge || ''}
                    onChange={(e) => handleInputChange('currentChallenge', e.target.value)}
                    rows={2}
                    placeholder="e.g., customers can't find us online, losing sales to competitors, manual processes taking too much time..."
                    className="w-full p-3 border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 rounded-md focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-all duration-300 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                    what would success look like 6 months after launch?
                  </label>
                  <textarea
                    value={formData.projectGoal}
                    onChange={(e) => handleInputChange('projectGoal', e.target.value)}
                    rows={2}
                    placeholder="e.g., 50% more customer inquiries, selling products 24/7, customers can book appointments online, professional credibility established..."
                    className="w-full p-3 border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 rounded-md focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-all duration-300 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                    who are your ideal customers?
                  </label>
                  <input
                    type="text"
                    value={formData.targetAudience || ''}
                    onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                    placeholder="e.g., busy professionals aged 25-45, local families, small business owners..."
                    className="w-full p-3 border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 rounded-md focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-all duration-300"
                  />
                </div>
              </div>
            </FormField>

            <FormField 
              label="do you currently have a website?" 
              error={formErrors.hasExistingWebsite}
            >
              <div className="grid grid-cols-3 gap-3">
                {['no', 'yes - needs redesign', 'yes - needs updates'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleInputChange('hasExistingWebsite', option)}
                    className={`p-3 border rounded-md text-sm transition-all duration-300 ${
                      formData.hasExistingWebsite === option
                        ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-100 dark:bg-neutral-800'
                        : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </FormField>
          </motion.div>
        );

      case 1:
        return (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* What's included in selected tier */}
            {formData.projectType && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                <div className="flex items-start gap-3">
                  <div className="text-green-600 dark:text-green-400 mt-0.5">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                      included in {PRICING_CONFIG.basePackages[formData.projectType as keyof typeof PRICING_CONFIG.basePackages]?.name}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                      {PRICING_CONFIG.includedFeatures[formData.projectType as keyof typeof PRICING_CONFIG.includedFeatures]?.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-green-600 dark:bg-green-400 rounded-full"></div>
                          <span className="text-xs text-green-700 dark:text-green-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {formData.projectType === 'enterprise' ? (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <div className="flex items-start gap-3">
                  <div className="text-blue-600 dark:text-blue-400 mt-0.5">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                      enterprise solution
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                      this is a completely custom solution tailored to your specific needs. all features and functionality will be designed and built specifically for your requirements. no additional feature selection needed.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <FormField 
                label="which additional features do you need?" 
                description="these are specialized add-ons for more advanced functionality"
              >
              {/* Group features by category */}
              {Object.entries(
                Object.entries(PRICING_CONFIG.features).reduce((acc, [key, feature]) => {
                  const category = feature.category || 'Other';
                  if (!acc[category]) acc[category] = [];
                  acc[category].push([key, feature]);
                  return acc;
                }, {} as Record<string, [string, { name: string; description: string; category?: string; price?: number }][]>)
              ).map(([category, categoryFeatures]) => (
                <div key={category} className="mb-6">
                  <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    {category}
                  </h4>
                  <div className="grid gap-3">
                    {categoryFeatures.map(([key, feature]) => (
                      <FeatureToggle
                        key={key}
                        feature={feature.name}
                        description={feature.description}
                        selected={formData.selectedFeatures.includes(key)}
                        onToggle={() => toggleFeature(key)}
                        price={feature.price || 0}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </FormField>
            )}

            {/* Additional Services */}
            <FormField 
              label="additional services" 
              description="optional add-on services that can enhance your project"
            >
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(PRICING_CONFIG.additionalServices).map(([key, service]) => {
                  // Calculate dynamic price for maintenance
                  const getServicePrice = () => {
                    if (key === 'maintenance' && formData.projectType) {
                      const maintenancePrice = PRICING_CONFIG.maintenancePricing[formData.projectType as keyof typeof PRICING_CONFIG.maintenancePricing];
                      return maintenancePrice ? `£${maintenancePrice}/month` : 'contact for pricing';
                    }
                    return service.price;
                  };

                  return (
                    <motion.button
                      key={key}
                      type="button"
                      onClick={() => toggleAdditionalService(key)}
                      className={`p-4 border rounded-md text-left transition-all duration-300 ${
                        formData.selectedAdditionalServices.includes(key)
                          ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-100 dark:bg-neutral-800' 
                          : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                            formData.selectedAdditionalServices.includes(key)
                              ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100' 
                              : 'border-neutral-300 dark:border-neutral-700'
                          }`}>
                            {formData.selectedAdditionalServices.includes(key) && (
                              <svg className="w-2 h-2 text-neutral-50 dark:text-neutral-900" fill="currentColor" viewBox="0 0 8 8">
                                <path d="M6.564.75L3.59 3.724 1.436 1.57.75 2.256l2.842 2.84L7.25 1.436z"/>
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium mb-1">{service.name}</div>
                            <div className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">{service.description}</div>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="text-sm font-bold">{getServicePrice()}</span>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </FormField>

            <FormField 
              label="design preference" 
              required
              error={formErrors.designPreference}
            >
              <div className="grid grid-cols-2 gap-3">
                {[
                  'modern & minimal',
                  'bold & creative', 
                  'professional & corporate',
                  'custom design needed'
                ].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleInputChange('designPreference', option)}
                    className={`p-3 border rounded-md text-sm transition-all duration-300 ${
                      formData.designPreference === option
                        ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-100 dark:bg-neutral-800'
                        : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </FormField>
          </motion.div>
        );

      case 2:
        return (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <FormField 
              label="when do you need this completed?" 
              required
              error={formErrors.timeline}
            >
              <div className="grid gap-3">
                {[
                  { key: 'rush', label: 'rush (1-2 weeks)', desc: '+30% cost', highlight: true },
                  { key: 'normal', label: 'standard (3-6 weeks)', desc: 'standard pricing' },
                  { key: 'flexible', label: 'flexible (6+ weeks)', desc: '-10% cost', highlight: true }
                ].map(({ key, label, desc, highlight }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleInputChange('timeline', key)}
                    className={`p-4 border rounded-md text-left transition-all duration-300 ${
                      formData.timeline === key
                        ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-100 dark:bg-neutral-800'
                        : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{label}</div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-500">{desc}</div>
                      </div>
                      {highlight && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          key === 'rush' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                          'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        }`}>
                          {key === 'rush' ? '+30%' : '-10%'}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </FormField>

            <FormField 
              label="do you have content ready?" 
              description="text, images, logos, etc."
            >
              <div className="grid grid-cols-3 gap-3">
                {['yes', 'partially', 'no - need help'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleInputChange('contentReady', option)}
                    className={`p-3 border rounded-md text-sm transition-all duration-300 ${
                      formData.contentReady === option
                        ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-100 dark:bg-neutral-800'
                        : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </FormField>


          </motion.div>
        );

      case 3:
        return (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField 
                label="name" 
                required
                error={formErrors.name}
              >
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full p-3 border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 rounded-md focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-all duration-300"
                />
              </FormField>

              <FormField 
                label="email" 
                required
                error={formErrors.email}
              >
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full p-3 border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 rounded-md focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-all duration-300"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField 
                label="company / organization" 
                description="optional"
              >
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="w-full p-3 border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 rounded-md focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-all duration-300"
                />
              </FormField>

              <FormField 
                label="phone number" 
                description="optional"
              >
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full p-3 border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 rounded-md focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-all duration-300"
                />
              </FormField>
            </div>

            <FormField 
              label="additional information" 
              required
              description="any technical requirements, questions, or specific notes about your project"
              error={formErrors.message}
            >
              <textarea
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                rows={4}
                placeholder="e.g., specific integrations needed, design inspirations, technical constraints, existing systems to connect with, or any questions you have..."
                className="w-full p-3 border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 rounded-md focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-all duration-300 resize-none"
              />
            </FormField>

            <FormField 
              label="how did you hear about us?" 
              description="optional"
            >
              <select
                value={formData.hearAboutUs}
                onChange={(e) => handleInputChange('hearAboutUs', e.target.value)}
                className="w-full p-3 border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 rounded-md focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-all duration-300"
              >
                <option value="">select an option</option>
                <option value="google">google search</option>
                <option value="referral">referral from friend/colleague</option>
                <option value="social-media">social media</option>
                <option value="existing-client">existing client</option>
                <option value="other">other</option>
              </select>
            </FormField>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen relative">
      <Suspense fallback={<ComponentLoader />}>
        <ScrollProgress />
      </Suspense>

      {/* Hero Section */}
      <Suspense fallback={<ComponentLoader />}>
        <SectionTransition>
          <section className="py-28 md:py-32 px-4 md:px-6 lg:px-12">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-10 md:mb-12">
                <ThreeShowcase />
              </div>
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
                    looking for professional development services?
                  </AnimatedText>
                  
                                  <AnimatedText
                    className="text-base md:text-lg text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed max-w-2xl mx-auto"
                    type="words"
                    animationType="fade"
                    delay={0.4}
                    stagger={0.02}
                  >
                    this is my personal portfolio showcasing my work as a computer science student and developer. 
                    for professional web development services and business inquiries, please visit kyurkchiev.group.
                  </AnimatedText>
              </motion.div>
              
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <a
                  href="https://kyurkchiev.group"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-800 dark:bg-emerald-600 text-white px-6 md:px-8 py-3 rounded-md font-medium hover:bg-emerald-700 dark:hover:bg-emerald-500 transition-all duration-300 inline-flex items-center gap-2"
                  onClick={playClick}
                >
                  visit kyurkchiev.group
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                    />
                  </svg>
                </a>
                
                <Link
                  href="/about"
                  className="border border-neutral-400 dark:border-neutral-600 bg-transparent text-neutral-900 dark:text-neutral-100 px-6 md:px-8 py-3 rounded-md font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-300"
                  onClick={playClick}
                >
                  about me
                </Link>
              </motion.div>
            </div>
          </section>
        </SectionTransition>
      </Suspense>

      {/* Business Redirect Section */}
      <Suspense fallback={<ComponentLoader />}>
        <SectionTransition>
          <section className="py-16 md:py-24 px-4 md:px-6 lg:px-12">
            <div className="max-w-4xl mx-auto">
              {/* Business Redirect Card */}
              <motion.div
                className="mb-16 md:mb-20"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="p-8 md:p-12 border-2 border-neutral-900 dark:border-neutral-100 rounded-md text-center bg-neutral-50 dark:bg-neutral-800">
                  <div className="w-20 h-20 mx-auto mb-6 bg-neutral-900 dark:bg-neutral-100 rounded-md flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-10 h-10 text-neutral-50 dark:text-neutral-900"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                      />
                    </svg>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-light mb-4">
                    professional web development services
                  </h2>
                  <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed max-w-2xl mx-auto">
                    for business inquiries, project quotes, and professional web development services, 
                    please visit kyurkchiev.group where you can explore our full service offerings, 
                    view detailed pricing, and submit project inquiries through our comprehensive project planner.
                  </p>
                  <div className="space-y-4 mb-8">
                    <a
                      href="https://kyurkchiev.group"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={playClick}
                      className="inline-flex items-center gap-3 bg-emerald-800 dark:bg-emerald-600 text-white px-8 py-4 rounded-md font-medium hover:bg-emerald-700 dark:hover:bg-emerald-500 transition-all duration-300 text-lg"
                    >
                      visit kyurkchiev.group
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                        />
                      </svg>
                    </a>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      instant project estimates
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      detailed service packages
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      professional project planner
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Personal Contact Section */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h3 className="text-2xl font-light mb-4">or just say hello</h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-xl mx-auto">
                  interested in my personal work, want to collaborate on a project, or just want to chat about technology and development? 
                  feel free to reach out directly.
                </p>
                <a
                  href="mailto:me@atanaskyurkchiev.info"
                  onClick={playClick}
                  className="inline-flex items-center gap-2 border border-neutral-400 dark:border-neutral-600 bg-transparent text-neutral-900 dark:text-neutral-100 px-6 py-3 rounded-md font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-300"
                >
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
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                  me@atanaskyurkchiev.info
                </a>
              </motion.div>
            </div>
          </section>
        </SectionTransition>
      </Suspense>
    </main>
  );
} 