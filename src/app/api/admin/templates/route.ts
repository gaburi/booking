import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { getBookingConfirmationEmail } from '@/lib/email-templates/booking-confirmation';
import { getBookingCancellationEmail } from '@/lib/email-templates/booking-cancellation';
import { getSessionReminderEmail } from '@/lib/email-templates/session-reminder';
import { getPaymentConfirmationEmail } from '@/lib/email-templates/payment-confirmation';
import { getWelcomeEmail } from '@/lib/email-templates/welcome-email';
import { getAdminPasswordResetEmail } from '@/lib/email-templates/admin-password-reset';

export async function GET(request: NextRequest) {
    try {
        if (!(prisma as any).emailTemplate) {
            return NextResponse.json([]);
        }
        const dbTemplates = await (prisma as any).emailTemplate.findMany();

        const defaults = [
            {
                name: 'BOOKING_CONFIRMATION',
                subject: 'Reserva Confirmada: {{type}}',
                htmlContent: getBookingConfirmationEmail({
                    clientName: '{{firstName}} {{lastName}}',
                    sessionType: 'ONLINE',
                    date: '{{date}}',
                    time: '{{time}}',
                    duration: 60,
                    meetingLink: '{{link}}',
                    bookingReference: 'REF-000',
                    cancelUrl: '{{cancelUrl}}'
                })
            },
            {
                name: 'BOOKING_CANCELLATION',
                subject: 'Reserva Cancelada: {{date}}',
                htmlContent: getBookingCancellationEmail({
                    clientName: '{{firstName}}',
                    sessionType: 'ONLINE',
                    date: '{{date}}',
                    time: '{{time}}',
                    bookingReference: 'REF-000',
                    bookNewUrl: 'https://brilliance.com/booking',
                    cancellationReason: '{{reason}}',
                    refundAmount: 0
                })
            },
            {
                name: 'SESSION_REMINDER',
                subject: 'Lembrete: Sua sessão é amanhã',
                htmlContent: getSessionReminderEmail({
                    clientName: '{{firstName}}',
                    sessionType: 'ONLINE',
                    date: '{{date}}',
                    time: '{{time}}',
                    meetingLink: '{{link}}',
                    bookingReference: 'REF-000',
                    manageUrl: '{{manageUrl}}',
                    timeLeft: '24 horas'
                })
            },
            {
                name: 'PAYMENT_CONFIRMATION',
                subject: 'Pagamento Confirmado',
                htmlContent: getPaymentConfirmationEmail({
                    clientName: '{{firstName}}',
                    amount: 49.99,
                    date: '{{date}}',
                    bookingReference: 'REF-000',
                    receiptUrl: '{{receiptUrl}}',
                    sessionDate: '{{sessionDate}}'
                })
            },
            {
                name: 'WELCOME_EMAIL',
                subject: 'Bem-vindo à Brilliance!',
                htmlContent: getWelcomeEmail({
                    clientName: '{{firstName}}',
                    dashboardUrl: 'https://brilliance.com/dashboard',
                    profileUrl: 'https://brilliance.com/profile'
                })
            },
            {
                name: 'ADMIN_PASSWORD_RESET',
                subject: 'Redefinição de Senha - Admin',
                htmlContent: getAdminPasswordResetEmail({
                    resetUrl: '{{resetUrl}}',
                    ipAddress: '127.0.0.1',
                    validTime: '1 hora'
                })
            }
        ];

        // Merge: If DB has it, keep DB. If not, use default.
        const merged = defaults.map(def => {
            const existing = dbTemplates.find((t: any) => t.name === def.name);
            return existing || {
                id: 'default-' + def.name,
                ...def,
                isActive: true,
                updatedAt: new Date().toISOString()
            };
        });

        // Add any other custom templates stored in DB
        dbTemplates.forEach((t: any) => {
            if (!defaults.find(d => d.name === t.name)) {
                merged.push(t);
            }
        });

        return NextResponse.json(merged);
    } catch (error) {
        console.error('Template Fetch Error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!(prisma as any).emailTemplate) {
            return NextResponse.json({ error: 'System update pending restart.' }, { status: 503 });
        }

        // Upsert by name
        const template = await (prisma as any).emailTemplate.upsert({
            where: { name: body.name },
            update: {
                subject: body.subject,
                htmlContent: body.htmlContent
            },
            create: {
                name: body.name,
                subject: body.subject,
                htmlContent: body.htmlContent
            }
        });
        return NextResponse.json(template);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
