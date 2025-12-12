/**
 * Script de teste para gerar e visualizar os templates de email
 *
 * Execute: npx tsx src/lib/email-templates/test-templates.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  getBookingConfirmationEmail,
  getSessionReminderEmail,
  getBookingCancellationEmail,
  getPaymentConfirmationEmail,
  getAdminPasswordResetEmail,
  getWelcomeEmail,
  getNewBookingNotificationEmail,
} from './index';

// Diretório de saída
const OUTPUT_DIR = path.join(__dirname, 'generated-previews');

// Criar diretório se não existir
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function saveTemplate(filename: string, html: string) {
  const filepath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filepath, html, 'utf-8');
  console.log(`✅ Template salvo: ${filename}`);
}

console.log('🚀 Gerando templates de email...\n');

// 1. Confirmação de Agendamento - Presencial
const bookingConfirmationPresencial = getBookingConfirmationEmail({
  clientName: 'João Silva',
  sessionType: 'PRESENCIAL',
  date: '15 de Dezembro de 2025',
  time: '14:00',
  duration: 60,
  location: 'Clínica Centro',
  locationAddress: 'Rua das Flores, 123 - Centro, São Paulo - SP',
  bookingReference: 'BRL-2025-001',
  cancelUrl: 'https://brilliance.com/booking/cancel/abc123',
});
saveTemplate('01-booking-confirmation-presencial.html', bookingConfirmationPresencial);

// 2. Confirmação de Agendamento - Online
const bookingConfirmationOnline = getBookingConfirmationEmail({
  clientName: 'Maria Santos',
  sessionType: 'ONLINE',
  date: '18 de Dezembro de 2025',
  time: '10:00',
  duration: 90,
  meetingLink: 'https://meet.google.com/abc-defg-hij',
  bookingReference: 'BRL-2025-002',
  cancelUrl: 'https://brilliance.com/booking/cancel/def456',
});
saveTemplate('02-booking-confirmation-online.html', bookingConfirmationOnline);

// 3. Lembrete de Sessão - 24h antes
const sessionReminder24h = getSessionReminderEmail({
  clientName: 'Pedro Oliveira',
  sessionType: 'PRESENCIAL',
  date: '20 de Dezembro de 2025',
  time: '16:00',
  duration: 60,
  location: 'Clínica Sul',
  locationAddress: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
  bookingReference: 'BRL-2025-003',
  cancelUrl: 'https://brilliance.com/booking/cancel/ghi789',
  hoursUntilSession: 24,
});
saveTemplate('03-session-reminder-24h.html', sessionReminder24h);

// 4. Lembrete de Sessão - 2h antes (Online)
const sessionReminder2h = getSessionReminderEmail({
  clientName: 'Ana Costa',
  sessionType: 'ONLINE',
  date: '22 de Dezembro de 2025',
  time: '09:00',
  duration: 45,
  meetingLink: 'https://zoom.us/j/1234567890',
  bookingReference: 'BRL-2025-004',
  cancelUrl: 'https://brilliance.com/booking/cancel/jkl012',
  hoursUntilSession: 2,
});
saveTemplate('04-session-reminder-2h.html', sessionReminder2h);

// 5. Cancelamento com Reembolso
const cancellationWithRefund = getBookingCancellationEmail({
  clientName: 'Carlos Mendes',
  sessionType: 'PRESENCIAL',
  date: '25 de Dezembro de 2025',
  time: '11:00',
  location: 'Clínica Norte',
  bookingReference: 'BRL-2025-005',
  cancellationReason: 'Solicitado pelo cliente - Conflito de agenda',
  refundAmount: 150.0,
  bookNewUrl: 'https://brilliance.com/booking',
});
saveTemplate('05-cancellation-with-refund.html', cancellationWithRefund);

// 6. Cancelamento sem Reembolso
const cancellationNoRefund = getBookingCancellationEmail({
  clientName: 'Juliana Ferreira',
  sessionType: 'ONLINE',
  date: '28 de Dezembro de 2025',
  time: '14:30',
  bookingReference: 'BRL-2025-006',
  cancellationReason: 'Cancelamento tardio',
  refundAmount: 0,
  bookNewUrl: 'https://brilliance.com/booking',
});
saveTemplate('06-cancellation-no-refund.html', cancellationNoRefund);

// 7. Confirmação de Pagamento
const paymentConfirmation = getPaymentConfirmationEmail({
  clientName: 'Roberto Lima',
  sessionType: 'PRESENCIAL',
  date: '30 de Dezembro de 2025',
  time: '15:00',
  duration: 60,
  location: 'Clínica Oeste',
  bookingReference: 'BRL-2025-007',
  amount: 200.0,
  paymentMethod: 'Cartão de Crédito (Visa ****1234)',
  transactionId: 'TXN-2025-ABC123XYZ',
  receiptUrl: 'https://brilliance.com/receipts/abc123',
});
saveTemplate('07-payment-confirmation.html', paymentConfirmation);

// 8. Reset de Senha Admin
const passwordReset = getAdminPasswordResetEmail({
  adminName: 'Administrador',
  resetUrl: 'https://brilliance.com/admin/reset-password?token=secure-token-here-123456',
  expiresInHours: 1,
});
saveTemplate('08-admin-password-reset.html', passwordReset);

// 9. Email de Boas-vindas
const welcome = getWelcomeEmail({
  clientName: 'Fernanda Rocha',
  firstBookingUrl: 'https://brilliance.com/booking',
});
saveTemplate('09-welcome-email.html', welcome);

// 10. Notificação Admin - Novo Agendamento
const adminNewBooking = getNewBookingNotificationEmail({
  clientName: 'Lucas Almeida',
  clientEmail: 'lucas@example.com',
  sessionType: 'PRESENCIAL',
  date: '05 de Janeiro de 2026',
  time: '13:00',
  bookingId: 'booking-123456',
});
saveTemplate('10-admin-new-booking.html', adminNewBooking);

console.log(`\n✨ Todos os templates foram gerados com sucesso!`);
console.log(`📁 Arquivos salvos em: ${OUTPUT_DIR}\n`);
console.log('💡 Para visualizar:');
console.log('   1. Abra os arquivos .html em um navegador');
console.log('   2. Ou envie para seu email de teste');
console.log('   3. Ou use uma ferramenta como https://putsmail.com\n');
