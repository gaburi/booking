import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emailService } from '@/lib/email';
import { processBookingConfirmation } from '@/lib/booking-service';

export async function POST(request: NextRequest) {
    try {
        const { bookingId, paymentIntentId } = await request.json();

        // Security check: only allow if env is mock
        if (!process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY?.includes('mock')) {
            return NextResponse.json({ error: 'Not in mock mode' }, { status: 403 });
        }

        // Update Payment
        const payment = await prisma.payment.update({
            where: { stripePaymentIntent: paymentIntentId },
            data: { status: 'SUCCEEDED', paymentMethod: 'mock_card' }
        });

        // Update Booking
        await prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'CONFIRMED' }
        });

        // Use shared service for confirmation logic (Coupon, Meet, Email)
        await processBookingConfirmation(bookingId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to confirm mock payment' }, { status: 500 });
    }
}
