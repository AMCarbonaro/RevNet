import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private fromEmail: string;
  private apiKey: string | null;
  private isConfigured: boolean;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('SENDGRID_API_KEY') || null;
    const fromEmail = this.configService.get<string>('SENDGRID_FROM_EMAIL');

    if (!this.apiKey) {
      console.warn('⚠️  SENDGRID_API_KEY not set - email service will log links to console in development mode');
      this.isConfigured = false;
      this.fromEmail = 'noreply@revnet.app';
      return;
    }

    if (!fromEmail) {
      console.warn('SENDGRID_FROM_EMAIL not set - using default');
      this.fromEmail = 'noreply@revnet.app';
    } else {
      this.fromEmail = fromEmail;
    }

    try {
      sgMail.setApiKey(this.apiKey);
      this.isConfigured = true;
      console.log('✅ SendGrid email service configured');
    } catch (error) {
      console.error('❌ Failed to configure SendGrid:', error);
      this.isConfigured = false;
    }
  }

  async sendVerificationEmail(email: string, token: string, username: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:4200';
    const verificationLink = `${frontendUrl}/verify-email?token=${token}`;

    // If SendGrid is not configured, log the link to console (development mode)
    if (!this.isConfigured) {
      console.log('\n========================================');
      console.log('📧 EMAIL VERIFICATION (DEVELOPMENT MODE)');
      console.log('========================================');
      console.log(`To: ${email}`);
      console.log(`Username: ${username}`);
      console.log(`Verification Link: ${verificationLink}`);
      console.log('========================================\n');
      return; // Don't throw error, just log it
    }

    const msg = {
      to: email,
      from: this.fromEmail,
      subject: 'Verify your RevNet account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #5865f2; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 24px; background: #5865f2; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to RevNet, ${username}!</h1>
            </div>
            <div class="content">
              <p>Thank you for registering with RevNet. To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
              <div style="text-align: center;">
                <a href="${verificationLink}" class="button">Verify Email Address</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #5865f2;">${verificationLink}</p>
              <p>This verification link will expire in 24 hours.</p>
              <p>If you did not create a RevNet account, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} RevNet. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`✅ Verification email sent to ${email}`);
    } catch (error: any) {
      console.error('❌ Error sending verification email:', error);
      if (error.response) {
        console.error('SendGrid error details:', error.response.body);
      }
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, token: string, username: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:4200';
    const resetLink = `${frontendUrl}/password-reset?token=${token}`;

    // If SendGrid is not configured, log the link to console (development mode)
    if (!this.isConfigured) {
      console.log('\n========================================');
      console.log('📧 PASSWORD RESET (DEVELOPMENT MODE)');
      console.log('========================================');
      console.log(`To: ${email}`);
      console.log(`Username: ${username}`);
      console.log(`Reset Link: ${resetLink}`);
      console.log('========================================\n');
      return; // Don't throw error, just log it
    }

    const msg = {
      to: email,
      from: this.fromEmail,
      subject: 'Reset your RevNet password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #5865f2; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 24px; background: #5865f2; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello ${username},</p>
              <p>We received a request to reset your password for your RevNet account. Click the button below to reset your password:</p>
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Password</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #5865f2;">${resetLink}</p>
              <div class="warning">
                <p><strong>Important:</strong> This link will expire in 1 hour.</p>
                <p>If you did not request a password reset, please ignore this email. Your password will not be changed.</p>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} RevNet. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`✅ Password reset email sent to ${email}`);
    } catch (error: any) {
      console.error('❌ Error sending password reset email:', error);
      if (error.response) {
        console.error('SendGrid error details:', error.response.body);
      }
      throw error;
    }
  }
}

