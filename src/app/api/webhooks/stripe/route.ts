import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

/**
 * POST /api/webhooks/stripe
 * Handles Stripe webhook events
 * Validates webhook signature and processes payment events
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('No Stripe signature found in request headers');
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    // Validate webhook signature
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log(`Received Stripe event: ${event.type}`);

    // Handle payment_intent.succeeded event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      console.log(`Payment succeeded: ${paymentIntent.id}`);

      // Find the payment record
      const payment = await prisma.payment.findUnique({
        where: { stripePaymentIntent: paymentIntent.id },
        include: { booking: true },
      });

      if (!payment) {
        console.error(`Payment not found for PaymentIntent: ${paymentIntent.id}`);
        return NextResponse.json(
          { error: 'Payment not found' },
          { status: 404 }
        );
      }

      // Update Payment status to SUCCEEDED
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCEEDED',
          paymentMethod: paymentIntent.payment_method_types?.[0] || null,
        },
      });

      console.log(`Payment updated to SUCCEEDED: ${payment.id}`);

      // Update Booking status to CONFIRMED
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'CONFIRMED' },
      });

      console.log(`Booking confirmed: ${payment.bookingId}`);

      // Process Confirmation (Email, Calendar, etc.)
      await processBookingConfirmation(payment.bookingId);

      return NextResponse.json(
        { received: true, message: 'Payment processed successfully' },
        { status: 200 }
      );
    }

    // Handle payment_intent.payment_failed event
    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      console.log(`Payment failed: ${paymentIntent.id}`);

      // Find the payment record
      const payment = await prisma.payment.findUnique({
        where: { stripePaymentIntent: paymentIntent.id },
      });

      if (payment) {
        // Update Payment status to FAILED
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED' },
        });

        console.log(`Payment updated to FAILED: ${payment.id}`);
      }

      return NextResponse.json(
        { received: true, message: 'Payment failure recorded' },
        { status: 200 }
      );
    }

    // Return 200 for other event types (they're acknowledged but not processed)
    console.log(`Event type ${event.type} not handled`);
    return NextResponse.json(
      { received: true, message: 'Event received but not processed' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Services
import { emailService } from '@/lib/email';
import { googleMeetService } from '@/lib/google-meet';

async function processBookingConfirmation(bookingId: string) {
  // 1. Fetch full booking details
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      slot: {
        include: { location: true }
      }
    }
  });

  if (!booking || !booking.slot) {
    console.error(`Booking or Slot not found for ID: ${bookingId}`);
    return;
  }

  // 2. Increment Coupon Usage if applicable
  if (booking.couponCode) {
    try {
      await prisma.coupon.update({
        where: { code: booking.couponCode },
        data: { usedCount: { increment: 1 } }
      });
      console.log(`Coupon ${booking.couponCode} usage incremented.`);
    } catch (e) {
      console.error(`Failed to increment coupon ${booking.couponCode}`, e);
    }
  }

  // 3. Create Google Meet if Online
  let meetLink = '';
  if (booking.type === 'ONLINE') {
    try {
      // Construct proper date object combining date and time
      // booking.slot.date is usually midnight UTC, booking.slot.time is "14:00"
      const datePart = booking.slot.date.toISOString().split('T')[0];
      const timePart = booking.slot.time;
      const startDateTime = new Date(`${datePart}T${timePart}:00`);

      const meet = await googleMeetService.createMeeting(
        booking.id,
        'Sessão Brilliance (' + booking.firstName + ')',
        'Sessão de Terapia Multidimensional',
        startDateTime,
        booking.slot.duration || 60, // Default duration if missing
        booking.email
      );

      // Save meet link
      await prisma.googleMeetEvent.create({
        data: {
          bookingId: booking.id,
          googleEventId: meet.eventId,
          meetLink: meet.meetLink
        }
      });

      meetLink = meet.meetLink;
      console.log('✅ Google Meet created:', meetLink);
    } catch (e) {
      console.error('Failed to create Google Meet', e);
    }
  }

  // 4. Send Confirmation Email to Client
  // Attach the meet link to the booking object for the email template
  const bookingWithLink = { ...booking, googleMeetEvent: { meetLink } };
  await emailService.sendBookingConfirmation(bookingWithLink);

  // 5. Notify Translators (if needed)
  if (booking.language !== 'pt' && booking.language !== 'pt-BR') {
    await emailService.sendEmail({
      to: 'translators@brilance.international',
      subject: `[TRADUÇÃO] Nova sessão em ${booking.language.toUpperCase()}`,
      html: `
        <h1>Nova Reserva em ${booking.language.toUpperCase()}</h1>
        <p>Cliente: ${booking.firstName} ${booking.lastName}</p>
        <p>Data: ${new Date(booking.slot.date).toLocaleDateString()}</p>
        <p>Horário: ${booking.slot.time}</p>
        <p>Link: ${meetLink || 'N/A'}</p>
      `
    });
    console.log('✅ Translator notified');
  }
}
