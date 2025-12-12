import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email';
import { getBookingConfirmationEmail } from '@/lib/email-templates/booking-confirmation';
import { getBookingCancellationEmail } from '@/lib/email-templates/booking-cancellation';
import { getSessionReminderEmail } from '@/lib/email-templates/session-reminder';
import { getPaymentConfirmationEmail } from '@/lib/email-templates/payment-confirmation';
import { getWelcomeEmail } from '@/lib/email-templates/welcome-email';
import { getAdminPasswordResetEmail } from '@/lib/email-templates/admin-password-reset';

export async function POST(req: NextRequest) {
    try {
        const { email, templateName, language } = await req.json();
        const lang = (language || 'pt') as 'pt' | 'en' | 'fr' | 'de';

        // Helper dummy data
        const dummyClient = { firstName: 'Gabriel', lastName: 'Oliveira' };
        const dummyDate = lang === 'pt' ? '12/12/2025' : '2025-12-12';
        const dummyTime = '14:30';

        const generators: Record<string, () => { subject: string, html: string }> = {
            'BOOKING_CONFIRMATION': () => ({
                subject: `[Test] Booking Confirmation (${lang.toUpperCase()})`,
                html: getBookingConfirmationEmail({
                    clientName: `${dummyClient.firstName} ${dummyClient.lastName}`,
                    sessionType: 'ONLINE',
                    date: dummyDate,
                    time: dummyTime,
                    duration: 60,
                    meetingLink: 'https://meet.google.com/test-link',
                    bookingReference: 'REF-TEST-001',
                    cancelUrl: 'https://brilliance.com/booking/manage/123',
                    language: lang
                })
            }),
            'BOOKING_CANCELLATION': () => ({
                subject: `[Test] Booking Cancellation (${lang.toUpperCase()})`,
                html: getBookingCancellationEmail({
                    clientName: dummyClient.firstName,
                    sessionType: 'ONLINE',
                    date: dummyDate,
                    time: dummyTime,
                    bookingReference: 'REF-TEST-001',
                    bookNewUrl: 'https://brilliance.com/booking',
                    cancellationReason: 'Conflict of schedule',
                    refundAmount: 150.00,
                    language: lang
                })
            }),
            'SESSION_REMINDER': () => ({
                subject: `[Test] Session Reminder`,
                html: getSessionReminderEmail({
                    clientName: dummyClient.firstName,
                    sessionType: 'ONLINE',
                    date: dummyDate,
                    time: dummyTime,
                    meetingLink: 'https://meet.google.com/test-link',
                    bookingReference: 'REF-TEST-001',
                    manageUrl: 'https://brilliance.com/booking/manage/123',
                    timeLeft: '24 hours'
                })
            }),
            'PAYMENT_CONFIRMATION': () => ({
                subject: `[Test] Payment Receipt`,
                html: getPaymentConfirmationEmail({
                    clientName: dummyClient.firstName,
                    amount: 49.99,
                    date: dummyDate,
                    bookingReference: 'REF-TEST-001',
                    receiptUrl: 'https://stripe.com/receipt/123',
                    sessionDate: `${dummyDate} ${dummyTime}`
                })
            }),
            'WELCOME_EMAIL': () => ({
                subject: `[Test] Welcome`,
                html: getWelcomeEmail({
                    clientName: dummyClient.firstName,
                    dashboardUrl: 'https://brilliance.com/dashboard',
                    profileUrl: 'https://brilliance.com/profile'
                })
            }),
            'ADMIN_PASSWORD_RESET': () => ({
                subject: `[Test] Admin Password Reset`,
                html: getAdminPasswordResetEmail({
                    resetUrl: 'https://brilliance.com/admin/reset?token=123',
                    ipAddress: '127.0.0.1',
                    validTime: '1 hour'
                })
            })
        };

        const templatesToSend: Array<{ subject: string, html: string }> = [];

        if (templateName === 'ALL') {
            Object.keys(generators).forEach(key => {
                templatesToSend.push(generators[key]());
            });
        } else if (generators[templateName]) {
            templatesToSend.push(generators[templateName]());
        } else {
            return NextResponse.json({ error: 'Invalid template name' }, { status: 400 });
        }

        let sentCount = 0;
        for (const tmpl of templatesToSend) {
            const sent = await emailService.sendEmail({
                to: email,
                subject: tmpl.subject,
                html: tmpl.html
            });
            if (sent) sentCount++;
        }

        const isMock = !process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY.startsWith('SG.mock') || process.env.SENDGRID_API_KEY === '';

        return NextResponse.json({
            success: true,
            sent: sentCount,
            total: templatesToSend.length,
            isMock,
            previewHtml: isMock && templatesToSend.length > 0 ? templatesToSend[0].html : undefined
        });

    } catch (error) {
        console.error('Test Email API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
