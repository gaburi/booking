/**
 * Email Templates - Brilliance Platform
 *
 * Professional, responsive email templates that match the platform design
 * Compatible with all major email clients
 */

export { getBaseEmailTemplate } from './base';
export type { EmailTemplateProps } from './base';

export { getBookingConfirmationEmail } from './booking-confirmation';
export type { BookingConfirmationData } from './booking-confirmation';

export { getSessionReminderEmail } from './session-reminder';
export type { SessionReminderData } from './session-reminder';

export { getBookingCancellationEmail } from './booking-cancellation';
export type { BookingCancellationData } from './booking-cancellation';

export { getPaymentConfirmationEmail } from './payment-confirmation';
export type { PaymentConfirmationData } from './payment-confirmation';

export { getAdminPasswordResetEmail } from './admin-password-reset';
export type { AdminPasswordResetData } from './admin-password-reset';

export { getWelcomeEmail } from './welcome-email';
export type { WelcomeEmailData } from './welcome-email';

export {
  getAdminNotificationEmail,
  getNewBookingNotificationEmail,
  getCancellationNotificationEmail,
  getPaymentFailedNotificationEmail,
  getLowAvailabilityNotificationEmail,
} from './admin-notification';
export type { AdminNotificationData } from './admin-notification';
