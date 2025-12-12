# Guia de Integração - Templates de Email

Este guia mostra como integrar os templates de email na plataforma Brilliance.

## 📦 Instalação de Dependências

Primeiro, instale um serviço de envio de emails. Recomendamos:

### Opção 1: Resend (Recomendado)

```bash
npm install resend
```

### Opção 2: Nodemailer

```bash
npm install nodemailer @types/nodemailer
```

### Opção 3: SendGrid

```bash
npm install @sendgrid/mail
```

## 🔧 Configuração

### 1. Variáveis de Ambiente

Adicione ao seu arquivo `.env`:

```bash
# Resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx

# OU Nodemailer (Gmail)
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app

# OU SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx

# URLs da aplicação
NEXT_PUBLIC_BASE_URL=https://brilliance.com
EMAIL_FROM=noreply@brilliance.com
EMAIL_FROM_NAME=Brilliance
```

### 2. Criar Serviço de Email

Crie o arquivo `src/lib/email-service.ts`:

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, replyTo }: SendEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
      replyTo: replyTo || process.env.EMAIL_FROM,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}
```

## 📧 Integração nos Endpoints da API

### Exemplo 1: Após Criar Agendamento

Edite `src/app/api/bookings/route.ts`:

```typescript
import { getBookingConfirmationEmail } from '@/lib/email-templates';
import { sendEmail } from '@/lib/email-service';

