import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';
import { logError, logInfo } from './logger';

// Email configuration
const emailConfig = {
  from: process.env.EMAIL_FROM || 'noreply@revolutionnetwork.com',
  replyTo: process.env.EMAIL_REPLY_TO || 'support@revolutionnetwork.com',
  sendGridApiKey: process.env.SENDGRID_API_KEY,
  smtpHost: process.env.SMTP_HOST,
  smtpPort: parseInt(process.env.SMTP_PORT || '587'),
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
};

// Initialize SendGrid
if (emailConfig.sendGridApiKey) {
  sgMail.setApiKey(emailConfig.sendGridApiKey);
}

// Initialize Nodemailer
let transporter: nodemailer.Transporter | null = null;

if (emailConfig.smtpHost && emailConfig.smtpUser && emailConfig.smtpPass) {
  transporter = nodemailer.createTransporter({
    host: emailConfig.smtpHost,
    port: emailConfig.smtpPort,
    secure: emailConfig.smtpPort === 465,
    auth: {
      user: emailConfig.smtpUser,
      pass: emailConfig.smtpPass,
    },
  });
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface EmailOptions {
  to: string | string[];
  template: EmailTemplate;
  data?: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

// Email templates
export const emailTemplates = {
  welcome: {
    subject: 'Welcome to the Revolution Network',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to the Revolution Network</title>
          <style>
            body { font-family: 'Inter', sans-serif; background-color: #000; color: #39FF14; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #0A0A0A; border: 1px solid #39FF14; border-radius: 8px; padding: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #39FF14; text-shadow: 0 0 10px rgba(57, 255, 20, 0.5); }
            .content { line-height: 1.6; margin-bottom: 30px; }
            .button { display: inline-block; background: #39FF14; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; }
            .footer { text-align: center; font-size: 12px; color: #00DDEB; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">REVOLUTION NETWORK</div>
            </div>
            <div class="content">
              <h2>Welcome to the Revolution, {{name}}!</h2>
              <p>You have successfully joined the Revolution Network. The Matrix has you, and now you have the power to change it.</p>
              <p>Your journey begins with The Anthony Letters. Complete them to unlock the full potential of the platform.</p>
              <p style="text-align: center;">
                <a href="{{dashboardUrl}}" class="button">Enter the Matrix</a>
              </p>
              <p>Together, we will build a new democracy.</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>© 2024 Revolution Network. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Welcome to the Revolution Network, {{name}}! You have successfully joined our platform. Visit {{dashboardUrl}} to begin your journey with The Anthony Letters. Together, we will build a new democracy.`
  },

  letterCompleted: {
    subject: 'Letter Completed: {{letterTitle}}',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Letter Completed</title>
          <style>
            body { font-family: 'Inter', sans-serif; background-color: #000; color: #39FF14; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #0A0A0A; border: 1px solid #39FF14; border-radius: 8px; padding: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #39FF14; text-shadow: 0 0 10px rgba(57, 255, 20, 0.5); }
            .content { line-height: 1.6; margin-bottom: 30px; }
            .achievement { background: #39FF14; color: #000; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .button { display: inline-block; background: #39FF14; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; }
            .footer { text-align: center; font-size: 12px; color: #00DDEB; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">REVOLUTION NETWORK</div>
            </div>
            <div class="content">
              <h2>Congratulations, {{name}}!</h2>
              <p>You have successfully completed Letter {{letterNumber}}: {{letterTitle}}</p>
              <div class="achievement">
                <h3>🎉 Achievement Unlocked!</h3>
                <p>You are {{progress}}% through your revolutionary education.</p>
              </div>
              <p>Your understanding of the system grows stronger with each letter. Continue your journey to unlock new features and capabilities.</p>
              <p style="text-align: center;">
                <a href="{{lettersUrl}}" class="button">Continue Reading</a>
              </p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>© 2024 Revolution Network. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Congratulations, {{name}}! You have completed Letter {{letterNumber}}: {{letterTitle}}. You are {{progress}}% through your revolutionary education. Continue your journey at {{lettersUrl}}.`
  },

  projectUpdate: {
    subject: 'Project Update: {{projectTitle}}',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Project Update</title>
          <style>
            body { font-family: 'Inter', sans-serif; background-color: #000; color: #39FF14; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #0A0A0A; border: 1px solid #39FF14; border-radius: 8px; padding: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #39FF14; text-shadow: 0 0 10px rgba(57, 255, 20, 0.5); }
            .content { line-height: 1.6; margin-bottom: 30px; }
            .project-info { background: #000; border: 1px solid #39FF14; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #39FF14; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; }
            .footer { text-align: center; font-size: 12px; color: #00DDEB; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">REVOLUTION NETWORK</div>
            </div>
            <div class="content">
              <h2>Project Update</h2>
              <div class="project-info">
                <h3>{{projectTitle}}</h3>
                <p><strong>Funding Progress:</strong> ${{currentFunding}} / ${{fundingGoal}}</p>
                <p><strong>Status:</strong> {{status}}</p>
              </div>
              <p>{{updateContent}}</p>
              <p style="text-align: center;">
                <a href="{{projectUrl}}" class="button">View Project</a>
              </p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>© 2024 Revolution Network. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Project Update: {{projectTitle}}. Funding Progress: ${{currentFunding}} / ${{fundingGoal}}. Status: {{status}}. {{updateContent}} View project at {{projectUrl}}.`
  },

  donationReceived: {
    subject: 'Donation Received: ${{amount}}',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Donation Received</title>
          <style>
            body { font-family: 'Inter', sans-serif; background-color: #000; color: #39FF14; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #0A0A0A; border: 1px solid #39FF14; border-radius: 8px; padding: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #39FF14; text-shadow: 0 0 10px rgba(57, 255, 20, 0.5); }
            .content { line-height: 1.6; margin-bottom: 30px; }
            .donation-info { background: #39FF14; color: #000; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .button { display: inline-block; background: #39FF14; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; }
            .footer { text-align: center; font-size: 12px; color: #00DDEB; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">REVOLUTION NETWORK</div>
            </div>
            <div class="content">
              <h2>Donation Received!</h2>
              <div class="donation-info">
                <h3>${{amount}}</h3>
                <p>Thank you for supporting <strong>{{projectTitle}}</strong></p>
              </div>
              <p>Your contribution helps fund revolutionary acts and brings us closer to a new democracy. Every dollar makes a difference.</p>
              <p style="text-align: center;">
                <a href="{{projectUrl}}" class="button">View Project</a>
              </p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>© 2024 Revolution Network. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Donation Received: ${{amount}}. Thank you for supporting {{projectTitle}}. Your contribution helps fund revolutionary acts. View project at {{projectUrl}}.`
  }
};

// Template rendering function
function renderTemplate(template: string, data: Record<string, any>): string {
  let rendered = template;
  
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(regex, data[key] || '');
  });
  
  return rendered;
}

// Send email using SendGrid
async function sendWithSendGrid(options: EmailOptions): Promise<boolean> {
  try {
    const msg = {
      to: options.to,
      from: emailConfig.from,
      replyTo: emailConfig.replyTo,
      subject: renderTemplate(options.template.subject, options.data || {}),
      html: renderTemplate(options.template.html, options.data || {}),
      text: options.template.text ? renderTemplate(options.template.text, options.data || {}) : undefined,
      attachments: options.attachments,
    };

    await sgMail.send(msg);
    logInfo('Email sent successfully via SendGrid', { to: options.to, subject: msg.subject });
    return true;
  } catch (error) {
    logError(error as Error, { service: 'SendGrid', to: options.to });
    return false;
  }
}

// Send email using Nodemailer
async function sendWithNodemailer(options: EmailOptions): Promise<boolean> {
  if (!transporter) {
    logError(new Error('Nodemailer transporter not configured'), { to: options.to });
    return false;
  }

  try {
    const mailOptions = {
      from: emailConfig.from,
      to: options.to,
      replyTo: emailConfig.replyTo,
      subject: renderTemplate(options.template.subject, options.data || {}),
      html: renderTemplate(options.template.html, options.data || {}),
      text: options.template.text ? renderTemplate(options.template.text, options.data || {}) : undefined,
      attachments: options.attachments,
    };

    await transporter.sendMail(mailOptions);
    logInfo('Email sent successfully via Nodemailer', { to: options.to, subject: mailOptions.subject });
    return true;
  } catch (error) {
    logError(error as Error, { service: 'Nodemailer', to: options.to });
    return false;
  }
}

// Main email sending function
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // Try SendGrid first, fallback to Nodemailer
  if (emailConfig.sendGridApiKey) {
    const success = await sendWithSendGrid(options);
    if (success) return true;
  }

  if (transporter) {
    return await sendWithNodemailer(options);
  }

  logError(new Error('No email service configured'), { to: options.to });
  return false;
}

// Email queue for batch sending
export class EmailQueue {
  private queue: EmailOptions[] = [];
  private processing = false;

  add(options: EmailOptions) {
    this.queue.push(options);
    this.process();
  }

  private async process() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const email = this.queue.shift();
      if (email) {
        await sendEmail(email);
        // Add delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    this.processing = false;
  }
}

// Export email queue instance
export const emailQueue = new EmailQueue();

// Convenience functions for common email types
export async function sendWelcomeEmail(to: string, name: string) {
  return sendEmail({
    to,
    template: emailTemplates.welcome,
    data: {
      name,
      dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard`,
    },
  });
}

export async function sendLetterCompletedEmail(to: string, name: string, letterNumber: number, letterTitle: string, progress: number) {
  return sendEmail({
    to,
    template: emailTemplates.letterCompleted,
    data: {
      name,
      letterNumber,
      letterTitle,
      progress,
      lettersUrl: `${process.env.NEXTAUTH_URL}/letters`,
    },
  });
}

export async function sendProjectUpdateEmail(to: string, projectTitle: string, updateContent: string, currentFunding: number, fundingGoal: number, status: string) {
  return sendEmail({
    to,
    template: emailTemplates.projectUpdate,
    data: {
      projectTitle,
      updateContent,
      currentFunding,
      fundingGoal,
      status,
      projectUrl: `${process.env.NEXTAUTH_URL}/projects`,
    },
  });
}

export async function sendDonationReceivedEmail(to: string, amount: number, projectTitle: string) {
  return sendEmail({
    to,
    template: emailTemplates.donationReceived,
    data: {
      amount,
      projectTitle,
      projectUrl: `${process.env.NEXTAUTH_URL}/projects`,
    },
  });
}
