'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircleIcon,
  CreditCardIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<{
    paymentIntentId: string;
    amount?: number;
    status?: string;
  } | null>(null);

  useEffect(() => {
    const paymentIntentId = searchParams.get('payment_intent');
    const status = searchParams.get('redirect_status');
    
    if (paymentIntentId) {
      setPaymentDetails({
        paymentIntentId,
        status: status || 'succeeded'
      });
    }
  }, [searchParams]);

  if (!paymentDetails) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <motion.div
          className="text-neutral-600 dark:text-neutral-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          loading payment details...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="max-w-2xl mx-auto px-4 py-16 md:py-24">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Success Icon */}
          <motion.div
            className="mx-auto mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, type: "spring", bounce: 0.4 }}
          >
            <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h1 className="text-3xl md:text-4xl font-light mb-4 text-neutral-900 dark:text-neutral-100">
              payment successful!
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
              your payment has been processed successfully
            </p>
          </motion.div>

          {/* Payment Details */}
          <motion.div
            className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 mb-8 text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CreditCardIcon className="w-5 h-5" />
              payment details
            </h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">payment id:</span>
                <span className="font-mono text-neutral-900 dark:text-neutral-100">
                  {paymentDetails.paymentIntentId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">status:</span>
                <span className="text-green-600 font-medium capitalize">
                  {paymentDetails.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">processed:</span>
                <span className="text-neutral-900 dark:text-neutral-100">
                  {new Date().toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </motion.div>

          {/* What Happens Next */}
          <motion.div
            className="bg-neutral-100 dark:bg-neutral-800 rounded-xl p-6 mb-8 text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              what happens next?
            </h3>
            
            <ul className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-neutral-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>you&apos;ll receive a payment confirmation email within the next few minutes</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-neutral-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>the invoice will be automatically updated to reflect your payment</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-neutral-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>if this was a project deposit, work will commence within 1-2 business days</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-neutral-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>you&apos;ll receive regular project updates and progress reports</span>
              </li>
            </ul>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 rounded-md font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all duration-300"
            >
              return home
            </Link>
            
            <a
              href="mailto:me@atanaskyurkchiev.info?subject=Payment Confirmation"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-neutral-400 dark:border-neutral-600 bg-transparent text-neutral-900 dark:text-neutral-100 rounded-md font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-300"
            >
              contact support
            </a>
          </motion.div>

          {/* Footer Note */}
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <p className="text-xs text-neutral-500 dark:text-neutral-500">
              if you have any questions about your payment or project, please don&apos;t hesitate to get in touch
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 