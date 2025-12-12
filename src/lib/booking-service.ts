
import { prisma } from '@/lib/prisma';
import { emailService } from '@/lib/email';
import { googleMeetService } from '@/lib/google-meet';

export async function processBookingConfirmation(bookingId: string) {
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
    // Note: TS might complain if types aren't regenerated, casting to any for safety in this snippet
    const b = booking as any;
    if (b.couponCode) {
        try {
            await (prisma as any).coupon.update({
                where: { code: b.couponCode },
                data: { usedCount: { increment: 1 } }
            });
            console.log(`Coupon ${b.couponCode} usage incremented.`);
        } catch (e) {
            console.error(`Failed to increment coupon ${b.couponCode}`, e);
        }
    }

    // 3. Create Google Meet if Online
    let meetLink = '';
    if (booking.type === 'ONLINE') {
        try {
            // Construct proper date object combining date and time
            const datePart = booking.slot.date.toISOString().split('T')[0];
            const timePart = booking.slot.time;
            const startDateTime = new Date(`${datePart}T${timePart}:00`);

            const meet = await googleMeetService.createMeeting(
                booking.id,
                'Sessão Brilliance (' + booking.firstName + ')',
                'Sessão de Terapia Multidimensional',
                startDateTime,
                booking.slot.duration || 60,
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
