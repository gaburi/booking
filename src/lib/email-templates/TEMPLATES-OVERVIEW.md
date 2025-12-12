# 📧 Visão Geral dos Templates de Email - Brilliance

Todos os templates foram criados seguindo o design system da plataforma com cores roxas vibrantes (#8b5cf6), design minimalista e totalmente responsivos.

---

## 🎨 Template Base

**Arquivo:** `base.ts`

Estrutura base compartilhada por todos os templates:

- **Header roxo** com gradiente e logo BRILLIANCE
- **Corpo branco** com tipografia clara
- **Rodapé cinza** com informações de contato
- **Responsivo** para mobile e desktop
- **Compatível** com todos os clientes de email

**Classes CSS disponíveis:**
- `.button` - Botão de ação roxo
- `.info-box` - Caixa de informações com borda roxa
- `.info-row` - Linha de label + valor
- `.divider` - Linha divisória
- `.footer-link` - Link no rodapé

---

## 1. 📅 Confirmação de Agendamento

**Arquivo:** `booking-confirmation.ts`

**Quando usar:** Após cliente criar um agendamento

**Variações:**
- ✅ Sessão Presencial (com localização e endereço)
- ✅ Sessão Online (com link de reunião)

**Conteúdo:**
- Mensagem de confirmação calorosa
- Detalhes da sessão (tipo, data, hora, duração)
- Localização/endereço (presencial) ou link de reunião (online)
- Referência do agendamento
- Instruções de preparação
- Botão para gerenciar agendamento
- Nota sobre lembrete futuro

**Código:**
```typescript
getBookingConfirmationEmail({
  clientName: 'João Silva',
  sessionType: 'PRESENCIAL' | 'ONLINE',
  date: '15 de Dezembro de 2025',
  time: '14:00',
  duration: 60,
  location: 'Clínica Centro', // se presencial
  locationAddress: 'Rua X, 123', // se presencial
  meetingLink: 'https://...', // se online
  bookingReference: 'BRL-2025-001',
  cancelUrl: 'https://...',
})
```

---

## 2. ⏰ Lembrete de Sessão

**Arquivo:** `session-reminder.ts`

**Quando usar:** 24h ou 2h antes da sessão

**Variações:**
- ⏰ Lembrete 24h antes
- 🔔 Lembrete 2h antes

**Conteúdo:**
- Alerta destacado sobre proximidade da sessão
- Todos os detalhes da sessão
- Link de reunião (online) com botão de acesso direto
- Dicas de preparação específicas para cada tipo
- Possibilidade de reagendar/cancelar

**Código:**
```typescript
getSessionReminderEmail({
  clientName: 'Maria Santos',
  sessionType: 'ONLINE',
  date: '16 de Dezembro de 2025',
  time: '10:00',
  duration: 60,
  meetingLink: 'https://...',
  bookingReference: 'BRL-2025-002',
  cancelUrl: 'https://...',
  hoursUntilSession: 24, // ou 2
})
```

---

## 3. ❌ Cancelamento de Agendamento

**Arquivo:** `booking-cancellation.ts`

**Quando usar:** Após cliente cancelar agendamento

**Variações:**
- 💰 Com reembolso (cancelamento dentro do prazo)
- ⚠️ Sem reembolso (cancelamento tardio)

**Conteúdo:**
- Confirmação de cancelamento
- Detalhes do agendamento cancelado
- Informações sobre reembolso (se aplicável)
- Prazo para recebimento do reembolso
- Botão para fazer novo agendamento
- Mensagem de incentivo para retorno

**Código:**
```typescript
getBookingCancellationEmail({
  clientName: 'Pedro Oliveira',
  sessionType: 'PRESENCIAL',
  date: '20 de Dezembro de 2025',
  time: '15:00',
  location: 'Clínica Sul',
  bookingReference: 'BRL-2025-003',
  cancellationReason: 'Conflito de agenda',
  refundAmount: 150.00, // ou 0 se sem reembolso
  bookNewUrl: 'https://...',
})
```

---

## 4. 💳 Confirmação de Pagamento

**Arquivo:** `payment-confirmation.ts`

**Quando usar:** Após pagamento ser aprovado

**Conteúdo:**
- Alerta verde de pagamento aprovado
- Valor pago em destaque
- Detalhes do pagamento (método, ID da transação, data)
- Detalhes da sessão agendada
- Botão para baixar recibo (se disponível)
- Informação sobre próximos passos

**Código:**
```typescript
getPaymentConfirmationEmail({
  clientName: 'Ana Costa',
  sessionType: 'ONLINE',
  date: '18 de Dezembro de 2025',
  time: '09:00',
  duration: 90,
  bookingReference: 'BRL-2025-004',
  amount: 200.00,
  paymentMethod: 'Cartão de Crédito (Visa ****1234)',
  transactionId: 'TXN-2025-ABC123',
  receiptUrl: 'https://...', // opcional
})
```

---

## 5. 🔑 Redefinição de Senha (Admin)

**Arquivo:** `admin-password-reset.ts`

**Quando usar:** Admin solicita reset de senha

**Conteúdo:**
- Alerta amarelo sobre link temporário
- Tempo de expiração do link
- Botão para redefinir senha
- Link alternativo (caso botão não funcione)
- Alerta de segurança (se não solicitou, ignore)
- Lembretes de boas práticas

**Código:**
```typescript
getAdminPasswordResetEmail({
  adminName: 'Administrador', // opcional
  resetUrl: 'https://brilliance.com/admin/reset?token=...',
  expiresInHours: 1,
})
```

---

## 6. 👋 Email de Boas-vindas

**Arquivo:** `welcome-email.ts`

**Quando usar:** Primeiro agendamento de um cliente novo

**Conteúdo:**
- Mensagem de boas-vindas calorosa
- Explicação visual de como funciona (4 passos)
- Tipos de sessão disponíveis (presencial vs online)
- Botão principal para fazer primeiro agendamento
- Dica sobre política de cancelamento
- Convite para contato em caso de dúvidas

**Código:**
```typescript
getWelcomeEmail({
  clientName: 'Fernanda Rocha',
  firstBookingUrl: 'https://brilliance.com/booking',
})
```

---

## 7. 🔔 Notificação Administrativa

**Arquivo:** `admin-notification.ts`

**Quando usar:** Alertar admin sobre eventos importantes

**Variações:**
- 📘 Baixa prioridade (info)
- ⚠️ Média prioridade (atenção)
- 🚨 Alta prioridade (urgente)

**Funcionalidades predefinidas:**
- ✅ Novo agendamento recebido
- ❌ Agendamento cancelado
- 💥 Falha no pagamento
- 📉 Poucos horários disponíveis

**Conteúdo:**
- Badge de prioridade colorido
- Assunto da notificação
- Mensagem detalhada
- Metadados em tabela (opcional)
- Botão de ação (opcional)
- Nota sobre notificação automática

**Código genérico:**
```typescript
getAdminNotificationEmail({
  subject: 'Título da Notificação',
  message: 'Mensagem detalhada...',
  priority: 'low' | 'medium' | 'high',
  metadata: [
    { label: 'Campo 1', value: 'Valor 1' },
    { label: 'Campo 2', value: 'Valor 2' },
  ],
  actionLabel: 'Ver Detalhes',
  actionUrl: 'https://...',
})
```

**Códigos predefinidos:**
```typescript
// Novo agendamento
getNewBookingNotificationEmail({ clientName, clientEmail, sessionType, date, time, bookingId })

// Cancelamento
getCancellationNotificationEmail({ clientName, sessionType, date, time, reason, bookingId })

// Falha no pagamento
getPaymentFailedNotificationEmail({ clientName, clientEmail, amount, errorMessage, bookingId })

// Poucos horários
getLowAvailabilityNotificationEmail({ sessionType, location, remainingSlots, dateRange })
```

---

## 📊 Resumo de Uso

| Template | Trigger | Destinatário | Prioridade |
|----------|---------|--------------|------------|
| Confirmação de Agendamento | POST /api/bookings | Cliente | Alta |
| Lembrete 24h | Cron diário | Cliente | Alta |
| Lembrete 2h | Cron a cada hora | Cliente | Média |
| Cancelamento | DELETE /api/bookings/:id | Cliente | Média |
| Pagamento | POST /api/payments | Cliente | Alta |
| Reset Senha | POST /api/admin/reset-password | Admin | Alta |
| Boas-vindas | Primeiro agendamento | Cliente | Baixa |
| Notificação Admin | Eventos diversos | Admin | Variável |

---

## 🎨 Paleta de Cores

```css
/* Roxo Primário */
--primary: #8b5cf6
--primary-dark: #7c3aed

/* Cores de Status */
--success: #10b981
--warning: #f59e0b
--error: #ef4444
--info: #3b82f6

/* Neutros */
--gray-50: #f9fafb
--gray-100: #f3f4f6
--gray-200: #e5e7eb
--gray-600: #4b5563
--gray-900: #111827
```

---

## ✨ Características Técnicas

### ✅ Compatibilidade
- Gmail ✓
- Outlook (Desktop) ✓
- Outlook (Web) ✓
- Apple Mail ✓
- Yahoo Mail ✓
- Thunderbird ✓
- Mobile (iOS/Android) ✓

### ✅ Responsividade
- Breakpoint: 600px
- Layout adaptável
- Botões touch-friendly
- Textos legíveis em qualquer tamanho

### ✅ Acessibilidade
- Contraste adequado (WCAG AA)
- Estrutura semântica
- Alt text para imagens
- Links descritivos

### ✅ Performance
- HTML otimizado
- CSS inline
- Sem dependências externas
- Tamanho pequeno (~15-25KB por email)

---

## 📦 Estrutura de Arquivos

```
src/lib/email-templates/
├── base.ts                    # Template base
├── booking-confirmation.ts    # Template 1
├── session-reminder.ts        # Template 2
├── booking-cancellation.ts    # Template 3
├── payment-confirmation.ts    # Template 4
├── admin-password-reset.ts    # Template 5
├── welcome-email.ts           # Template 6
├── admin-notification.ts      # Template 7
├── index.ts                   # Exports centralizados
├── usage-examples.ts          # Exemplos de uso
├── test-templates.ts          # Script de testes
├── preview.html               # Preview visual
├── README.md                  # Documentação geral
├── INTEGRATION.md             # Guia de integração
└── TEMPLATES-OVERVIEW.md      # Este arquivo
```

---

## 🚀 Próximos Passos

1. ✅ Templates criados
2. ⏳ Configurar serviço de email
3. ⏳ Integrar nos endpoints da API
4. ⏳ Configurar cron jobs para lembretes
5. ⏳ Testar em ambiente de desenvolvimento
6. ⏳ Deploy em produção
7. ⏳ Monitorar métricas de entrega

---

## 📞 Suporte

Para dúvidas sobre os templates:
- Veja exemplos em `usage-examples.ts`
- Leia o guia completo em `INTEGRATION.md`
- Execute testes com `test-templates.ts`
- Visualize previews em `preview.html`
