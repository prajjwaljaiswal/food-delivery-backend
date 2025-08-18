import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  private transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: false, // for port 587
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
    requireTLS: true,
    tls: {
      rejectUnauthorized: false,
    },
  });

  async sendTemplateNotification(options: {
    user: { email: string; name?: string };
    template:
    | 'welcome-email'
    | 'reset-password'
    | 'forgot-password'
    | 'driver-forgot-password'
    | 'driver-welcome'
    | 'Driver-welcome'
    | 'Driver-forgot-password'
    | 'restaurant-forgot-password'
    | 'restaurant-welcome';

    data: { otp?: string; [key: string]: any };
  }) {
    try {
      const { user, template, data } = options;

      let subject = '';
      let htmlBody = '';

      switch (template) {
        case 'welcome-email':
          subject = 'Welcome to SlotMitra';
          htmlBody = `
            <h1>Hello ${user.name || 'User'},</h1>
            <p>Welcome to SlotMitra!</p>
            ${data.otp ? `<p>Your OTP code is: <strong>${data.otp}</strong></p>` : ''}
            <p>Thank you for joining us.</p>
          `;
          break;

        case 'reset-password':
          subject = 'Reset Your Password';
          htmlBody = `
            <h1>Hi ${user.name || 'User'},</h1>
            <p>Your password reset OTP is: <strong>${data.otp}</strong></p>
            <p>Please use this to reset your password. It will expire in 10 minutes.</p>
          `;
          break;

        case 'forgot-password':
          subject = 'Forgot Password OTP';
          htmlBody = `
            <h1>Hi ${user.name || 'User'},</h1>
            <p>Your OTP for resetting your password is: <strong>${data.otp}</strong></p>
            <p>This OTP will expire in 10 minutes.</p>
          `;
          break;

        case 'driver-welcome':
          subject = 'Welcome Driver!';
          htmlBody = `
            <h1>Hello ${user.name || 'Driver'},</h1>
            <p>Welcome to SlotMitra as a driver!</p>
            ${data.otp ? `<p>Your verification OTP is: <strong>${data.otp}</strong></p>` : ''}
            <p>Thank you for joining us.</p>
          `;
          break;

        case 'driver-forgot-password':
          subject = 'Driver Forgot Password OTP';
          htmlBody = `
            <h1>Hi ${user.name || 'Driver'},</h1>
            <p>Your OTP for resetting your driver account password is: <strong>${data.otp}</strong></p>
            <p>This OTP will expire in 10 minutes.</p>
          `;
          break;

        case 'restaurant-welcome':
          subject = 'Welcome Restaurant Partner!';
          htmlBody = `
            <h1>Hello ${user.name || 'Restaurant'},</h1>
            <p>Welcome to SlotMitra as a restaurant partner!</p>
            ${data.otp ? `<p>Your verification OTP is: <strong>${data.otp}</strong></p>` : ''}
            <p>Thank you for joining us.</p>
          `;
          break;

        case 'restaurant-forgot-password':
          subject = 'Restaurant Forgot Password OTP';
          htmlBody = `
            <h1>Hi ${user.name || 'Restaurant'},</h1>
            <p>Your OTP for resetting your restaurant account password is: <strong>${data.otp}</strong></p>
            <p>This OTP will expire in 10 minutes.</p>
          `;
          break;

        default:
          this.logger.error(`Unknown email template: ${template}`);
          return;
      }

      await this.transporter.sendMail({
        from: `"SlotMitra Support" <${process.env.MAIL_FROM_ADDRESS}>`,
        to: user.email,
        subject,
        html: htmlBody,
      });

      this.logger.log(`Email sent to ${user.email} using template ${template}`);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Email sending failed');
    }
  }
}
