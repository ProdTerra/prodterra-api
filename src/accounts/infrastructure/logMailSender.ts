import { Logger } from '@nestjs/common';
import { MailSender, type MailMessage } from '../domain/mailSender.js';

export class LogMailSender extends MailSender {
  private readonly logger = new Logger('Mail');

  async send(message: MailMessage): Promise<void> {
    this.logger.log(`Gmail is not configured. Email to ${message.to}: ${message.subject}\n${message.text}`);
  }
}
