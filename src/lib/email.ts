
import { prisma } from './prisma';
import { generateCalendarInvite } from './icalendar';
import { ICalCalendarMethod } from 'ical-generator';
import { getBookingConfirmationEmail } from './email-templates/booking-confirmation';
import { getBookingCancellationEmail } from './email-templates/booking-cancellation';

const SENDGRID_API_URL = 'https://api.sendgrid.com/v3/mail/send';
const ADMIN_EMAIL = 'info@brilance.international';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

interface EmailData {
    to: string;
    subject: string;
    html: string;
    attachments?: Array<{
        content: string; // Base64 encoded string
        filename: string;
        type: string;
        disposition: 'attachment' | 'inline';
    }>;
}

export class EmailService {
    private apiKey: string;
    private fromEmail: string;

    constructor() {
        this.apiKey = process.env.SENDGRID_API_KEY || '';
        this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@sessionbooking.com';
    }

    async sendEmail(data: EmailData): Promise<boolean> {
        // Send copy to admin if it's not already to admin
        const recipients = [{ email: data.to }];
        if (data.to !== ADMIN_EMAIL) {
            recipients.push({ email: ADMIN_EMAIL });
        }

        if (!this.apiKey || this.apiKey.startsWith('SG.mock') || this.apiKey === '') {
            console.log('📧 [MOCK EMAIL] To:', data.to);
            console.log('   Subject:', data.subject);
            console.log('   Content Truncated:', data.html.substring(0, 50) + '...');
            if (data.attachments) {
                console.log('   Attachments:', data.attachments.map(a => a.filename).join(', '));
            }
            return true;
        }

        try {
            const response = await fetch(SENDGRID_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    personalizations: [
                        {
                            to: recipients,
                        },
                    ],
                    from: { email: this.fromEmail },
                    subject: data.subject,
                    content: [{ type: 'text/html', value: data.html }],
                    attachments: data.attachments,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('SendGrid Error:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Email Send Error:', error);
            return false;
        }
    }

    private async getTemplate(name: string, defaultSubject: string, defaultHtml: string): Promise<{ subject: string; html: string }> {
        try {
            // Safety check for stale Prisma client
            if (!prisma.emailTemplate) {
                console.warn('Prisma Client stale: emailTemplate table not found. Using defaults.');
                throw new Error('Table not found');
            }

            const template = await prisma.emailTemplate.findUnique({
                where: { name },
            });
            if (template && template.isActive) {
                return { subject: template.subject, html: template.htmlContent };
            }
        } catch (error) {
            console.warn(`Template ${name} not found or DB error, using default.`);
        }
        return { subject: defaultSubject, html: defaultHtml };
    }

    private applyVariables(text: string, variables: Record<string, any>): string {
        let result = text;
        for (const [key, value] of Object.entries(variables)) {
            result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value || ''));
        }
        return result;
    }

    async sendBookingConfirmation(booking: any): Promise<boolean> {
        const localeMap: Record<string, string> = { pt: 'pt-BR', en: 'en-US', fr: 'fr-FR', de: 'de-CH' };
        const lang = (booking.language || 'pt') as 'pt' | 'en' | 'fr' | 'de';
        const locale = localeMap[lang] || 'pt-BR';

        // Generate Default HTML using new Template System
        const defaultHtml = getBookingConfirmationEmail({
            clientName: `${booking.firstName} ${booking.lastName}`,
            sessionType: booking.type === 'ONLINE' ? 'ONLINE' : 'PRESENCIAL',
            date: new Date(booking.slot.date).toLocaleDateString(locale),
            time: booking.slot.time,
            duration: booking.slot.duration, // 60
            location: 'Consultório Principal', // Default location if missing
            bookingReference: booking.id.substring(0, 8).toUpperCase(),
            cancelUrl: `${BASE_URL}/booking/manage/${booking.id}`,
            meetingLink: booking.googleMeetEvent?.meetLink,
            language: lang
        });

        const { subject: tmplSubject, html: tmplHtml } = await this.getTemplate(
            'BOOKING_CONFIRMATION',
            'Reserva Confirmada: {{type}}',
            defaultHtml
        );

        const variables = {
            firstName: booking.firstName,
            lastName: booking.lastName,
            date: new Date(booking.slot?.date).toLocaleDateString(locale),
            time: booking.slot?.time,
            type: booking.type,
            link: booking.googleMeetEvent?.meetLink || 'N/A',
        };

        const subject = this.applyVariables(tmplSubject, variables);
        // If template is from DB, apply variables. If it's the defaultHtml, it's already rendered.
        // Simple check: if tmplHtml === defaultHtml, don't apply variables (or apply them safely, though defaultHtml has no {{}} likely).
        // Actually, the defaultHtml from getBookingConfirmationEmail does NOT use {{vars}}, it uses literal values.
        // But if DB template is used, it DOES use {{vars}}.
        const html = tmplHtml === defaultHtml ? defaultHtml : this.applyVariables(tmplHtml, variables);

        // Generate ICS Attachment
        const icsString = generateCalendarInvite({
            id: booking.id,
            startTime: new Date(`${booking.slot.date.toISOString().split('T')[0]}T${booking.slot.time}:00`),
            endTime: new Date(new Date(`${booking.slot.date.toISOString().split('T')[0]}T${booking.slot.time}:00`).getTime() + (booking.slot.duration * 60000)),
            summary: `Session (${booking.type}): ${booking.firstName}`,
            description: `Session with ${booking.firstName} ${booking.lastName}. Type: ${booking.type}. Notes: ${booking.notes || 'None'}`,
            location: booking.type === 'ONLINE' ? (booking.googleMeetEvent?.meetLink || 'Online') : 'Presencial',
            url: booking.googleMeetEvent?.meetLink || '',
            organizer: { name: 'Brilance', email: this.fromEmail },
            attendee: { name: booking.firstName, email: booking.email }
        });

        return this.sendEmail({
            to: booking.email,
            subject,
            html,
            attachments: [
                {
                    content: Buffer.from(icsString).toString('base64'),
                    filename: 'invite.ics',
                    type: 'text/calendar',
                    disposition: 'attachment'
                }
            ]
        });
    }

    async sendCancellationEmail(email: string, booking: any): Promise<boolean> {
        const localeMap: Record<string, string> = { pt: 'pt-BR', en: 'en-US', fr: 'fr-FR', de: 'de-CH' };
        const lang = (booking.language || 'pt') as 'pt' | 'en' | 'fr' | 'de';
        const locale = localeMap[lang] || 'pt-BR';

        // Generate Default HTML
        const defaultHtml = getBookingCancellationEmail({
            clientName: `${booking.firstName} ${booking.lastName}`,
            sessionType: booking.type === 'ONLINE' ? 'ONLINE' : 'PRESENCIAL',
            date: new Date(booking.slot.date).toLocaleDateString(locale),
            time: booking.slot.time,
            bookingReference: booking.id.substring(0, 8).toUpperCase(),
            bookNewUrl: `${BASE_URL}/booking/new`, // Redirect to booking page
            cancellationReason: booking.cancellationReason,
            refundAmount: booking.payment?.refundAmount ? booking.payment.refundAmount / 100 : undefined,
            language: lang
        });

        const { subject: tmplSubject, html: tmplHtml } = await this.getTemplate(
            'BOOKING_CANCELLATION',
            'Reserva Cancelada: {{date}}',
            defaultHtml
        );

        const variables = {
            firstName: booking.firstName,
            date: new Date(booking.slot?.date).toLocaleDateString(locale),
            time: booking.slot?.time,
        };

        const subject = this.applyVariables(tmplSubject, variables);
        const html = tmplHtml === defaultHtml ? defaultHtml : this.applyVariables(tmplHtml, variables);

        // Generate ICS Cancellation
        const icsString = generateCalendarInvite({
            id: booking.id, // SAME ID
            startTime: new Date(`${booking.slot.date.toISOString().split('T')[0]}T${booking.slot.time}:00`),
            endTime: new Date(new Date(`${booking.slot.date.toISOString().split('T')[0]}T${booking.slot.time}:00`).getTime() + (booking.slot.duration * 60000)),
            summary: `CANCELLED: Session (${booking.type}): ${booking.firstName}`,
            description: `Session Cancelled`,
            location: 'N/A',
            url: '',
            organizer: { name: 'Brilance', email: this.fromEmail },
            attendee: { name: booking.firstName, email: email }
        }, ICalCalendarMethod.CANCEL);

        return this.sendEmail({
            to: email,
            subject,
            html,
            attachments: [
                {
                    content: Buffer.from(icsString).toString('base64'),
                    filename: 'cancel.ics',
                    type: 'text/calendar',
                    disposition: 'attachment'
                }
            ]
        });
    }

    async sendReminder(booking: any): Promise<boolean> {
        // Similar logic, using template 'BOOKING_REMINDER'
        return true; // Simplified for now
    }
}

export const emailService = new EmailService();
