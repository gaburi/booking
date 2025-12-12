import { getBaseEmailTemplate } from './base';

export interface BookingCancellationData {
  clientName: string;
  sessionType: 'PRESENCIAL' | 'ONLINE';
  date: string;
  time: string;
  location?: string;
  bookingReference: string;
  cancellationReason?: string;
  refundAmount?: number;
  bookNewUrl: string;
  language?: 'pt' | 'en' | 'fr' | 'de';
}

const translations = {
  pt: {
    title: 'Agendamento Cancelado',
    preheader: 'Seu agendamento para {{date}} foi cancelado',
    greeting: 'Olá',
    message: 'Seu agendamento foi cancelado com sucesso. Esperamos vê-lo em breve em uma nova sessão.',
    labels: {
      type: 'Tipo de Sessão',
      date: 'Data',
      time: 'Horário',
      location: 'Local',
      reference: 'Referência',
      reason: 'Motivo'
    },
    presencial: 'Presencial',
    online: 'Online',
    refund: {
      processed: '💰 Reembolso Processado',
      text: 'O valor de <strong>R$ {{amount}}</strong> será reembolsado em até 7 dias úteis, dependendo da operadora do seu cartão.',
      noRefund: 'Como este cancelamento foi realizado fora do prazo de reembolso, não haverá estorno de valores.'
    },
    newBooking: {
      title: 'Agende uma nova sessão',
      text: 'Ficamos tristes em ver você cancelar. Quando estiver pronto, teremos prazer em recebê-lo novamente.',
      button: 'Fazer Novo Agendamento'
    },
    contact: 'Se tiver alguma dúvida ou precisar de assistência, não hesite em entrar em contato conosco.'
  },
  en: {
    title: 'Booking Cancelled',
    preheader: 'Your appointment for {{date}} has been cancelled',
    greeting: 'Hello',
    message: 'Your appointment has been successfully cancelled. We hope to see you soon for a new session.',
    labels: {
      type: 'Session Type',
      date: 'Date',
      time: 'Time',
      location: 'Location',
      reference: 'Reference',
      reason: 'Reason'
    },
    presencial: 'In-Person',
    online: 'Online',
    refund: {
      processed: '💰 Refund Processed',
      text: 'The amount of <strong>€ {{amount}}</strong> will be refunded within 7 business days, depending on your card issuer.',
      noRefund: 'As this cancellation was made outside the refund period, no refund will be issued.'
    },
    newBooking: {
      title: 'Book a new session',
      text: 'We are sad to see you cancel. When you are ready, we will be happy to welcome you again.',
      button: 'Book New Session'
    },
    contact: 'If you have any questions or need assistance, please do not hesitate to contact us.'
  },
  fr: {
    title: 'Rendez-vous annulé',
    preheader: 'Votre rendez-vous pour le {{date}} a été annulé',
    greeting: 'Bonjour',
    message: 'Votre rendez-vous a été annulé avec succès. Nous espérons vous revoir bientôt pour une nouvelle séance.',
    labels: {
      type: 'Type de séance',
      date: 'Date',
      time: 'Heure',
      location: 'Lieu',
      reference: 'Référence',
      reason: 'Motif'
    },
    presencial: 'En personne',
    online: 'En ligne',
    refund: {
      processed: '💰 Remboursement traité',
      text: 'Le montant de <strong>€ {{amount}}</strong> sera remboursé sous 7 jours ouvrables.',
      noRefund: 'Comme cette annulation a été effectuée hors délai de remboursement, aucun remboursement ne sera émis.'
    },
    newBooking: {
      title: 'Réserver une nouvelle séance',
      text: 'Nous sommes tristes de vous voir annuler. Quand vous serez prêt, nous serons heureux de vous accueillir à nouveau.',
      button: 'Réserver une nouvelle séance'
    },
    contact: 'Si vous avez des questions ou besoin d\'assistance, n\'hésitez pas à nous contacter.'
  },
  de: {
    title: 'Termin abgesagt',
    preheader: 'Ihr Termin für {{date}} wurde abgesagt',
    greeting: 'Guten Tag',
    message: 'Ihr Termin wurde erfolgreich abgesagt. Wir hoffen, Sie bald für eine neue Sitzung wiederzusehen.',
    labels: {
      type: 'Sitzungsart',
      date: 'Datum',
      time: 'Zeit',
      location: 'Ort',
      reference: 'Referenz',
      reason: 'Grund'
    },
    presencial: 'Vor Ort',
    online: 'Online',
    refund: {
      processed: '💰 Rückerstattung bearbeitet',
      text: 'Der Betrag von <strong>€ {{amount}}</strong> wird innerhalb von 7 Werktagen zurückerstattet.',
      noRefund: 'Da diese Stornierung außerhalb der Rückerstattungsfrist erfolgte, wird keine Rückerstattung gewährt.'
    },
    newBooking: {
      title: 'Neue Sitzung buchen',
      text: 'Wir bedauern Ihre Absage. Wenn Sie bereit sind, freuen wir uns, Sie wieder begrüßen zu dürfen.',
      button: 'Neue Sitzung buchen'
    },
    contact: 'Wenn Sie Fragen haben oder Hilfe benötigen, zögern Sie nicht, uns zu kontaktieren.'
  }
};

export function getBookingCancellationEmail(data: BookingCancellationData): string {
  const {
    clientName,
    sessionType,
    date,
    time,
    location,
    bookingReference,
    cancellationReason,
    refundAmount,
    bookNewUrl,
    language = 'pt'
  } = data;

  const t = translations[language] || translations.pt;
  const currencySymbol = language === 'pt' ? 'R$' : '€'; // Keeping simple logic for now

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
      ${sessionType === 'PRESENCIAL' && location ? `
      <div class="info-row">
        <span class="info-label">${t.labels.location}</span>
        <span class="info-value">${location}</span>
      </div>
      ` : ''}
      <div class="info-row">
        <span class="info-label">${t.labels.reference}</span>
        <span class="info-value">${bookingReference}</span>
      </div>
      ${cancellationReason ? `
      <div class="info-row">
        <span class="info-label">${t.labels.reason}</span>
        <span class="info-value">${cancellationReason}</span>
      </div>
      ` : ''}
    </div>

    ${refundAmount !== undefined && refundAmount > 0 ? `
    <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 20px; margin: 24px 0; border-radius: 6px;">
      <p style="margin: 0 0 8px 0; font-weight: 600; color: #065f46;">
        ${t.refund.processed}
      </p>
      <p style="margin: 0; color: #065f46;">
        ${t.refund.text.replace('{{amount}}', refundAmount.toFixed(2))}
      </p>
    </div>
    ` : refundAmount === 0 ? `
    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 24px 0; border-radius: 6px;">
      <p style="margin: 0; color: #1e40af;">
        ${t.refund.noRefund}
      </p>
    </div>
    ` : ''}

    <div class="divider"></div>

    <h2>${t.newBooking.title}</h2>
    <p>
      ${t.newBooking.text}
    </p>

    <a href="${bookNewUrl}" class="button">
      ${t.newBooking.button}
    </a>

    <p style="margin-top: 32px; font-size: 14px; color: #6b7280;">
      ${t.contact}
    </p>
  `;

  return getBaseEmailTemplate({
    title: `${t.title} - Brilliance`,
    preheader: t.preheader.replace('{{date}}', date),
    content,
    language
  });
}
