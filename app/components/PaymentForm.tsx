'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useToast } from './Toast';

// Load Stripe outside of component to avoid recreating on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

interface PaymentFormProps {
  amount: number;
  currency?: string;
  type?: 'invoice' | 'general';
  invoiceId?: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

function PaymentFormContent({ 
  amount, 
  type = 'general', 
  invoiceId, 
  onError 
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
      });

      if (error) {
        setMessage(error.message || 'An error occurred during payment.');
        onError?.(error.message || 'Payment failed');
        showToast('Payment failed. Please try again.');
      } else {
        setMessage('Payment successful!');
        showToast('Payment successful!');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setMessage('An unexpected error occurred.');
      onError?.('Payment failed');
      showToast('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-neutral-600 dark:text-neutral-400 lowercase">
            amount to pay:
          </span>
          <span className="font-semibold text-lg">
            £{amount.toFixed(2)}
          </span>
        </div>
        
        {type === 'invoice' && invoiceId && (
          <div className="text-xs text-neutral-500 dark:text-neutral-500 mb-4 lowercase">
            invoice id: {invoiceId}
          </div>
        )}
      </div>

      <PaymentElement />

      {message && (
        <motion.div
          className={`p-3 rounded-lg text-sm ${
            message.includes('successful') 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
          }`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {message}
        </motion.div>
      )}

              <motion.button
          type="submit"
          disabled={!stripe || isProcessing}
          className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-300 ${
            isProcessing
              ? 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 cursor-not-allowed'
              : 'bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200'
          }`}
        whileHover={!isProcessing ? { scale: 1.02 } : {}}
        whileTap={!isProcessing ? { scale: 0.98 } : {}}
      >
        {isProcessing ? 'processing...' : `pay £${amount.toFixed(2)}`}
      </motion.button>
    </motion.form>
  );
}

export function PaymentForm(props: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string>('');

  useEffect(() => {
    // Only create payment intent if Stripe is configured
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      props.onError?.('Stripe not configured');
      return;
    }

    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: props.amount,
            currency: props.currency || 'gbp',
            type: props.type,
            invoiceId: props.invoiceId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create payment intent');
        }

        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        props.onError?.('Failed to initialize payment');
      }
    };

    createPaymentIntent();
  }, [props.amount, props.currency, props.type, props.invoiceId]);

  if (!clientSecret) {
    return (
      <motion.div
        className="flex items-center justify-center py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-neutral-600 dark:text-neutral-400 lowercase">
          {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'initializing payment...' : 'stripe not configured'}
        </div>
      </motion.div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#171717',
            colorBackground: '#fafafa',
            colorText: '#171717',
            colorDanger: '#ef4444',
            fontFamily: 'Inter, system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px',
          },
        },
      }}
    >
      <PaymentFormContent {...props} />
    </Elements>
  );
} 