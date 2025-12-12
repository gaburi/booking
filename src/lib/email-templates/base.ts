/**
 * Base email template layout
 * Compatible with all email clients (Gmail, Outlook, Apple Mail, etc.)
 */

export interface EmailTemplateProps {
  title: string;
  preheader?: string;
  content: string;
  language?: 'pt' | 'en' | 'fr' | 'de';
}

const translations = {
  pt: {
    rights: 'Todos os direitos reservados.',
    help: 'Precisa de ajuda?',
    contact: 'Entre em contato'
  },
  en: {
    rights: 'All rights reserved.',
    help: 'Need help?',
    contact: 'Contact us'
  },
  fr: {
    rights: 'Tous droits réservés.',
    help: 'Besoin d\'aide ?',
    contact: 'Contactez-nous'
  },
  de: {
    rights: 'Alle Rechte vorbehalten.',
    help: 'Brauchen Sie Hilfe?',
    contact: 'Kontaktieren Sie uns'
  }
};

export function getBaseEmailTemplate({ title, preheader = '', content, language = 'pt' }: EmailTemplateProps): string {
  const t = translations[language as keyof typeof translations] || translations.pt;

  return `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background-color: #f9fafb;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .email-wrapper {
      width: 100%;
      background-color: #f9fafb;
      padding: 40px 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    }
    .email-header {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      padding: 40px 32px;
      text-align: center;
    }
    .email-logo {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .email-body {
      padding: 40px 32px;
    }
    .email-footer {
      background-color: #f9fafb;
      padding: 32px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .preheader {
      display: none;
      font-size: 1px;
      color: #f9fafb;
      line-height: 1px;
      max-height: 0px;
      max-width: 0px;
      opacity: 0;
      overflow: hidden;
    }
    h1, h2, h3 {
      color: #111827;
      margin-bottom: 16px;
      font-weight: 600;
    }
    h1 {
      font-size: 24px;
      line-height: 1.3;
    }
    h2 {
      font-size: 20px;
      line-height: 1.4;
    }
    p {
      margin-bottom: 16px;
      color: #4b5563;
      font-size: 16px;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background-color: #8b5cf6;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 24px 0;
      transition: background-color 0.2s;
    }
    .button:hover {
      background-color: #7c3aed;
    }
    .info-box {
      background-color: #f3f4f6;
      border-left: 4px solid #8b5cf6;
      padding: 20px;
      margin: 24px 0;
      border-radius: 6px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: 600;
      color: #374151;
    }
    .info-value {
      color: #6b7280;
      text-align: right;
    }
    .divider {
      height: 1px;
      background-color: #e5e7eb;
      margin: 32px 0;
    }
    .footer-text {
      color: #6b7280;
      font-size: 14px;
      margin: 8px 0;
    }
    .footer-link {
      color: #8b5cf6;
      text-decoration: none;
    }
    .footer-link:hover {
      text-decoration: underline;
    }

    /* Responsive */
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 20px 10px;
      }
      .email-body {
        padding: 24px 20px;
      }
      .email-header {
        padding: 32px 20px;
      }
      .email-footer {
        padding: 24px 20px;
      }
      h1 {
        font-size: 22px;
      }
      h2 {
        font-size: 18px;
      }
      .button {
        display: block;
        text-align: center;
      }
      .info-row {
        flex-direction: column;
      }
      .info-value {
        text-align: left;
        margin-top: 4px;
      }
    }
  </style>
</head>
<body>
  <span class="preheader">${preheader}</span>

  <div class="email-wrapper">
    <div class="email-container">
      <!-- Header -->
      <div class="email-header">
        <h1 class="email-logo">BRILLIANCE</h1>
      </div>

      <!-- Body -->
      <div class="email-body">
        ${content}
      </div>

      <!-- Footer -->
      <div class="email-footer">
        <p class="footer-text">
          © ${new Date().getFullYear()} Brilliance. ${t.rights}
        </p>
        <p class="footer-text">
          ${t.help} <a href="mailto:contato@brilliance.com" class="footer-link">${t.contact}</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
