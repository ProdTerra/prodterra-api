import { describe, expect, it } from 'vitest';
import { passwordChangedEmail, passwordResetEmail, welcomeEmail } from './accountEmails.js';

const logoUrl = 'https://app.prodterra.earth/prodterra-logo-email.png';

describe('account emails', () => {
  it('shows the ProdTerra logo and name at the top of every email', () => {
    const emails = [
      welcomeEmail({ to: 'ana@example.com', name: 'Ana', actionUrl: 'https://app.prodterra.earth/', logoUrl, locale: 'es' }),
      passwordResetEmail({ to: 'ana@example.com', name: 'Ana', actionUrl: 'https://app.prodterra.earth/reset-password?token=abc', logoUrl, locale: 'en' }),
      passwordChangedEmail({ to: 'ana@example.com', name: 'Ana', actionUrl: 'https://app.prodterra.earth/?account=forgotPassword', logoUrl, locale: 'es' }),
    ];

    for (const email of emails) {
      expect(email.html).toContain(`<img src="${logoUrl}"`);
      expect(email.html).toContain('alt="ProdTerra"');
    }
  });

  it('adds the link as plain text under the button for clients that block buttons', () => {
    const resetUrl = 'https://app.prodterra.earth/reset-password?token=abc&x=1';

    const email = passwordResetEmail({ to: 'ana@example.com', name: 'Ana', actionUrl: resetUrl, logoUrl, locale: 'es' });

    expect(email.html).toContain('Si el botón no funciona, copia este enlace en tu navegador:');
    expect(email.html).toContain('https://app.prodterra.earth/reset-password?token=abc&amp;x=1');
    expect(email.text).toContain(`Cambiar mi contraseña: ${resetUrl}`);
  });

  it('explains in the footer why the person got the email, in their language', () => {
    const spanish = welcomeEmail({ to: 'ana@example.com', name: 'Ana', actionUrl: 'https://app.prodterra.earth/', logoUrl, locale: 'es' });
    const english = welcomeEmail({ to: 'ana@example.com', name: 'Ana', actionUrl: 'https://app.prodterra.earth/', logoUrl, locale: 'en' });

    expect(spanish.html).toContain('Recibiste este correo porque tienes una cuenta en ProdTerra.');
    expect(english.html).toContain('You got this email because you have a ProdTerra account.');
    expect(english.html).toContain('<html lang="en">');
  });

  it('escapes the account name in the HTML', () => {
    const email = welcomeEmail({ to: 'ana@example.com', name: '<b>Ana</b>', actionUrl: 'https://app.prodterra.earth/', logoUrl, locale: 'en' });

    expect(email.html).toContain('Hi, &lt;b&gt;Ana&lt;/b&gt;.');
    expect(email.html).not.toContain('<b>Ana</b>');
  });
});
