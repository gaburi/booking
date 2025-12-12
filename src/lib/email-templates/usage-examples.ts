/**
 * Exemplos práticos de uso dos templates de email
 *
 * Este arquivo demonstra como integrar os templates com a lógica da plataforma
 */

import {
  getBookingConfirmationEmail,
  getSessionReminderEmail,
  getBookingCancellationEmail,
  getPaymentConfirmationEmail,
  getAdminPasswordResetEmail,
} from './index';

// Função helper para formatar data
function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

// Função helper para formatar horário
function formatTime(time: string): string {
  return time; // Já vem no formato "HH:mm"
}

/**
 * Exemplo 1: Email de confirmação após criação de agendamento
 */
export async function sendBookingConfirmationExample(bookingId: string) {
  // Buscar dados do agendamento no banco
  const booking = {
    id: bookingId,
    clientName: 'João Silva',
    clientEmail: 'joao@example.com',
    sessionType: 'PRESENCIAL' as const,
    date: new Date('2025-12-15'),
    time: '14:00',
    duration: 60,
    location: {
      name: 'Clínica Centro',
      address: 'Rua das Flores, 123 - São Paulo, SP',
    },
  };

  const html = getBookingConfirmationEmail({
    clientName: booking.clientName,
    sessionType: booking.sessionType,
    date: formatDate(booking.date),
    time: formatTime(booking.time),
    duration: booking.duration,
    location: booking.location.name,
    locationAddress: booking.location.address,
    bookingReference: `BRL-${booking.id.slice(0, 8).toUpperCase()}`,
    cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/booking/cancel/${booking.id}`,
  });

  // Enviar email (implementar com seu serviço de email)
  // await sendEmail({
  //   to: booking.clientEmail,
  //   subject: 'Agendamento Confirmado - Brilliance',
  //   html,
  // });

  return html;
}

/**
 * Exemplo 2: Email de lembrete 24h antes da sessão
 */
export async function sendSessionReminderExample(bookingId: string) {
  const booking = {
    id: bookingId,
    clientName: 'Maria Santos',
    clientEmail: 'maria@example.com',
    sessionType: 'ONLINE' as const,
    date: new Date('2025-12-16'),
    time: '10:00',
    duration: 60,
    meetingLink: 'https://meet.google.com/abc-defg-hij',
  };

  const hoursUntilSession = Math.round(
    (booking.date.getTime() - Date.now()) / (1000 * 60 * 60)
  );

  const html = getSessionReminderEmail({
    clientName: booking.clientName,
    sessionType: booking.sessionType,
    date: formatDate(booking.date),
    time: formatTime(booking.time),
    duration: booking.duration,
    meetingLink: booking.meetingLink,
    bookingReference: `BRL-${booking.id.slice(0, 8).toUpperCase()}`,
    cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/booking/cancel/${booking.id}`,
    hoursUntilSession,
  });

  return html;
}

/**
 * Exemplo 3: Email de cancelamento com reembolso
 */
export async function sendCancellationWithRefundExample(bookingId: string) {
  const booking = {
    id: bookingId,
    clientName: 'Pedro Oliveira',
    clientEmail: 'pedro@example.com',
    sessionType: 'PRESENCIAL' as const,
    date: new Date('2025-12-20'),
    time: '15:00',
    location: 'Clínica Sul',
    amount: 150.0,
    cancelledWithin24Hours: true,
  };

  const html = getBookingCancellationEmail({
    clientName: booking.clientName,
    sessionType: booking.sessionType,
    date: formatDate(booking.date),
    time: formatTime(booking.time),
    location: booking.location,
    bookingReference: `BRL-${booking.id.slice(0, 8).toUpperCase()}`,
    cancellationReason: 'Solicitado pelo cliente',
    refundAmount: booking.cancelledWithin24Hours ? booking.amount : 0,
    bookNewUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/booking`,
  });

  return html;
}

/**
 * Exemplo 4: Email de confirmação de pagamento
 */
export async function sendPaymentConfirmationExample(paymentId: string) {
  const payment = {
    id: paymentId,
    bookingId: 'booking-123',
    clientName: 'Ana Costa',
    clientEmail: 'ana@example.com',
    amount: 200.0,
    paymentMethod: 'Cartão de Crédito (Visa ****1234)',
    transactionId: 'TXN-2025-ABC123',
    booking: {
      sessionType: 'ONLINE' as const,
      date: new Date('2025-12-18'),
      time: '09:00',
      duration: 90,
    },
  };

  const html = getPaymentConfirmationEmail({
    clientName: payment.clientName,
    sessionType: payment.booking.sessionType,
    date: formatDate(payment.booking.date),
    time: formatTime(payment.booking.time),
    duration: payment.booking.duration,
    bookingReference: `BRL-${payment.bookingId.slice(0, 8).toUpperCase()}`,
    amount: payment.amount,
    paymentMethod: payment.paymentMethod,
    transactionId: payment.transactionId,
    receiptUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/receipts/${payment.id}`,
  });

  return html;
}

/**
 * Exemplo 5: Email de redefinição de senha do admin
 */
export async function sendAdminPasswordResetExample(adminEmail: string) {
  const resetToken = 'generated-secure-token-here';
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/admin/reset-password?token=${resetToken}`;

  const html = getAdminPasswordResetEmail({
    adminName: 'Administrador',
    resetUrl,
    expiresInHours: 1,
  });

  // await sendEmail({
  //   to: adminEmail,
  //   subject: 'Redefinição de Senha - Brilliance Admin',
  //   html,
  // });

  return html;
}

/**
 * Exemplo 6: Job para enviar lembretes automáticos
 * Execute este job a cada hora para enviar lembretes 24h antes
 */
export async function sendAutomatedRemindersJob() {
  // Buscar agendamentos que começam em 24 horas
  const tomorrow = new Date();
  tomorrow.setHours(tomorrow.getHours() + 24);

  // Exemplo de query (adapte para seu ORM)
  // const upcomingBookings = await prisma.booking.findMany({
  //   where: {
  //     date: {
  //       gte: new Date(tomorrow.setHours(0, 0, 0, 0)),
  //       lt: new Date(tomorrow.setHours(23, 59, 59, 999)),
  //     },
  //     reminderSent: false,
  //     status: 'CONFIRMED',
  //   },
  //   include: {
  //     location: true,
  //   },
  // });

  // Para cada agendamento, enviar lembrete
  // for (const booking of upcomingBookings) {
  //   const html = getSessionReminderEmail({
  //     clientName: booking.clientName,
  //     sessionType: booking.sessionType,
  //     date: formatDate(booking.date),
  //     time: booking.time,
  //     duration: booking.duration,
  //     location: booking.location?.name,
  //     meetingLink: booking.meetingLink,
  //     bookingReference: `BRL-${booking.id.slice(0, 8).toUpperCase()}`,
  //     cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/booking/cancel/${booking.id}`,
  //     hoursUntilSession: 24,
  //   });
  //
  //   await sendEmail({
  //     to: booking.clientEmail,
  //     subject: 'Lembrete: Sua sessão é amanhã - Brilliance',
  //     html,
  //   });
  //
  //   await prisma.booking.update({
  //     where: { id: booking.id },
  //     data: { reminderSent: true },
  //   });
  // }
}
