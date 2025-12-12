import { getBaseEmailTemplate } from './base';

export interface AdminNotificationData {
  subject: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
  priority?: 'low' | 'medium' | 'high';
  metadata?: Array<{ label: string; value: string }>;
}

export function getAdminNotificationEmail(data: AdminNotificationData): string {
  const {
    subject,
    message,
    actionLabel,
    actionUrl,
    priority = 'medium',
    metadata,
  } = data;

  const priorityConfig = {
    low: {
      color: '#3b82f6',
      bgColor: '#eff6ff',
      label: 'Informação',
      icon: 'ℹ️',
    },
    medium: {
      color: '#f59e0b',
      bgColor: '#fef3c7',
      label: 'Atenção',
      icon: '⚠️',
    },
    high: {
      color: '#ef4444',
      bgColor: '#fee2e2',
      label: 'Urgente',
      icon: '🚨',
    },
  };

  const config = priorityConfig[priority];

  const content = `
    <div style="background-color: ${config.bgColor}; border-left: 4px solid ${config.color}; padding: 20px; margin: 0 0 32px 0; border-radius: 6px;">
      <p style="margin: 0; font-weight: 600; color: ${config.color};">
        ${config.icon} ${config.label}
      </p>
    </div>

    <h1>${subject}</h1>

    <div style="font-size: 16px; line-height: 1.6; color: #4b5563;">
      ${message.split('\n').map(line => `<p>${line}</p>`).join('')}
    </div>

    ${metadata && metadata.length > 0 ? `
    <div class="info-box" style="margin: 32px 0;">
      ${metadata.map(item => `
        <div class="info-row">
          <span class="info-label">${item.label}</span>
          <span class="info-value">${item.value}</span>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${actionLabel && actionUrl ? `
    <div style="margin: 32px 0; text-align: center;">
      <a href="${actionUrl}" class="button">
        ${actionLabel}
      </a>
    </div>
    ` : ''}

    <div class="divider"></div>

    <p style="font-size: 14px; color: #6b7280;">
      Esta é uma notificação automática do sistema Brilliance.
    </p>
  `;

  return getBaseEmailTemplate({
    title: `Admin: ${subject}`,
    preheader: message.substring(0, 100),
    content,
  });
}

// Exemplos de uso predefinidos para notificações comuns

export function getNewBookingNotificationEmail(bookingData: {
  clientName: string;
  clientEmail: string;
  sessionType: string;
  date: string;
  time: string;
  bookingId: string;
}) {
  return getAdminNotificationEmail({
    subject: 'Novo Agendamento Recebido',
    message: `Um novo agendamento foi criado por ${bookingData.clientName}.`,
    priority: 'medium',
    metadata: [
      { label: 'Cliente', value: bookingData.clientName },
      { label: 'Email', value: bookingData.clientEmail },
      { label: 'Tipo', value: bookingData.sessionType },
      { label: 'Data', value: bookingData.date },
      { label: 'Horário', value: bookingData.time },
    ],
    actionLabel: 'Ver Agendamento',
    actionUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/bookings?id=${bookingData.bookingId}`,
  });
}

export function getCancellationNotificationEmail(cancellationData: {
  clientName: string;
  sessionType: string;
  date: string;
  time: string;
  reason?: string;
  bookingId: string;
}) {
  return getAdminNotificationEmail({
    subject: 'Agendamento Cancelado',
    message: `O agendamento de ${cancellationData.clientName} foi cancelado.`,
    priority: 'low',
    metadata: [
      { label: 'Cliente', value: cancellationData.clientName },
      { label: 'Tipo', value: cancellationData.sessionType },
      { label: 'Data', value: cancellationData.date },
      { label: 'Horário', value: cancellationData.time },
      ...(cancellationData.reason ? [{ label: 'Motivo', value: cancellationData.reason }] : []),
    ],
    actionLabel: 'Ver Detalhes',
    actionUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/bookings?id=${cancellationData.bookingId}`,
  });
}

export function getPaymentFailedNotificationEmail(paymentData: {
  clientName: string;
  clientEmail: string;
  amount: number;
  errorMessage: string;
  bookingId: string;
}) {
  return getAdminNotificationEmail({
    subject: 'Falha no Pagamento',
    message: `Houve uma falha no processamento do pagamento de ${paymentData.clientName}.`,
    priority: 'high',
    metadata: [
      { label: 'Cliente', value: paymentData.clientName },
      { label: 'Email', value: paymentData.clientEmail },
      { label: 'Valor', value: `R$ ${paymentData.amount.toFixed(2)}` },
      { label: 'Erro', value: paymentData.errorMessage },
    ],
    actionLabel: 'Verificar Agendamento',
    actionUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/bookings?id=${paymentData.bookingId}`,
  });
}

export function getLowAvailabilityNotificationEmail(availabilityData: {
  sessionType: string;
  location?: string;
  remainingSlots: number;
  dateRange: string;
}) {
  return getAdminNotificationEmail({
    subject: 'Poucos Horários Disponíveis',
    message: `A disponibilidade está baixa para ${availabilityData.sessionType}${availabilityData.location ? ` em ${availabilityData.location}` : ''}.`,
    priority: 'medium',
    metadata: [
      { label: 'Tipo de Sessão', value: availabilityData.sessionType },
      ...(availabilityData.location ? [{ label: 'Local', value: availabilityData.location }] : []),
      { label: 'Horários Restantes', value: availabilityData.remainingSlots.toString() },
      { label: 'Período', value: availabilityData.dateRange },
    ],
    actionLabel: 'Adicionar Horários',
    actionUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/availability`,
  });
}
