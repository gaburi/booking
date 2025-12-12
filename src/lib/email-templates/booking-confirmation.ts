import { getBaseEmailTemplate } from './base';

export interface BookingConfirmationData {
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
  language?: 'pt' | 'en' | 'fr' | 'de';
}

const translations = {
  pt: {
    title: 'Agendamento Confirmado!',
    preheader: 'Sua sessão está confirmada para {{date}} às {{time}}',
    greeting: 'Olá',
    message: 'Seu agendamento foi confirmado com sucesso. Estamos ansiosos para nossa sessão!',
    labels: {
      type: 'Tipo de Sessão',
      date: 'Data',
      time: 'Horário',
      duration: 'Duração',
      location: 'Local',
      address: 'Endereço',
      reference: 'Referência',
      minutes: 'minutos',
      online: 'Link da Reunião Online'
    },
    online: 'Online',
    presencial: 'Presencial',
    bring: {
      title: 'O que trazer?',
      text: 'Por favor, chegue com 10 minutos de antecedência. Traga seu documento de identificação e qualquer material que julgar necessário.'
    },
    join: {
      title: 'Como participar?',
      text: 'Acesse o link da reunião 5 minutos antes do horário agendado. Certifique-se de que sua câmera e microfone estejam funcionando.'
    },
    manage: {
      title: 'Precisa reagendar ou cancelar?',
      text: 'Se precisar fazer alterações, utilize o botão abaixo. Pedimos que cancele com pelo menos 24 horas de antecedência.',
      button: 'Gerenciar Agendamento'
    },
    reminder: 'Você receberá um lembrete 24 horas antes da sua sessão.'
  },
  en: {
    title: 'Appointment Confirmed!',
    preheader: 'Your session is confirmed for {{date}} at {{time}}',
    greeting: 'Hello',
    message: 'Your appointment has been successfully confirmed. We look forward to our session!',
    labels: {
      type: 'Session Type',
      date: 'Date',
      time: 'Time',
      duration: 'Duration',
      location: 'Location',
      address: 'Address',
      reference: 'Reference',
      minutes: 'minutes',
      online: 'Online Meeting Link'
    },
    online: 'Online',
    presencial: 'In-Person',
    bring: {
      title: 'What to bring?',
      text: 'Please arrive 10 minutes early. Bring your ID and any materials you deem necessary.'
    },
    join: {
      title: 'How to join?',
      text: 'Access the meeting link 5 minutes before the scheduled time. Please ensure your camera and microphone are working.'
    },
    manage: {
      title: 'Need to reschedule or cancel?',
      text: 'If you need to make changes, use the button below. Please cancel at least 24 hours in advance.',
      button: 'Manage Booking'
    },
    reminder: 'You will receive a reminder 24 hours before your session.'
  },
  fr: {
    title: 'Rendez-vous confirmé !',
    preheader: 'Votre séance est confirmée pour le {{date}} à {{time}}',
    greeting: 'Bonjour',
    message: 'Votre rendez-vous a été confirmé avec succès. Nous avons hâte de vous voir !',
    labels: {
      type: 'Type de séance',
      date: 'Date',
      time: 'Heure',
      duration: 'Durée',
      location: 'Lieu',
      address: 'Adresse',
      reference: 'Référence',
      minutes: 'minutes',
      online: 'Lien de réunion'
    },
    online: 'En ligne',
    presencial: 'En personne',
    bring: {
      title: 'Ce qu\'il faut apporter',
      text: 'Veuillez arriver 10 minutes à l\'avance. Apportez votre pièce d\'identité et tout matériel nécessaire.'
    },
    join: {
      title: 'Comment participer ?',
      text: 'Accédez au lien de la réunion 5 minutes avant l\'heure prévue. Assurez-vous que votre caméra et votre microphone fonctionnent.'
    },
    manage: {
      title: 'Modifier ou annuler ?',
      text: 'Si vous devez apporter des modifications, utilisez le bouton ci-dessous. Veuillez annuler au moins 24 heures à l\'avance.',
      button: 'Gérer le rendez-vous'
    },
    reminder: 'Vous recevrez un rappel 24 heures avant votre séance.'
  },
  de: {
    title: 'Termin bestätigt!',
    preheader: 'Ihre Sitzung ist für {{date}} um {{time}} bestätigt',
    greeting: 'Guten Tag',
    message: 'Ihr Termin wurde erfolgreich bestätigt. Wir freuen uns auf unsere Sitzung!',
    labels: {
      type: 'Sitzungsart',
      date: 'Datum',
      time: 'Zeit',
      duration: 'Dauer',
      location: 'Ort',
      address: 'Adresse',
      reference: 'Referenz',
      minutes: 'Minuten',
      online: 'Online-Meeting-Link'
    },
    online: 'Online',
    presencial: 'Vor Ort',
    bring: {
      title: 'Was mitbringen?',
      text: 'Bitte kommen Sie 10 Minuten früher. Bringen Sie Ihren Ausweis und alle notwendigen Unterlagen mit.'
    },
    join: {
      title: 'Wie teilnehmen?',
      text: 'Rufen Sie den Meeting-Link 5 Minuten vor der geplanten Zeit auf. Bitte stellen Sie sicher, dass Kamera und Mikrofon funktionieren.'
    },
    manage: {
      title: 'Verschieben oder absagen?',
      text: 'Wenn Sie Änderungen vornehmen müssen, verwenden Sie den Button unten. Bitte sagen Sie mindestens 24 Stunden vorher ab.',
      button: 'Buchung verwalten'
    },
    reminder: 'Sie erhalten 24 Stunden vor Ihrer Sitzung eine Erinnerung.'
  }
};

