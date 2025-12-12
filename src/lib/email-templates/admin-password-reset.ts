import { getBaseEmailTemplate } from './base';

export interface AdminPasswordResetData {
  adminName?: string;
  resetUrl: string;
  expiresInHours: number;
}

export function getAdminPasswordResetEmail(data: AdminPasswordResetData): string {
  const { adminName, resetUrl, expiresInHours } = data;

  const content = `
    <h1>Redefinição de Senha</h1>

    <p>Olá${adminName ? ` <strong>${adminName}</strong>` : ''},</p>

    <p>
      Recebemos uma solicitação para redefinir a senha da sua conta de administrador na plataforma Brilliance.
    </p>

    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 24px 0; border-radius: 6px;">
      <p style="margin: 0 0 8px 0; font-weight: 600; color: #92400e;">
        ⚠️ Atenção - Link Temporário
      </p>
      <p style="margin: 0; color: #92400e;">
        Este link de redefinição expira em <strong>${expiresInHours} ${expiresInHours === 1 ? 'hora' : 'horas'}</strong>.
      </p>
    </div>

    <p>
      Clique no botão abaixo para criar uma nova senha:
    </p>

    <a href="${resetUrl}" class="button">
      Redefinir Senha
    </a>

    <p style="margin-top: 32px; font-size: 14px; color: #6b7280;">
      Se o botão não funcionar, copie e cole o seguinte link no seu navegador:
    </p>

    <p style="margin: 16px 0; padding: 12px; background-color: #f3f4f6; border-radius: 6px; word-break: break-all; font-size: 12px; font-family: monospace; color: #374151;">
      ${resetUrl}
    </p>

    <div class="divider"></div>

    <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; margin: 24px 0; border-radius: 6px;">
      <p style="margin: 0 0 8px 0; font-weight: 600; color: #991b1b;">
        🔒 Não solicitou esta redefinição?
      </p>
      <p style="margin: 0; color: #991b1b;">
        Se você não solicitou a redefinição de senha, ignore este email. Sua senha permanecerá inalterada e sua conta está segura.
      </p>
    </div>

    <p style="margin-top: 32px; font-size: 14px; color: #6b7280;">
      Por segurança, nunca compartilhe este link com outras pessoas.
    </p>
  `;

  return getBaseEmailTemplate({
    title: 'Redefinir Senha - Brilliance Admin',
    preheader: 'Solicitação de redefinição de senha recebida',
    content,
  });
}
