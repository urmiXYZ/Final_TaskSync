import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { getTestMessageUrl, createTestAccount } from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {}

  private async createTransporter(to: string) {
    const isRealEmail = !to.endsWith('@ethereal.email') && !to.endsWith('@fake.com');

    if (isRealEmail) {
      return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: this.configService.get<string>('EMAIL_USER'),
          pass: this.configService.get<string>('EMAIL_PASS'),
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
    } else {
      const testAccount = await createTestAccount();
      return nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
    }
  }


   async sendResetPasswordEmail(to: string, resetLink: string, token: string) {
  const transporter = await this.createTransporter(to);

  const info = await transporter.sendMail({
    from: `"Task Manager" <${this.configService.get<string>('EMAIL_USER')}>`,
    to,
    subject: '🔐 Reset Your Password',
    html: `
      <p>Hello,</p>
      <p>You requested a password reset.</p>
      <p><strong>Reset Token:</strong> ${token}</p>
      <p>Please click <a href="${resetLink}">here</a> to reset your password.</p>
      <p>This link expires in 3 minutes.</p>
    `,
  });

  const previewUrl = getTestMessageUrl(info);
  this.logger.log(`Reset email sent to ${to}. Preview: ${previewUrl || 'N/A (real email)'}`);
  return previewUrl;
}



async sendFeedbackEmail(
  fromName: string,
  fromEmail: string,
  subject: string,
  message: string,
) {
const to = this.configService.get<string>('EMAIL_USER');
if (!to) {
  throw new Error('EMAIL_USER is not defined in environment variables');
}
  
  // Get transporter instance dynamically:
  const transporter = await this.createTransporter(to);

  const info = await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: `📝 Feedback: ${subject}`,
    html: `
      <p><strong>From:</strong> ${fromName} (${fromEmail})</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong><br/>${message}</p>
    `,
  });

  const previewUrl = getTestMessageUrl(info);
  this.logger.log(`Feedback email sent from ${fromEmail}. Preview: ${previewUrl || 'N/A (real email)'}`);
  return previewUrl;
}


}
