'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { useSound } from "../components/SoundProvider";
import { SectionTransition } from "../components/SectionTransition";
import { AnimatedText } from "../components/AnimatedText";
import { Navigation } from "../components/Navigation";
import { ScrollProgress } from "../components/ScrollProgress";
import { CheckIcon } from "@heroicons/react/24/outline";

interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  href: string;
  timeline: string;
  revisions: string;
}

const pricingTiers: PricingTier[] = [
  {
    name: "personal website",
    price: "£300-600",
    description: "simple portfolio or personal brand website to showcase your work",
    timeline: "1-2 weeks",
    revisions: "1 round",
    features: [
      "responsive website design",
      "up to 4 pages",
      "contact forms",
      "basic seo setup",
      "mobile-first approach",
      "photo galleries",
      "social media links"
    ],
    href: "/hire?package=personal"
  },
  {
    name: "business website",
    price: "£500-800",
    description: "professional website for your business with modern design and essential features",
    timeline: "2-3 weeks",
    revisions: "2 rounds",
    features: [
      "everything in personal website",
      "up to 6 pages",
      "advanced contact forms",
      "seo optimization setup",
      "google analytics integration",
      "content management system",
      "basic performance optimization"
    ],
    href: "/hire?package=business"
  },
  {
    name: "e-commerce platform",
    price: "£800-1500",
    description: "complete online store with payment processing and inventory management",
    timeline: "3-4 weeks",
    revisions: "3 rounds",
    popular: true,
    features: [
      "everything in business website",
      "product catalog & management",
      "secure payment processing",
      "inventory tracking system",
      "customer account system",
      "order management dashboard",
      "email notifications",
      "advanced seo optimization"
    ],
    href: "/hire?package=ecommerce"
  },
  {
    name: "custom web application",
    price: "£1500-3000",
    description: "bespoke web application with custom functionality for your specific needs",
    timeline: "4-6 weeks",
    revisions: "4 rounds",
    features: [
      "everything in e-commerce platform",
      "custom user authentication",
      "admin dashboard & analytics",
      "api development & integrations",
      "database design & optimization",
      "third-party service integrations",
      "advanced features & automation",
      "1 month post-launch support"
    ],
    href: "/hire?package=platform"
  },
  {
    name: "enterprise solution",
    price: "£3000-8000+",
    description: "large-scale custom solution with unlimited revisions and dedicated support",
    timeline: "6-12 weeks",
    revisions: "unlimited",
    features: [
      "everything in custom web application",
      "unlimited pages & features",
      "custom integrations & apis",
      "advanced security & scalability",
      "dedicated project manager",
      "24/7 priority support",
      "extensive testing & qa",
      "3 months post-launch support",
      "completely bespoke solution"
    ],
    href: "/hire?package=enterprise"
  }
];

const additionalServices = [
  {
    name: "ongoing maintenance",
    price: "£50-300/month",
    description: "regular updates, security patches, and technical support (pricing based on package complexity)"
  }
];

