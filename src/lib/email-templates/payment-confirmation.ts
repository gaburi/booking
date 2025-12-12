import { getBaseEmailTemplate } from './base';

export interface PaymentConfirmationData {
  clientName: string;
  sessionType: 'PRESENCIAL' | 'ONLINE';
  date: string;
  time: string;
  duration: number;
  location?: string;
  bookingReference: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  receiptUrl?: string;
}

export function getPaymentConfirmationEmail(data: PaymentConfirmationData): string {
  const {
    clientName,
    sessionType,
    date,
    time,
    duration,
    location,
    bookingReference,
    amount,
    paymentMethod,
    transactionId,
    receiptUrl,
  } = data;

  const content = `
    <h1>Pagamento Confirmado!</h1>

    <p>Olá <strong>${clientName}</strong>,</p>

    <p>
      Recebemos seu pagamento com sucesso! Seu agendamento está confirmado.
    </p>

    <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 20px; margin: 24px 0; border-radius: 6px;">
      <p style="margin: 0 0 8px 0; font-weight: 600; color: #065f46; font-size: 18px;">
        ✓ Pagamento Aprovado
      </p>
      <p style="margin: 0; color: #065f46; font-size: 24px; font-weight: 700;">
        R$ ${amount.toFixed(2)}
      </p>
    </div>

    <h2>Detalhes do Pagamento</h2>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Valor Pago</span>
        <span class="info-value">R$ ${amount.toFixed(2)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Método de Pagamento</span>
        <span class="info-value">${paymentMethod}</span>
      </div>
      <div class="info-row">
        <span class="info-label">ID da Transação</span>
        <span class="info-value">${transactionId}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Data do Pagamento</span>
        <span class="info-value">${new Date().toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</span>
      </div>
    </div>

    <div class="divider"></div>

    <h2>Detalhes da Sessão</h2>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Tipo de Sessão</span>
        <span class="info-value">${sessionType === 'PRESENCIAL' ? 'Presencial' : 'Online'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Data</span>
        <span class="info-value">${date}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Horário</span>
        <span class="info-value">${time}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Duração</span>
        <span class="info-value">${duration} minutos</span>
      </div>
      ${sessionType === 'PRESENCIAL' && location ? `
      <div class="info-row">
        <span class="info-label">Local</span>
        <span class="info-value">${location}</span>
      </div>
      ` : ''}
      <div class="info-row">
        <span class="info-label">Referência</span>
        <span class="info-value">${bookingReference}</span>
      </div>
    </div>

    ${receiptUrl ? `
    <a href="${receiptUrl}" class="button">
      Baixar Recibo
    </a>
    ` : ''}

    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 24px 0; border-radius: 6px;">
      <p style="margin: 0 0 8px 0; font-weight: 600; color: #1e40af;">
        📧 Próximos passos
      </p>
      <p style="margin: 0; color: #1e40af;">
        Você receberá um email de confirmação com todos os detalhes da sua sessão e um lembrete 24 horas antes do agendamento.
      </p>
    </div>

    <p style="margin-top: 32px; font-size: 14px; color: #6b7280;">
      Este recibo foi gerado automaticamente. Guarde-o para seus registros.
    </p>
  `;

  return getBaseEmailTemplate({
    title: 'Pagamento Confirmado - Brilliance',
    preheader: `Pagamento de R$ ${amount.toFixed(2)} confirmado`,
    content,
  });
}
