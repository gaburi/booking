import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { bookingId } = body;

        if (!bookingId) {
            return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });
        }

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
        });

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // Check if payment already exists for this booking
        let existingPayment = await prisma.payment.findUnique({
            where: { bookingId: booking.id }
        });

        if (existingPayment && existingPayment.status === 'SUCCEEDED') {
            return NextResponse.json({ message: 'Booking already paid' }, { status: 400 });
        }

        // If existing payment exists and is pending, try to reuse it
        if (existingPayment) {
            // If it's a mock payment, return the mock secret immediately
            if (existingPayment.stripePaymentIntent.startsWith('pi_mock_')) {
                return NextResponse.json({ clientSecret: `mock_secret_${existingPayment.stripePaymentIntent}` });
            }

            // Retrieve intent from Stripe for real payments
            try {
                const intent = await stripe.paymentIntents.retrieve(existingPayment.stripePaymentIntent);
                return NextResponse.json({ clientSecret: intent.client_secret });
            } catch (err) {
                console.error('Error retrieving existing payment intent:', err);
                // If we can't retrieve it (e.g. expired), delete the local record and create a new one
                await prisma.payment.delete({ where: { id: existingPayment.id } });
                existingPayment = null; // Clear the reference so we create a new one below
            }
        }

        // Create new payment intent (only if no existing payment)
        const isMockMode = process.env.STRIPE_SECRET_KEY?.includes('mock') || !process.env.STRIPE_SECRET_KEY;

        if (isMockMode) {
            console.log('⚠️ Using MOCK Payment Intent');
            const mockPayment = await prisma.payment.upsert({
                where: { bookingId: booking.id },
                update: {
                    stripePaymentIntent: `pi_mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                    amount: booking.totalAmount,
                    currency: booking.currency,
                    status: 'PENDING',
                },
                create: {
                    bookingId: booking.id,
                    stripePaymentIntent: `pi_mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                    amount: booking.totalAmount,
                    currency: booking.currency,
                    status: 'PENDING',
                },
            });
            return NextResponse.json({ clientSecret: `mock_secret_${mockPayment.stripePaymentIntent}` });
        }

        // Create real Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: booking.totalAmount,
            currency: booking.currency.toLowerCase(),
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                bookingId: booking.id,
            },
        });

        await prisma.payment.upsert({
            where: { bookingId: booking.id },
            update: {
                stripePaymentIntent: paymentIntent.id,
                amount: booking.totalAmount,
                currency: booking.currency,
                status: 'PENDING',
            },
            create: {
                bookingId: booking.id,
                stripePaymentIntent: paymentIntent.id,
                amount: booking.totalAmount,
                currency: booking.currency,
                status: 'PENDING',
            },
        });

        return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
        console.error('Error creating payment intent:', error);
        return NextResponse.json(
            { error: `Payment Error: ${error.message}` },
            { status: 500 }
        );
    }
}
