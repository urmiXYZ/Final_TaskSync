import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'wilfrid.bartell@ethereal.email',
        pass: 'wPawbjUnbCBaaXfV4d',
      },
    });
  }

  async sendPasswordResetEmail(to: string, resetLink: string, token: string): Promise<string> {
  const info = await this.transporter.sendMail({
    from: '"Task Manager" <no-reply@taskmanager.com>',
    to,
    subject: '🔐 Password Reset Request',
    html: `
      <p>You requested a password reset.</p>
      
      <p>Your reset token is: <strong>${token}</strong></p>

      <p>This link will expire in 3 mins.</p>
    `,
  });
  const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log('📨 Preview (Feedback):', previewUrl);
    return previewUrl || '';
  }

  async sendFeedbackEmail(fromName: string, fromEmail: string, subject: string, message: string): Promise<string> {
    const info = await this.transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: 'developer@example.com', // replace with your own or test email
      subject: `📝 Feedback: ${subject}`,
      html: `
        <p><strong>From:</strong> ${fromName} (${fromEmail})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log('📨 Email sent. Preview it at:', previewUrl);
  }

  return previewUrl || ''; 
}

}
