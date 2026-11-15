import type { Locale } from '../domain/locale.js';

export type EmailAction = { label: string; url: string };

export type EmailLayoutContent = {
  locale: Locale;
  logoUrl: string;
  preview: string;
  greeting: string;
  paragraphs: string[];
  action: EmailAction;
};

const colors = {
  page: '#eef3ea',
  card: '#ffffff',
  border: '#dfe7da',
  brand: '#2d5034',
  button: '#3c6544',
  text: '#1f2a1f',
  muted: '#5b665b',
};

const fontStack = "'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const layoutTexts: Record<Locale, { fallbackLink: string; footer: string }> = {
  es: {
    fallbackLink: 'Si el botón no funciona, copia este enlace en tu navegador:',
    footer: 'Recibiste este correo porque tienes una cuenta en ProdTerra.',
  },
  en: {
    fallbackLink: 'If the button does not work, copy this link into your browser:',
    footer: 'You got this email because you have a ProdTerra account.',
  },
};

const htmlEscapes: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (character) => htmlEscapes[character]);
}

function renderHeader(logoUrl: string): string {
  return `<tr><td style="padding:28px 32px 8px">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="vertical-align:middle"><img src="${escapeHtml(logoUrl)}" width="44" height="44" alt="ProdTerra" style="display:block;border:0"></td>
<td style="vertical-align:middle;padding-left:10px;font-family:${fontStack};font-size:20px;font-weight:700;color:${colors.brand}">ProdTerra</td>
</tr></table>
</td></tr>`;
}

function renderBody(content: EmailLayoutContent): string {
  const paragraphs = [content.greeting, ...content.paragraphs]
    .map((paragraph) => `<p style="margin:0 0 16px">${escapeHtml(paragraph)}</p>`)
    .join('');
  return `<tr><td style="padding:16px 32px 0;font-family:${fontStack};font-size:16px;line-height:1.55;color:${colors.text}">${paragraphs}</td></tr>`;
}

function renderAction(action: EmailAction, locale: Locale): string {
  const url = escapeHtml(action.url);
  return `<tr><td style="padding:8px 32px 28px">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="border-radius:10px;background:${colors.button}"><a href="${url}" style="display:inline-block;padding:13px 22px;font-family:${fontStack};font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px">${escapeHtml(action.label)}</a></td>
</tr></table>
<p style="margin:20px 0 0;font-family:${fontStack};font-size:13px;line-height:1.5;color:${colors.muted}">${layoutTexts[locale].fallbackLink}<br><a href="${url}" style="color:${colors.button};word-break:break-all">${url}</a></p>
</td></tr>`;
}

function renderFooter(locale: Locale): string {
  return `<tr><td style="padding:20px 32px;border-top:1px solid ${colors.border};font-family:${fontStack};font-size:13px;line-height:1.5;color:${colors.muted}">${layoutTexts[locale].footer}</td></tr>`;
}

export function renderEmailHtml(subject: string, content: EmailLayoutContent): string {
  return `<!doctype html>
<html lang="${content.locale}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:${colors.page}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(content.preview)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${colors.page}"><tr><td align="center" style="padding:32px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:${colors.card};border:1px solid ${colors.border};border-radius:16px">
${renderHeader(content.logoUrl)}
${renderBody(content)}
${renderAction(content.action, content.locale)}
${renderFooter(content.locale)}
</table>
</td></tr></table>
</body>
</html>`;
}