export function getBookingConfirmationEmail(data: BookingConfirmationData): string {
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
    language = 'pt'
  } = data;

  const t = translations[language] || translations.pt;

  const content = `
    <h1>${t.title}</h1>

    <p>${t.greeting} <strong>${clientName}</strong>,</p>

    <p>
      ${t.message}
    </p>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">${t.labels.type}</span>
        <span class="info-value">${sessionType === 'PRESENCIAL' ? t.presencial : t.online}</span>
      </div>
      <div class="info-row">
        <span class="info-label">${t.labels.date}</span>
        <span class="info-value">${date}</span>
      </div>
      <div class="info-row">
        <span class="info-label">${t.labels.time}</span>
        <span class="info-value">${time}</span>
      </div>
      <div class="info-row">
        <span class="info-label">${t.labels.duration}</span>
        <span class="info-value">${duration} ${t.labels.minutes}</span>
      </div>
      ${sessionType === 'PRESENCIAL' && location ? `
      <div class="info-row">
        <span class="info-label">${t.labels.location}</span>
        <span class="info-value">${location}</span>
      </div>
      ${locationAddress ? `
      <div class="info-row">
        <span class="info-label">${t.labels.address}</span>
        <span class="info-value">${locationAddress}</span>
      </div>
      ` : ''}
      ` : ''}
      <div class="info-row">
        <span class="info-label">${t.labels.reference}</span>
        <span class="info-value">${bookingReference}</span>
      </div>
    </div>

    ${sessionType === 'ONLINE' && meetingLink ? `
    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 24px 0; border-radius: 6px;">
      <p style="margin: 0 0 12px 0; font-weight: 600; color: #1e40af;">
        ${t.labels.online}
      </p>
      <p style="margin: 0;">
        <a href="${meetingLink}" class="footer-link" style="word-break: break-all;">${meetingLink}</a>
      </p>
    </div>
    ` : ''}

    ${sessionType === 'PRESENCIAL' ? `
    <h2 style="margin-top: 32px;">${t.bring.title}</h2>
    <p>
      ${t.bring.text}
    </p>
    ` : `
    <h2 style="margin-top: 32px;">${t.join.title}</h2>
    <p>
      ${t.join.text}
    </p>
    `}

    <div class="divider"></div>

    <h2>${t.manage.title}</h2>
    <p>
      ${t.manage.text}
    </p>

    <a href="${cancelUrl}" class="button">
      ${t.manage.button}
    </a>

    <p style="margin-top: 32px; font-size: 14px; color: #6b7280;">
      ${t.reminder}
    </p>
  `;

  return getBaseEmailTemplate({
    title: `${t.title} - Brilliance`,
    preheader: t.preheader.replace('{{date}}', date).replace('{{time}}', time),
    content,
    language
  });
}
