import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent, processInvoicePayment } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = 'gbp', type = 'general', invoiceId } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount provided' },
        { status: 400 }
      );
    }

    let paymentIntent;

    if (type === 'invoice' && invoiceId) {
      // Process invoice payment
      paymentIntent = await processInvoicePayment(invoiceId, amount);
    } else {
      // Process general payment (upfront project payment)
      paymentIntent = await createPaymentIntent(amount, currency);
    }

    return NextResponse.json({
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.paymentIntentId,
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
} 