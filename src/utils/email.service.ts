// email.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private configService: ConfigService;

  constructor(configService: ConfigService) {
    this.configService = configService;
    this.transporter = nodemailer.createTransport({
      // Configure your SMTP settings here
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<string>('MAIL_PORT'),
      secureConnection: this.configService.get<string>('MAIL_SECURE'),
      auth: {
        user: this.configService.get<string>('MAIL_USERNAME'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
    });
  }

  async sendMail(
    to: string,
    subject: string,
    message: string,
    isHtml: boolean = false,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_FROM'),
        to,
        subject,
        [isHtml ? 'html' : 'text']: message,
      });
    } catch (error) {
      throw new Error(`Error sending email: ${error.message}`);
    }
  }
}
