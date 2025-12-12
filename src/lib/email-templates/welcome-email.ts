import { getBaseEmailTemplate } from './base';

export interface WelcomeEmailData {
  clientName: string;
  firstBookingUrl: string;
}

export function getWelcomeEmail(data: WelcomeEmailData): string {
  const { clientName, firstBookingUrl } = data;

  const content = `
    <h1>Bem-vindo à Brilliance!</h1>

    <p>Olá <strong>${clientName}</strong>,</p>

    <p>
      É um prazer tê-lo conosco! Obrigado por escolher a Brilliance para suas sessões.
    </p>

    <div style="background-color: #f3f4f6; padding: 32px; margin: 32px 0; border-radius: 12px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 16px;">✨</div>
      <h2 style="margin: 0 0 16px 0; color: #8b5cf6;">Sua jornada começa aqui</h2>
      <p style="margin: 0; color: #6b7280; max-width: 400px; margin: 0 auto;">
        Estamos comprometidos em oferecer a melhor experiência possível para você.
      </p>
    </div>

    <h2>Como funciona?</h2>

    <div style="margin: 24px 0;">
      <div style="display: flex; align-items: start; margin-bottom: 20px;">
        <div style="background-color: #8b5cf6; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; margin-right: 16px; flex-shrink: 0;">1</div>
        <div>
          <h3 style="margin: 0 0 8px 0; font-size: 16px;">Escolha seu horário</h3>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Veja nossa disponibilidade e escolha o melhor horário para você.</p>
        </div>
      </div>

      <div style="display: flex; align-items: start; margin-bottom: 20px;">
        <div style="background-color: #8b5cf6; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; margin-right: 16px; flex-shrink: 0;">2</div>
        <div>
          <h3 style="margin: 0 0 8px 0; font-size: 16px;">Confirme o agendamento</h3>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Preencha seus dados e confirme sua sessão presencial ou online.</p>
        </div>
      </div>

      <div style="display: flex; align-items: start; margin-bottom: 20px;">
        <div style="background-color: #8b5cf6; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; margin-right: 16px; flex-shrink: 0;">3</div>
        <div>
          <h3 style="margin: 0 0 8px 0; font-size: 16px;">Receba confirmação</h3>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Você receberá um email com todos os detalhes da sua sessão.</p>
        </div>
      </div>

      <div style="display: flex; align-items: start;">
        <div style="background-color: #8b5cf6; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; margin-right: 16px; flex-shrink: 0;">4</div>
        <div>
          <h3 style="margin: 0 0 8px 0; font-size: 16px;">Aproveite sua sessão</h3>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Enviaremos um lembrete antes da sua sessão agendada.</p>
        </div>
      </div>
    </div>

    <div style="text-align: center; margin: 40px 0;">
      <a href="${firstBookingUrl}" class="button" style="font-size: 18px; padding: 16px 32px;">
        Fazer Meu Primeiro Agendamento
      </a>
    </div>

    <div class="divider"></div>

    <h2>Tipos de sessão disponíveis</h2>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0;">
      <div style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px;">
        <div style="font-size: 32px; margin-bottom: 8px;">🏢</div>
        <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #111827;">Presencial</h3>
        <p style="margin: 0; font-size: 14px; color: #6b7280;">
          Sessões em nossas unidades físicas, em um ambiente confortável e acolhedor.
        </p>
      </div>

      <div style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px;">
        <div style="font-size: 32px; margin-bottom: 8px;">💻</div>
        <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #111827;">Online</h3>
        <p style="margin: 0; font-size: 14px; color: #6b7280;">
          Sessões virtuais de onde você estiver, com a mesma qualidade e atenção.
        </p>
      </div>
    </div>

    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 32px 0; border-radius: 6px;">
      <p style="margin: 0 0 8px 0; font-weight: 600; color: #1e40af;">
        💡 Dica
      </p>
      <p style="margin: 0; color: #1e40af;">
        Você pode cancelar ou reagendar gratuitamente com até 24 horas de antecedência.
      </p>
    </div>

    <p style="margin-top: 32px; font-size: 14px; color: #6b7280;">
      Se tiver alguma dúvida, não hesite em entrar em contato conosco. Estamos aqui para ajudar!
    </p>
  `;

  return getBaseEmailTemplate({
    title: 'Bem-vindo à Brilliance',
    preheader: 'Comece sua jornada conosco agora',
    content,
  });
}
