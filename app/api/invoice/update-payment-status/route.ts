import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId, invoiceId } = body;

    if (!paymentIntentId || !invoiceId) {
      return NextResponse.json(
        { error: 'Payment intent ID and invoice ID are required' },
        { status: 400 }
      );
    }

    // Verify the payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Update invoice status in database
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'PAID',
        paidDate: new Date(),
        paymentMethod: 'stripe',
        paymentReference: paymentIntentId,
      },
      include: {
        Client: true,
      },
    });

    return NextResponse.json({
      success: true,
      invoice: updatedInvoice,
      message: 'Invoice payment status updated successfully',
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    return NextResponse.json(
      { error: 'Failed to update payment status' },
      { status: 500 }
    );
  }
} 