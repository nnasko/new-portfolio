import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

if (!process.env.STRIPE_PUBLISHABLE_KEY) {
  throw new Error('STRIPE_PUBLISHABLE_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
  typescript: true,
});

export const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;

// Payment intent creation helper
export async function createPaymentIntent(amount: number, currency: string = 'gbp') {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        integration_check: 'accept_a_payment',
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new Error('Failed to create payment intent');
  }
}

// Invoice payment processing
export async function processInvoicePayment(invoiceId: string, amount: number) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'gbp',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        invoice_id: invoiceId,
        type: 'invoice_payment',
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Error processing invoice payment:', error);
    throw new Error('Failed to process invoice payment');
  }
}

// Retainer payment processing
export async function createRetainerSubscription(amount: number, interval: 'month' | 'year' = 'month') {
  try {
    // Create a product for the retainer
    const product = await stripe.products.create({
      name: 'Monthly Retainer',
      description: 'Ongoing maintenance and support services',
    });

    // Create a price for the retainer
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(amount * 100),
      currency: 'gbp',
      recurring: {
        interval,
      },
    });

    return {
      productId: product.id,
      priceId: price.id,
    };
  } catch (error) {
    console.error('Error creating retainer subscription:', error);
    throw new Error('Failed to create retainer subscription');
  }
} 