import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('No stripe signature found');
      return NextResponse.json({ error: 'No signature found' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('Received webhook event:', event.type);

    // Handle successful payment
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      console.log('Payment succeeded:', paymentIntent.id);
      
      // Extract invoice information from metadata if available
      const invoiceId = paymentIntent.metadata?.invoice_id || paymentIntent.metadata?.invoiceId;
      const amount = paymentIntent.amount / 100; // Convert from cents to pounds
      
      if (invoiceId) {
        try {
          // Find the invoice and update its payment status
          const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { Client: true }
          });

          if (invoice) {
            const newAmountPaid = invoice.amountPaid + amount;
            const isFullyPaid = newAmountPaid >= invoice.total;
            
            // Update the invoice
            await prisma.invoice.update({
              where: { id: invoiceId },
              data: {
                amountPaid: newAmountPaid,
                status: isFullyPaid ? 'PAID' : 'UNPAID',
                paidDate: isFullyPaid ? new Date() : null,
                paymentMethod: 'STRIPE',
                paymentReference: paymentIntent.id,
                updatedAt: new Date()
              }
            });

            console.log(`Invoice ${invoice.invoiceNumber} updated: £${amount} paid, total paid: £${newAmountPaid}`);
            
            // TODO: Send confirmation email to client
            
          } else {
            console.error(`Invoice not found for ID: ${invoiceId}`);
          }
        } catch (dbError) {
          console.error('Database error updating invoice:', dbError);
        }
      } else {
        console.log('No invoice ID in payment metadata');
      }
    }

    // Handle failed payment
    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('Payment failed:', paymentIntent.id);
      
      // TODO: Handle failed payment notification
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
} 