import type { ConfigService } from '@nestjs/config';
import type { MailSender } from '../domain/mailSender.js';
import { GmailMailSender } from './gmailMailSender.js';
import { LogMailSender } from './logMailSender.js';

export function createMailSender(configService: ConfigService): MailSender {
  const gmailUser = configService.get<string>('GMAIL_USER');
  const appPassword = configService.get<string>('GMAIL_APP_PASSWORD');
  return gmailUser && appPassword ? new GmailMailSender(gmailUser, appPassword.replace(/\s/g, '')) : new LogMailSender();
}
