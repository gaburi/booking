# Email Templates - Brilliance

Templates de email profissionais e responsivos para a plataforma Brilliance, compatíveis com todos os principais clientes de email.

## Design System

Os templates seguem o design da plataforma:
- **Cor Primária**: `#8b5cf6` (roxo vibrante)
- **Tipografia**: Sans-serif moderna
- **Estilo**: Minimalista e clean
- **Bordas**: Arredondadas (8-12px)
- **Responsivo**: Otimizado para desktop e mobile

## Templates Disponíveis

### 1. Confirmação de Agendamento
Email enviado após a confirmação de um agendamento.

```typescript
import { getBookingConfirmationEmail } from '@/lib/email-templates';

const html = getBookingConfirmationEmail({
  clientName: 'João Silva',
  sessionType: 'PRESENCIAL',
  date: '15 de Dezembro de 2025',
  time: '14:00',
  duration: 60,
  location: 'Clínica Centro',
  locationAddress: 'Rua das Flores, 123 - São Paulo',
  bookingReference: 'BRL-2025-001',
  cancelUrl: 'https://brilliance.com/booking/cancel/abc123',
});

// Enviar email
await sendEmail({
  to: 'cliente@email.com',
  subject: 'Agendamento Confirmado - Brilliance',
  html,
});
```

### 2. Lembrete de Sessão
Email enviado 24h ou 2h antes da sessão.

```typescript
import { getSessionReminderEmail } from '@/lib/email-templates';

const html = getSessionReminderEmail({
  clientName: 'João Silva',
  sessionType: 'ONLINE',
  date: '15 de Dezembro de 2025',
  time: '14:00',
  duration: 60,
  meetingLink: 'https://meet.google.com/abc-defg-hij',
  bookingReference: 'BRL-2025-001',
  cancelUrl: 'https://brilliance.com/booking/cancel/abc123',
  hoursUntilSession: 24, // 24 para amanhã, 2 para "em breve"
});
```

### 3. Cancelamento de Agendamento
Email enviado após o cancelamento.

```typescript
import { getBookingCancellationEmail } from '@/lib/email-templates';

const html = getBookingCancellationEmail({
  clientName: 'João Silva',
  sessionType: 'PRESENCIAL',
  date: '15 de Dezembro de 2025',
  time: '14:00',
  location: 'Clínica Centro',
  bookingReference: 'BRL-2025-001',
  cancellationReason: 'Solicitado pelo cliente',
  refundAmount: 150.00, // undefined se não houver reembolso
  bookNewUrl: 'https://brilliance.com/booking',
});
```

### 4. Confirmação de Pagamento
Email enviado após pagamento aprovado.

```typescript
import { getPaymentConfirmationEmail } from '@/lib/email-templates';

const html = getPaymentConfirmationEmail({
  clientName: 'João Silva',
  sessionType: 'PRESENCIAL',
  date: '15 de Dezembro de 2025',
  time: '14:00',
  duration: 60,
  location: 'Clínica Centro',
  bookingReference: 'BRL-2025-001',
  amount: 150.00,
  paymentMethod: 'Cartão de Crédito (Visa)',
  transactionId: 'TXN-2025-ABC123',
  receiptUrl: 'https://brilliance.com/receipts/abc123',
});
```

### 5. Redefinição de Senha (Admin)
Email para resetar senha do painel administrativo.

```typescript
import { getAdminPasswordResetEmail } from '@/lib/email-templates';

const html = getAdminPasswordResetEmail({
  adminName: 'Admin',
  resetUrl: 'https://brilliance.com/admin/reset-password?token=abc123',
  expiresInHours: 1,
});
```

## Recursos

### ✅ Compatibilidade Total
- Gmail
- Outlook (Desktop e Web)
- Apple Mail
- Yahoo Mail
- Outros clientes principais

### ✅ Responsivo
- Layout adaptável para mobile e desktop
- Fonte legível em qualquer tamanho de tela
- Botões otimizados para toque

### ✅ Acessibilidade
- Alto contraste de cores
- Textos alternativos para imagens
- Estrutura semântica HTML

### ✅ Performance
- HTML otimizado
- CSS inline para compatibilidade
- Leve e rápido

## Integração com Serviços de Email

### Nodemailer

```typescript
import nodemailer from 'nodemailer';
import { getBookingConfirmationEmail } from '@/lib/email-templates';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const html = getBookingConfirmationEmail({ /* ... */ });

await transporter.sendMail({
  from: '"Brilliance" <noreply@brilliance.com>',
  to: 'cliente@email.com',
  subject: 'Agendamento Confirmado',
  html,
});
```

### Resend

```typescript
import { Resend } from 'resend';
import { getBookingConfirmationEmail } from '@/lib/email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

const html = getBookingConfirmationEmail({ /* ... */ });

await resend.emails.send({
  from: 'Brilliance <noreply@brilliance.com>',
  to: 'cliente@email.com',
  subject: 'Agendamento Confirmado',
  html,
});
```

### SendGrid

```typescript
import sgMail from '@sendgrid/mail';
import { getBookingConfirmationEmail } from '@/lib/email-templates';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const html = getBookingConfirmationEmail({ /* ... */ });

await sgMail.send({
  from: 'noreply@brilliance.com',
  to: 'cliente@email.com',
  subject: 'Agendamento Confirmado',
  html,
});
```

## Personalização

Para criar templates personalizados, use o template base:

```typescript
import { getBaseEmailTemplate } from '@/lib/email-templates';

const customHTML = getBaseEmailTemplate({
  title: 'Título do Email',
  preheader: 'Texto de pré-visualização',
  content: `
    <h1>Meu Template Customizado</h1>
    <p>Conteúdo do email...</p>
    <a href="#" class="button">Botão de Ação</a>
  `,
});
```

## Estrutura de Classes CSS

- `.button` - Botão de ação primário
- `.info-box` - Caixa de informações com borda roxa
- `.info-row` - Linha de informação (label + valor)
- `.divider` - Linha divisória
- `.footer-link` - Link no rodapé

## Preview e Testes

Para visualizar os templates:

1. Crie um arquivo de teste HTML
2. Cole o resultado do template
3. Abra no navegador
4. Teste em diferentes clientes de email

## Boas Práticas

- ✅ Sempre forneça um `preheader` para melhor visualização
- ✅ Use textos alternativos descritivos
- ✅ Mantenha emails concisos e objetivos
- ✅ Teste em múltiplos clientes antes de enviar
- ✅ Personalize com o nome do cliente
- ✅ Inclua sempre uma call-to-action clara
