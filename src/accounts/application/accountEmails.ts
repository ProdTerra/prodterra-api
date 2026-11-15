import type { Locale } from '../domain/locale.js';
import type { MailMessage } from '../domain/mailSender.js';
import { renderEmailHtml } from './emailLayout.js';

export type AccountEmailInput = {
  to: string;
  name: string;
  actionUrl: string;
  logoUrl: string;
  locale: Locale;
};

type EmailContent = { subject: string; preview: string; greeting: string; paragraphs: string[]; actionLabel: string };

function toMailMessage(input: AccountEmailInput, content: EmailContent): MailMessage {
  const action = { label: content.actionLabel, url: input.actionUrl };
  const textLines = [content.greeting, ...content.paragraphs, `${action.label}: ${action.url}`, 'ProdTerra'];
  const html = renderEmailHtml(content.subject, {
    locale: input.locale,
    logoUrl: input.logoUrl,
    preview: content.preview,
    greeting: content.greeting,
    paragraphs: content.paragraphs,
    action,
  });
  return { to: input.to, subject: content.subject, text: textLines.join('\n\n'), html };
}

export function welcomeEmail(input: AccountEmailInput): MailMessage {
  const content: Record<Locale, EmailContent> = {
    es: {
      subject: 'Bienvenido a ProdTerra',
      preview: 'Tu cuenta está lista para guardar tus fincas.',
      greeting: `Hola, ${input.name}.`,
      paragraphs: [
        'Tu cuenta está lista. Ya puedes guardar tus fincas y volver a sus calendarios cuando quieras.',
        'Marca tu finca en el mapa, divídela en lotes y arma tu rotación: ProdTerra te avisa de heladas, sequías, exceso de lluvia, plagas y enfermedades.',
      ],
      actionLabel: 'Ir a ProdTerra',
    },
    en: {
      subject: 'Welcome to ProdTerra',
      preview: 'Your account is ready to save your farms.',
      greeting: `Hi, ${input.name}.`,
      paragraphs: [
        'Your account is ready. You can now save your farms and come back to their calendars at any time.',
        'Mark your farm on the map, split it into lots and plan your rotation: ProdTerra warns you about frost, drought, excess rain, pests and diseases.',
      ],
      actionLabel: 'Go to ProdTerra',
    },
  };
  return toMailMessage(input, content[input.locale]);
}

export function passwordResetEmail(input: AccountEmailInput): MailMessage {
  const content: Record<Locale, EmailContent> = {
    es: {
      subject: 'Cambia tu contraseña de ProdTerra',
      preview: 'El enlace sirve una sola vez y vence en 1 hora.',
      greeting: `Hola, ${input.name}.`,
      paragraphs: [
        'Pediste cambiar tu contraseña. El enlace sirve una sola vez y vence en 1 hora.',
        'Si no lo pediste, ignora este correo: tu contraseña sigue igual.',
      ],
      actionLabel: 'Cambiar mi contraseña',
    },
    en: {
      subject: 'Change your ProdTerra password',
      preview: 'The link works once and expires in 1 hour.',
      greeting: `Hi, ${input.name}.`,
      paragraphs: [
        'You asked to change your password. The link works once and expires in 1 hour.',
        'If you did not ask for it, ignore this email: your password stays the same.',
      ],
      actionLabel: 'Change my password',
    },
  };
  return toMailMessage(input, content[input.locale]);
}

export function passwordChangedEmail(input: AccountEmailInput): MailMessage {
  const content: Record<Locale, EmailContent> = {
    es: {
      subject: 'Tu contraseña de ProdTerra cambió',
      preview: 'Si no fuiste tú, cámbiala de nuevo ahora.',
      greeting: `Hola, ${input.name}.`,
      paragraphs: [
        'La contraseña de tu cuenta acaba de cambiar y cerramos las sesiones abiertas en otros dispositivos.',
        'Si no fuiste tú, cámbiala de nuevo ahora.',
      ],
      actionLabel: 'Cambiar mi contraseña',
    },
    en: {
      subject: 'Your ProdTerra password changed',
      preview: 'If it was not you, change it again now.',
      greeting: `Hi, ${input.name}.`,
      paragraphs: [
        'Your account password just changed and we signed out the sessions open on other devices.',
        'If it was not you, change it again now.',
      ],
      actionLabel: 'Change my password',
    },
  };
  return toMailMessage(input, content[input.locale]);
}
