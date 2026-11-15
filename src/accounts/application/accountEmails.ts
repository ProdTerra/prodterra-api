import type { Locale } from '../domain/locale.js';
import type { MailMessage } from '../domain/mailSender.js';

type EmailContent = { subject: string; paragraphs: string[]; action?: { label: string; url: string } };

const htmlEscapes: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (character) => htmlEscapes[character]);
}

function toMailMessage(to: string, { subject, paragraphs, action }: EmailContent): MailMessage {
  const textLines = [...paragraphs, ...(action ? [`${action.label}: ${action.url}`] : [])];
  const htmlParagraphs = paragraphs.map((paragraph) => `<p style="margin:0 0 16px">${escapeHtml(paragraph)}</p>`);
  const htmlAction = action
    ? `<p style="margin:24px 0"><a href="${escapeHtml(action.url)}" style="background:#2f6b3a;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">${escapeHtml(action.label)}</a></p>`
    : '';
  const html = `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:16px;line-height:1.5;color:#1f2a1f;max-width:520px">${htmlParagraphs.join('')}${htmlAction}<p style="margin:24px 0 0;color:#5b665b;font-size:14px">ProdTerra</p></div>`;
  return { to, subject, text: textLines.join('\n\n'), html };
}

export function welcomeEmail(to: string, name: string, plannerUrl: string, locale: Locale): MailMessage {
  const content: Record<Locale, EmailContent> = {
    es: {
      subject: 'Bienvenido a ProdTerra',
      paragraphs: [`Hola, ${name}.`, 'Tu cuenta está lista. Ya puedes guardar tus fincas y volver a sus calendarios cuando quieras.'],
      action: { label: 'Ir a ProdTerra', url: plannerUrl },
    },
    en: {
      subject: 'Welcome to ProdTerra',
      paragraphs: [`Hi, ${name}.`, 'Your account is ready. You can now save your farms and come back to their calendars at any time.'],
      action: { label: 'Go to ProdTerra', url: plannerUrl },
    },
  };
  return toMailMessage(to, content[locale]);
}

export function passwordResetEmail(to: string, name: string, resetUrl: string, locale: Locale): MailMessage {
  const content: Record<Locale, EmailContent> = {
    es: {
      subject: 'Cambia tu contraseña de ProdTerra',
      paragraphs: [
        `Hola, ${name}.`,
        'Pediste cambiar tu contraseña. El enlace sirve una sola vez y vence en 1 hora.',
        'Si no lo pediste, ignora este correo: tu contraseña sigue igual.',
      ],
      action: { label: 'Cambiar mi contraseña', url: resetUrl },
    },
    en: {
      subject: 'Change your ProdTerra password',
      paragraphs: [
        `Hi, ${name}.`,
        'You asked to change your password. The link works once and expires in 1 hour.',
        'If you did not ask for it, ignore this email: your password stays the same.',
      ],
      action: { label: 'Change my password', url: resetUrl },
    },
  };
  return toMailMessage(to, content[locale]);
}

export function passwordChangedEmail(to: string, name: string, forgotPasswordUrl: string, locale: Locale): MailMessage {
  const content: Record<Locale, EmailContent> = {
    es: {
      subject: 'Tu contraseña de ProdTerra cambió',
      paragraphs: [
        `Hola, ${name}.`,
        'La contraseña de tu cuenta acaba de cambiar y cerramos las sesiones abiertas en otros dispositivos.',
        'Si no fuiste tú, cámbiala de nuevo ahora.',
      ],
      action: { label: 'Cambiar mi contraseña', url: forgotPasswordUrl },
    },
    en: {
      subject: 'Your ProdTerra password changed',
      paragraphs: [
        `Hi, ${name}.`,
        'Your account password just changed and we signed out the sessions open on other devices.',
        'If it was not you, change it again now.',
      ],
      action: { label: 'Change my password', url: forgotPasswordUrl },
    },
  };
  return toMailMessage(to, content[locale]);
}
