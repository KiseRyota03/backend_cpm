import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as ejs from 'ejs';
import * as path from 'path';

@Injectable()
export class MailerService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  async sendMail(email: string, subject: string, html: string) {
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject,
      html,
    });
  }

  async renderTemplate(templateName: string, data: any): Promise<string> {
    const templatePath = path.join(__dirname, '../../mails', templateName);
    return await ejs.renderFile(templatePath, data);
  }
}
