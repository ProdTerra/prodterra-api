import { createTransport, type Transporter } from 'nodemailer';
import { MailSender, type MailMessage } from '../domain/mailSender.js';

const senderName = 'ProdTerra';

export class GmailMailSender extends MailSender {
  private readonly transporter: Transporter;

  constructor(private readonly gmailUser: string, appPassword: string) {
    super();
    this.transporter = createTransport({ service: 'gmail', auth: { user: gmailUser, pass: appPassword } });
  }

  async send(message: MailMessage): Promise<void> {
    await this.transporter.sendMail({ from: { name: senderName, address: this.gmailUser }, ...message });
  }
}
