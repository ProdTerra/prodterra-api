import { Injectable, Logger } from '@nestjs/common';
import type { Locale } from '../domain/locale.js';
import { MailSender, type MailMessage } from '../domain/mailSender.js';
import type { User } from '../domain/user.js';
import { passwordChangedEmail, passwordResetEmail, welcomeEmail } from './accountEmails.js';
import { WebAppSettings } from './webAppSettings.js';

@Injectable()
export class AccountMailer {
  private readonly logger = new Logger(AccountMailer.name);

  constructor(
    private readonly mailSender: MailSender,
    private readonly webAppSettings: WebAppSettings,
  ) {}

  sendWelcome(user: User, locale: Locale): Promise<void> {
    return this.deliver(welcomeEmail(user.email, user.name, this.webAppSettings.link('/'), locale));
  }

  sendPasswordReset(user: User, token: string, locale: Locale): Promise<void> {
    const resetUrl = this.webAppSettings.link('/reset-password', { token });
    return this.deliver(passwordResetEmail(user.email, user.name, resetUrl, locale));
  }

  sendPasswordChanged(user: User, locale: Locale): Promise<void> {
    const forgotPasswordUrl = this.webAppSettings.link('/', { account: 'forgotPassword' });
    return this.deliver(passwordChangedEmail(user.email, user.name, forgotPasswordUrl, locale));
  }

  private async deliver(message: MailMessage): Promise<void> {
    try {
      await this.mailSender.send(message);
    } catch (error) {
      this.logger.error(`Could not send "${message.subject}": ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
