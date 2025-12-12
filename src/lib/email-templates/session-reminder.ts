import { getBaseEmailTemplate } from './base';

export interface SessionReminderData {
  clientName: string;
  sessionType: 'PRESENCIAL' | 'ONLINE';
  date: string;
  time: string;
  duration: number;
  location?: string;
  locationAddress?: string;
  meetingLink?: string;
  bookingReference: string;
  cancelUrl: string;
  hoursUntilSession: number;
}

export function getSessionReminderEmail(data: SessionReminderData): string {
  const {
    clientName,
    sessionType,
    date,
    time,
    duration,
    location,
    locationAddress,
    meetingLink,
    bookingReference,
    cancelUrl,
    hoursUntilSession,
  } = data;

  const reminderText = hoursUntilSession <= 2
    ? 'Sua sessão começa em breve!'
    : 'Lembrete: Sua sessão é amanhã!';

  const content = `
    <h1>${reminderText}</h1>

    <p>Olá <strong>${clientName}</strong>,</p>

    <p>
      Este é um lembrete amigável sobre sua sessão ${sessionType === 'PRESENCIAL' ? 'presencial' : 'online'} agendada.
    </p>

    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 24px 0; border-radius: 6px;">
      <p style="margin: 0; font-weight: 600; color: #92400e;">
        ⏰ ${hoursUntilSession <= 2 ? `Sua sessão começa em aproximadamente ${hoursUntilSession} ${hoursUntilSession === 1 ? 'hora' : 'horas'}` : 'Sua sessão é amanhã'}
      </p>
    </div>

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
      ${locationAddress ? `
      <div class="info-row">
        <span class="info-label">Endereço</span>
        <span class="info-value">${locationAddress}</span>
      </div>
      ` : ''}
      ` : ''}
      <div class="info-row">
        <span class="info-label">Referência</span>
        <span class="info-value">${bookingReference}</span>
      </div>
    </div>

    ${sessionType === 'ONLINE' && meetingLink ? `
    <h2 style="margin-top: 32px;">Acesse sua reunião online</h2>
    <p>
      Clique no botão abaixo para entrar na reunião. Recomendamos acessar 5 minutos antes do horário.
    </p>

    <a href="${meetingLink}" class="button">
      Entrar na Reunião
    </a>

    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 24px 0; border-radius: 6px;">
      <p style="margin: 0 0 8px 0; font-weight: 600; color: #1e40af;">
        Dicas para a reunião online:
      </p>
      <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
        <li>Teste sua câmera e microfone antes</li>
        <li>Escolha um local tranquilo e bem iluminado</li>
        <li>Tenha uma conexão estável de internet</li>
      </ul>
    </div>
    ` : `
    <h2 style="margin-top: 32px;">Preparação para a sessão presencial</h2>
    <p>
      Chegue com 10 minutos de antecedência para facilitar o check-in.
    </p>

    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 24px 0; border-radius: 6px;">
      <p style="margin: 0 0 8px 0; font-weight: 600; color: #1e40af;">
        O que trazer:
      </p>
      <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
        <li>Documento de identificação</li>
        <li>Materiais necessários</li>
        <li>Chegar 10 minutos antes</li>
      </ul>
    </div>
    `}

    <div class="divider"></div>

    <h2>Precisa reagendar ou cancelar?</h2>
    <p>
      Ainda é possível fazer alterações no seu agendamento.
    </p>

    <a href="${cancelUrl}" class="button" style="background-color: #6b7280;">
      Gerenciar Agendamento
    </a>

    <p style="margin-top: 32px; font-size: 14px; color: #6b7280;">
      Estamos ansiosos para encontrá-lo!
    </p>
  `;

  return getBaseEmailTemplate({
    title: 'Lembrete de Sessão - Brilliance',
    preheader: `Sua sessão é ${hoursUntilSession <= 2 ? 'em breve' : 'amanhã'} - ${date} às ${time}`,
    content,
  });
}