export async function POST(req: Request) {
  // ... lógica existente de criação de agendamento ...

  const booking = await prisma.booking.create({
    data: {
      // ... dados do agendamento
    },
    include: {
      location: true,
    },
  });

  // Enviar email de confirmação
  try {
    const html = getBookingConfirmationEmail({
      clientName: booking.clientName,
      sessionType: booking.sessionType,
      date: new Date(booking.date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      time: booking.time,
      duration: booking.duration,
      location: booking.location?.name,
      locationAddress: booking.location?.address,
      meetingLink: booking.meetingLink,
      bookingReference: `BRL-${booking.id.slice(0, 8).toUpperCase()}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/booking/cancel/${booking.id}`,
    });

    await sendEmail({
      to: booking.clientEmail,
      subject: 'Agendamento Confirmado - Brilliance',
      html,
    });

    console.log(`Confirmation email sent to ${booking.clientEmail}`);
  } catch (emailError) {
    console.error('Failed to send confirmation email:', emailError);
    // Não falhar a requisição se o email não for enviado
  }

  return NextResponse.json(booking);
}
```

### Exemplo 2: Após Pagamento

Edite `src/app/api/bookings/[id]/payment/route.ts`:

```typescript
import { getPaymentConfirmationEmail } from '@/lib/email-templates';
import { sendEmail } from '@/lib/email-service';

export async function POST(req: Request) {
  // ... lógica de pagamento ...

  // Após pagamento aprovado
  if (paymentStatus === 'approved') {
    try {
      const html = getPaymentConfirmationEmail({
        clientName: booking.clientName,
        sessionType: booking.sessionType,
        date: formatDate(booking.date),
        time: booking.time,
        duration: booking.duration,
        location: booking.location?.name,
        bookingReference: `BRL-${booking.id.slice(0, 8).toUpperCase()}`,
        amount: payment.amount,
        paymentMethod: payment.method,
        transactionId: payment.transactionId,
        receiptUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/receipts/${payment.id}`,
      });

      await sendEmail({
        to: booking.clientEmail,
        subject: 'Pagamento Confirmado - Brilliance',
        html,
      });
    } catch (emailError) {
      console.error('Failed to send payment confirmation:', emailError);
    }
  }
}
```

### Exemplo 3: Após Cancelamento

Edite `src/app/api/bookings/[id]/cancel/route.ts`:

```typescript
import { getBookingCancellationEmail } from '@/lib/email-templates';
import { sendEmail } from '@/lib/email-service';

export async function POST(req: Request) {
  // ... lógica de cancelamento ...

  const refundAmount = calculateRefund(booking);

  try {
    const html = getBookingCancellationEmail({
      clientName: booking.clientName,
      sessionType: booking.sessionType,
      date: formatDate(booking.date),
      time: booking.time,
      location: booking.location?.name,
      bookingReference: `BRL-${booking.id.slice(0, 8).toUpperCase()}`,
      cancellationReason: req.body.reason,
      refundAmount,
      bookNewUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/booking`,
    });

    await sendEmail({
      to: booking.clientEmail,
      subject: 'Agendamento Cancelado - Brilliance',
      html,
    });
  } catch (emailError) {
    console.error('Failed to send cancellation email:', emailError);
  }
}
```

## ⏰ Lembretes Automáticos com Cron Job

### Opção 1: Vercel Cron Jobs

Crie `src/app/api/cron/send-reminders/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionReminderEmail } from '@/lib/email-templates';
import { sendEmail } from '@/lib/email-service';

export async function GET(request: Request) {
  // Verificar autorização
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Buscar agendamentos que começam em 24 horas
  const tomorrow = new Date();
  tomorrow.setHours(tomorrow.getHours() + 24);

  const bookings = await prisma.booking.findMany({
    where: {
      date: {
        gte: new Date(tomorrow.setHours(0, 0, 0, 0)),
        lt: new Date(tomorrow.setHours(23, 59, 59, 999)),
      },
      reminderSent: false,
      status: 'CONFIRMED',
    },
    include: {
      location: true,
    },
  });

  let sentCount = 0;
  let errorCount = 0;

  for (const booking of bookings) {
    try {
      const html = getSessionReminderEmail({
        clientName: booking.clientName,
        sessionType: booking.sessionType,
        date: formatDate(booking.date),
        time: booking.time,
        duration: booking.duration,
        location: booking.location?.name,
        locationAddress: booking.location?.address,
        meetingLink: booking.meetingLink,
        bookingReference: `BRL-${booking.id.slice(0, 8).toUpperCase()}`,
        cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/booking/cancel/${booking.id}`,
        hoursUntilSession: 24,
      });

      await sendEmail({
        to: booking.clientEmail,
        subject: 'Lembrete: Sua sessão é amanhã - Brilliance',
        html,
      });

      await prisma.booking.update({
        where: { id: booking.id },
        data: { reminderSent: true },
      });

      sentCount++;
    } catch (error) {
      console.error(`Failed to send reminder for booking ${booking.id}:`, error);
      errorCount++;
    }
  }

  return NextResponse.json({
    success: true,
    sent: sentCount,
    errors: errorCount,
    total: bookings.length,
  });
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}
```

Configure em `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 10 * * *"
    }
  ]
}
```

Adicione ao `.env`:

```bash
CRON_SECRET=seu-secret-aqui-gere-um-uuid
```

### Opção 2: Node-Cron (para servidor próprio)

```bash
npm install node-cron
```

Crie `src/lib/cron-jobs.ts`:

```typescript
import cron from 'node-cron';
import { sendRemindersJob } from './reminder-service';

export function startCronJobs() {
  // Executar todos os dias às 10h
  cron.schedule('0 10 * * *', async () => {
    console.log('Running reminder cron job...');
    await sendRemindersJob();
  });

  console.log('Cron jobs started');
}
```

## 🎨 Personalização

### Customizar Cores

Edite `src/lib/email-templates/base.ts` para alterar:

```css
.email-header {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); /* Altere aqui */
}

.button {
  background-color: #8b5cf6; /* Altere aqui */
}
```

### Adicionar Logo

Substitua o texto "BRILLIANCE" no header por uma imagem:

```html
<div class="email-header">
  <img src="https://seu-dominio.com/logo.png" alt="Brilliance" style="height: 40px;">
</div>
```

## 🧪 Testes

### Gerar Previews Locais

```bash
npx tsx src/lib/email-templates/test-templates.ts
```

Isso gerará arquivos HTML em `src/lib/email-templates/generated-previews/`.

### Testar Envio

Crie `src/lib/email-templates/test-send.ts`:

```typescript
import { getBookingConfirmationEmail } from './index';
import { sendEmail } from '../email-service';

async function test() {
  const html = getBookingConfirmationEmail({
    clientName: 'Teste',
    sessionType: 'ONLINE',
    date: '15 de Dezembro de 2025',
    time: '14:00',
    duration: 60,
    bookingReference: 'TEST-001',
    cancelUrl: 'https://brilliance.com/cancel/test',
  });

  await sendEmail({
    to: 'seu-email@teste.com',
    subject: 'Teste - Email de Confirmação',
    html,
  });

  console.log('Email de teste enviado!');
}

test();
```

Execute:

```bash
npx tsx src/lib/email-templates/test-send.ts
```

## 📊 Monitoramento

Adicione logs para monitorar envios:

```typescript
// Criar tabela de logs no Prisma
model EmailLog {
  id        String   @id @default(cuid())
  to        String
  subject   String
  type      String
  status    String   // 'sent' | 'failed'
  error     String?
  sentAt    DateTime @default(now())
  bookingId String?
  booking   Booking? @relation(fields: [bookingId], references: [id])
}
```

No serviço de email:

```typescript
export async function sendEmail(params: SendEmailParams) {
  try {
    await resend.emails.send(/* ... */);

    await prisma.emailLog.create({
      data: {
        to: params.to,
        subject: params.subject,
        type: params.type || 'generic',
        status: 'sent',
      },
    });
  } catch (error) {
    await prisma.emailLog.create({
      data: {
        to: params.to,
        subject: params.subject,
        type: params.type || 'generic',
        status: 'failed',
        error: error.message,
      },
    });
    throw error;
  }
}
```

## ✅ Checklist de Implementação

- [ ] Instalar dependência de email (Resend/Nodemailer/SendGrid)
- [ ] Configurar variáveis de ambiente
- [ ] Criar serviço de email (`email-service.ts`)
- [ ] Integrar template de confirmação na criação de agendamento
- [ ] Integrar template de pagamento no endpoint de pagamento
- [ ] Integrar template de cancelamento no endpoint de cancelamento
- [ ] Configurar cron job para lembretes
- [ ] Testar todos os templates localmente
- [ ] Fazer testes de envio real
- [ ] Configurar monitoramento/logs
- [ ] Adicionar email de boas-vindas no primeiro agendamento
- [ ] Configurar notificações admin

## 🚀 Deploy

Certifique-se de:

1. Adicionar todas as variáveis de ambiente no Vercel/servidor
2. Configurar domínio de email verificado
3. Testar emails em produção antes de lançar
4. Monitorar logs de envio nos primeiros dias

## 📚 Recursos Adicionais

- [Documentação Resend](https://resend.com/docs)
- [Testes de compatibilidade de email](https://www.emailonacid.com/)
- [Preview de emails](https://putsmail.com/)
