import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { emailService } from '@/lib/email';


export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const { reason } = await request.json();

        // 1. Fetch booking with slot and payment info
        const booking = await prisma.booking.findUnique({
            where: { id },
            include: {
                slot: {
                    include: { location: true }
                },
                payment: true,
                googleMeetEvent: true, // Fetch google meet info if exists
            },
        });

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        if (booking.status === 'CANCELLED') {
            return NextResponse.json({ error: 'Booking is already cancelled' }, { status: 400 });
        }

        // 2. Check time constraints (24h rule)
        const sessionDate = new Date(`${booking.slot?.date.toISOString().split('T')[0]}T${booking.slot?.time}:00`);
        const now = new Date();
        const hoursUntilSession = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        let refundStatus = 'NO_REFUND';
        if (booking.status === 'CONFIRMED' && hoursUntilSession >= 24) {
            refundStatus = 'FULL_REFUND';
        }

        // 3. Process Refund if applicable
        if (refundStatus === 'FULL_REFUND' && booking.payment?.stripePaymentIntent) {
            try {
                // If it's a mock payment, we don't actually call Stripe refund with ID
                if (!booking.payment.stripePaymentIntent.startsWith('pi_mock_')) {
                    await stripe.refunds.create({
                        payment_intent: booking.payment.stripePaymentIntent,
                        reason: 'requested_by_customer',
                    });
                }

                // Update Local Payment Record
                await prisma.payment.update({
                    where: { id: booking.payment.id },
                    data: {
                        refundedAt: new Date(),
                        refundAmount: booking.payment.amount,
                        refundReason: 'Customer Cancellation > 24h',
                        status: 'REFUNDED'
                    } as any
                });
            } catch (stripeError) {
                console.error('Stripe refund failed:', stripeError);
                // Continue with cancellation but log error, maybe manual refund needed
            }
        }

        // 4. Update Booking Status
        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: {
                status: 'CANCELLED',
                cancelledAt: new Date(),
                cancellationReason: reason,
            } as any,
        });

        // 5. Free up the slot
        await prisma.availabilitySlot.update({
            where: { id: booking.slotId },
            data: { status: 'AVAILABLE' }
        });

        // 6. Send Email Confirmation
        const finalPayment = booking.payment ? {
            ...booking.payment,
            refundAmount: refundStatus === 'FULL_REFUND' ? booking.payment.amount : ((booking.payment as any).refundAmount || 0)
        } : null;

        await emailService.sendCancellationEmail(booking.email, {
            ...booking,
            payment: finalPayment,
            refundStatus
        });

        return NextResponse.json({
            message: 'Booking cancelled successfully',
            refundStatus,
            booking: updatedBooking
        });

    } catch (error) {
        console.error('Error cancelling booking:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
