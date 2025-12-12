import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

interface CreatePaymentIntentRequest {
  bookingId: string;
  amount: number;
}

interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

/**
 * POST /api/payments/create-intent
 * Creates a Stripe PaymentIntent and Payment record
 * Body: { bookingId, amount }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: CreatePaymentIntentRequest = await request.json();
    const { bookingId, amount } = body;

    // Validate required fields
    if (!bookingId || !amount) {
      return NextResponse.json(
        { error: 'Booking ID and amount are required' },
        { status: 400 }
      );
    }

    // Validate amount is positive
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { slot: true },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if payment already exists for this booking
    const existingPayment = await prisma.payment.findUnique({
      where: { bookingId },
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: 'Payment already exists for this booking' },
        { status: 400 }
      );
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: booking.currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        bookingId: booking.id,
        customerEmail: booking.email,
        customerName: `${booking.firstName} ${booking.lastName}`,
        sessionType: booking.type,
      },
    });

    // Create Payment record in database with PENDING status
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        stripePaymentIntent: paymentIntent.id,
        amount,
        currency: booking.currency,
        status: 'PENDING',
      },
    });

    const response: CreatePaymentIntentResponse = {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error creating payment intent:', error);

    // Handle Stripe-specific errors
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
