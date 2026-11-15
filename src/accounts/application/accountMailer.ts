import { Injectable, Logger } from '@nestjs/common';
import type { Locale } from '../domain/locale.js';
import { MailSender, type MailMessage } from '../domain/mailSender.js';
import type { User } from '../domain/user.js';
import { passwordChangedEmail, passwordResetEmail, welcomeEmail, type AccountEmailInput } from './accountEmails.js';
import { WebAppSettings } from './webAppSettings.js';

const emailLogoPath = '/prodterra-logo-email.png';

@Injectable()
export class AccountMailer {
  private readonly logger = new Logger(AccountMailer.name);

  constructor(
    private readonly mailSender: MailSender,
    private readonly webAppSettings: WebAppSettings,
  ) {}

  sendWelcome(user: User, locale: Locale): Promise<void> {
    return this.deliver(welcomeEmail(this.emailInput(user, this.webAppSettings.link('/'), locale)));
  }

  sendPasswordReset(user: User, token: string, locale: Locale): Promise<void> {
    const resetUrl = this.webAppSettings.link('/reset-password', { token });
    return this.deliver(passwordResetEmail(this.emailInput(user, resetUrl, locale)));
  }

  sendPasswordChanged(user: User, locale: Locale): Promise<void> {
    const forgotPasswordUrl = this.webAppSettings.link('/', { account: 'forgotPassword' });
    return this.deliver(passwordChangedEmail(this.emailInput(user, forgotPasswordUrl, locale)));
  }

  private emailInput(user: User, actionUrl: string, locale: Locale): AccountEmailInput {
    return { to: user.email, name: user.name, actionUrl, logoUrl: this.webAppSettings.link(emailLogoPath), locale };
  }

  private async deliver(message: MailMessage): Promise<void> {
    try {
      await this.mailSender.send(message);
    } catch (error) {
      this.logger.error(`Could not send "${message.subject}": ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