function PricingCard({ tier, index }: { tier: PricingTier; index: number }) {
  const { playClick } = useSound();

  return (
    <motion.div
      className={`relative p-6 md:p-8 border transition-all duration-200 rounded-md flex flex-col h-full ${
        tier.popular 
          ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-50 dark:bg-neutral-800' 
          : 'border-neutral-300 dark:border-neutral-700 bg-neutral-100/50 dark:bg-neutral-900/50'
      }`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: [0.33, 1, 0.68, 1]
      }}
      whileHover={{ 
        y: -4,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
    >
      {tier.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-4 py-1 rounded-md text-sm font-medium">
            most popular
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-medium mb-2">{tier.name}</h3>
        <div className="text-3xl font-bold mb-2">{tier.price}</div>
        <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
          {tier.description}
        </p>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600 dark:text-neutral-400">timeline:</span>
          <span className="font-medium">{tier.timeline}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600 dark:text-neutral-400">revisions:</span>
          <span className="font-medium">{tier.revisions}</span>
        </div>
      </div>

      <div className="flex-1 space-y-3 mb-8">
        <h4 className="font-medium text-sm text-neutral-600 dark:text-neutral-400">
          what&apos;s included:
        </h4>
        <ul className="space-y-2">
          {tier.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <CheckIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <Link
        href={tier.href}
        onClick={playClick}
        className={`block w-full text-center py-3 px-6 rounded-md font-medium transition-all duration-300 ${
          tier.popular
            ? 'bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200'
            : 'border border-neutral-400 dark:border-neutral-600 bg-transparent text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700'
        }`}
      >
        get started
      </Link>
    </motion.div>
  );
}

function ServiceCard({ service, index }: { service: typeof additionalServices[0]; index: number }) {
  return (
    <motion.div
      className="p-4 md:p-6 border border-neutral-300 dark:border-neutral-700 rounded-md bg-neutral-100/50 dark:bg-neutral-900/50"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium">{service.name}</h4>
        <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
          {service.price}
        </span>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
        {service.description}
      </p>
    </motion.div>
  );
}

export default function PricingPage() {
  const { playClick } = useSound();

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900 relative">
      <ScrollProgress />
      <Navigation variant="sticky" />
      
      <SectionTransition>
        <div className="w-full px-4 md:px-6 lg:px-8 py-16 md:py-24">
          {/* Header */}
          <motion.div
            className="text-center mb-16 md:mb-20"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <AnimatedText
              className="text-3xl md:text-4xl lg:text-5xl font-light mb-4 md:mb-6"
              type="words"
              animationType="slide"
              direction="up"
              stagger={0.1}
            >
              development services pricing
            </AnimatedText>
            <AnimatedText
              className="text-base md:text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto leading-relaxed"
              type="words"
              animationType="fade"
              delay={0.3}
              stagger={0.02}
            >
              transparent pricing for professional web development services. all projects include modern design, clean code, and ongoing support.
            </AnimatedText>
          </motion.div>

          {/* Pricing Tiers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-16 md:mb-20">
            {pricingTiers.map((tier, index) => (
              <PricingCard key={tier.name} tier={tier} index={index} />
            ))}
          </div>

          {/* Additional Services */}
          <motion.div
            className="mb-16 md:mb-20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-light mb-4">
                additional services
              </h2>
              <p className="text-base md:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                enhance your project with these optional add-on services
              </p>
            </div>
            
            <div className="flex justify-center">
              <div className="max-w-md w-full">
                {additionalServices.map((service, index) => (
                  <ServiceCard key={service.name} service={service} index={index} />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Process Overview */}
          <motion.div
            className="mb-16 md:mb-20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-light mb-4">
                what you can expect
              </h2>
              <p className="text-base md:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                every project follows a proven development process
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6 md:gap-8">
              {[
                {
                  step: "01",
                  title: "discovery call",
                  description: "free consultation to understand your needs and project scope"
                },
                {
                  step: "02", 
                  title: "project planning",
                  description: "detailed timeline, milestones, and development roadmap"
                },
                {
                  step: "03",
                  title: "development",
                  description: "regular updates and previews throughout the build process"
                },
                {
                  step: "04",
                  title: "launch & support",
                  description: "deployment, testing, and post-launch support included"
                }
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="w-12 h-12 mx-auto mb-4 border border-neutral-400 dark:border-neutral-600 rounded-md flex items-center justify-center text-sm font-medium">
                    {item.step}
                  </div>
                  <h3 className="font-medium mb-2">{item.title}</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            className="text-center bg-neutral-100 dark:bg-neutral-800 rounded-md p-8 md:p-12"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h2 className="text-2xl md:text-3xl font-light mb-4">
              ready to start your project?
            </h2>
            <p className="text-base md:text-lg text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              let&apos;s discuss your requirements and create a custom solution that fits your needs and budget.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/hire"
                onClick={playClick}
                className="inline-block bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-6 md:px-8 py-3 rounded-md font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all duration-300"
              >
                start your project
              </Link>
              <a
                href="mailto:me@atanaskyurkchiev.info"
                onClick={playClick}
                className="inline-block border border-neutral-400 dark:border-neutral-600 bg-transparent text-neutral-900 dark:text-neutral-100 px-6 md:px-8 py-3 rounded-md font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-300"
              >
                ask a question
              </a>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-6">
              free consultation • no commitment • quick response
            </p>
          </motion.div>
        </div>
      </SectionTransition>
    </main>
  );
} 