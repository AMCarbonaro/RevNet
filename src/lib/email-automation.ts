import { logInfo, logError } from './logger';
import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  category: 'transactional' | 'marketing' | 'notification' | 'system';
  status: 'active' | 'inactive' | 'draft';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  description: string;
  templateId: string;
  targetAudience: {
    type: 'all' | 'segment' | 'custom';
    criteria: Record<string, any>;
  };
  schedule: {
    type: 'immediate' | 'scheduled' | 'recurring';
    date?: Date;
    interval?: string;
  };
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface EmailAutomation {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'event' | 'schedule' | 'condition';
    event?: string;
    condition?: Record<string, any>;
    schedule?: string;
  };
  actions: Array<{
    type: 'send_email' | 'wait' | 'condition';
    templateId?: string;
    delay?: number;
    condition?: Record<string, any>;
  }>;
  status: 'active' | 'inactive' | 'draft';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface EmailRecipient {
  email: string;
  name?: string;
  variables?: Record<string, any>;
  unsubscribeToken?: string;
  preferences?: {
    frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
    categories: string[];
  };
}

export interface EmailMetrics {
  campaignId: string;
  recipientId: string;
  event: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export class EmailAutomationManager {
  private static instance: EmailAutomationManager;
  private templates: Map<string, EmailTemplate> = new Map();
  private campaigns: Map<string, EmailCampaign> = new Map();
  private automations: Map<string, EmailAutomation> = new Map();
  private metrics: Map<string, EmailMetrics[]> = new Map();
  private transporter: nodemailer.Transporter;
  private sendGridApiKey: string;

  static getInstance(): EmailAutomationManager {
    if (!EmailAutomationManager.instance) {
      EmailAutomationManager.instance = new EmailAutomationManager();
    }
    return EmailAutomationManager.instance;
  }

  constructor() {
    this.sendGridApiKey = process.env.SENDGRID_API_KEY || '';
    this.initializeTransporter();
    this.initializeSendGrid();
    this.loadDefaultTemplates();
  }

  private initializeTransporter(): void {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  private initializeSendGrid(): void {
    if (this.sendGridApiKey) {
      sgMail.setApiKey(this.sendGridApiKey);
    }
  }

  private loadDefaultTemplates(): void {
    const defaultTemplates: EmailTemplate[] = [
      {
        id: 'welcome',
        name: 'Welcome Email',
        subject: 'Welcome to Revolution Network!',
        htmlContent: this.getWelcomeTemplate(),
        textContent: 'Welcome to Revolution Network! Start your revolutionary journey today.',
        variables: ['userName', 'userEmail', 'loginUrl'],
        category: 'transactional',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      },
      {
        id: 'project_update',
        name: 'Project Update',
        subject: 'Project Update: {{projectTitle}}',
        htmlContent: this.getProjectUpdateTemplate(),
        textContent: 'Your project {{projectTitle}} has been updated.',
        variables: ['userName', 'projectTitle', 'projectUrl', 'updateContent'],
        category: 'notification',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      },
      {
        id: 'donation_receipt',
        name: 'Donation Receipt',
        subject: 'Thank you for your donation to {{projectTitle}}',
        htmlContent: this.getDonationReceiptTemplate(),
        textContent: 'Thank you for your donation to {{projectTitle}}.',
        variables: ['userName', 'projectTitle', 'amount', 'transactionId', 'receiptUrl'],
        category: 'transactional',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      },
      {
        id: 'newsletter',
        name: 'Weekly Newsletter',
        subject: 'Revolution Network Weekly Update',
        htmlContent: this.getNewsletterTemplate(),
        textContent: 'Your weekly Revolution Network update.',
        variables: ['userName', 'featuredProjects', 'news', 'events'],
        category: 'marketing',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      },
      {
        id: 'security_alert',
        name: 'Security Alert',
        subject: 'Security Alert: {{alertType}}',
        htmlContent: this.getSecurityAlertTemplate(),
        textContent: 'Security alert: {{alertType}}',
        variables: ['userName', 'alertType', 'alertDescription', 'actionRequired'],
        category: 'system',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      }
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  // Template Management
  createTemplate(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): EmailTemplate {
    const newTemplate: EmailTemplate = {
      ...template,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.templates.set(newTemplate.id, newTemplate);
    logInfo('Email template created', { templateId: newTemplate.id, name: newTemplate.name });
    return newTemplate;
  }

  getTemplate(templateId: string): EmailTemplate | undefined {
    return this.templates.get(templateId);
  }

  getAllTemplates(): EmailTemplate[] {
    return Array.from(this.templates.values());
  }

  updateTemplate(templateId: string, updates: Partial<EmailTemplate>): boolean {
    const template = this.templates.get(templateId);
    if (!template) return false;

    const updatedTemplate = {
      ...template,
      ...updates,
      updatedAt: new Date()
    };

    this.templates.set(templateId, updatedTemplate);
    logInfo('Email template updated', { templateId, name: updatedTemplate.name });
    return true;
  }

  deleteTemplate(templateId: string): boolean {
    const deleted = this.templates.delete(templateId);
    if (deleted) {
      logInfo('Email template deleted', { templateId });
    }
    return deleted;
  }

  // Campaign Management
  createCampaign(campaign: Omit<EmailCampaign, 'id' | 'createdAt' | 'updatedAt' | 'metrics'>): EmailCampaign {
    const newCampaign: EmailCampaign = {
      ...campaign,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      metrics: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0
      }
    };

    this.campaigns.set(newCampaign.id, newCampaign);
    logInfo('Email campaign created', { campaignId: newCampaign.id, name: newCampaign.name });
    return newCampaign;
  }

  getCampaign(campaignId: string): EmailCampaign | undefined {
    return this.campaigns.get(campaignId);
  }

  getAllCampaigns(): EmailCampaign[] {
    return Array.from(this.campaigns.values());
  }

  updateCampaign(campaignId: string, updates: Partial<EmailCampaign>): boolean {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return false;

    const updatedCampaign = {
      ...campaign,
      ...updates,
      updatedAt: new Date()
    };

    this.campaigns.set(campaignId, updatedCampaign);
    logInfo('Email campaign updated', { campaignId, name: updatedCampaign.name });
    return true;
  }

  // Automation Management
  createAutomation(automation: Omit<EmailAutomation, 'id' | 'createdAt' | 'updatedAt'>): EmailAutomation {
    const newAutomation: EmailAutomation = {
      ...automation,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.automations.set(newAutomation.id, newAutomation);
    logInfo('Email automation created', { automationId: newAutomation.id, name: newAutomation.name });
    return newAutomation;
  }

  getAutomation(automationId: string): EmailAutomation | undefined {
    return this.automations.get(automationId);
  }

  getAllAutomations(): EmailAutomation[] {
    return Array.from(this.automations.values());
  }

  // Email Sending
  async sendEmail(
    templateId: string,
    recipients: EmailRecipient[],
    variables: Record<string, any> = {},
    campaignId?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const template = this.getTemplate(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      const results = [];
      for (const recipient of recipients) {
        const result = await this.sendSingleEmail(template, recipient, variables, campaignId);
        results.push(result);
      }

      const successCount = results.filter(r => r.success).length;
      logInfo('Email sending completed', { 
        templateId, 
        totalRecipients: recipients.length, 
        successCount 
      });

      return {
        success: successCount > 0,
        messageId: results[0]?.messageId
      };
    } catch (error) {
      logError(error as Error, { context: 'email_sending', templateId });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async sendSingleEmail(
    template: EmailTemplate,
    recipient: EmailRecipient,
    variables: Record<string, any>,
    campaignId?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Merge variables
      const allVariables = {
        ...variables,
        ...recipient.variables,
        recipientName: recipient.name,
        recipientEmail: recipient.email,
        unsubscribeUrl: recipient.unsubscribeToken ? 
          `${process.env.NEXTAUTH_URL}/unsubscribe?token=${recipient.unsubscribeToken}` : 
          `${process.env.NEXTAUTH_URL}/unsubscribe`
      };

      // Process template
      const processedSubject = this.processTemplate(template.subject, allVariables);
      const processedHtml = this.processTemplate(template.htmlContent, allVariables);
      const processedText = this.processTemplate(template.textContent, allVariables);

      // Send email
      const emailOptions = {
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: recipient.email,
        subject: processedSubject,
        html: processedHtml,
        text: processedText,
        headers: {
          'X-Campaign-ID': campaignId,
          'X-Template-ID': template.id
        }
      };

      let messageId: string;
      if (this.sendGridApiKey) {
        const response = await sgMail.send(emailOptions);
        messageId = response[0].headers['x-message-id'] || 'sendgrid-' + Date.now();
      } else {
        const info = await this.transporter.sendMail(emailOptions);
        messageId = info.messageId || 'smtp-' + Date.now();
      }

      // Track metrics
      this.trackEmailMetrics(campaignId || 'direct', recipient.email, 'sent', { messageId });

      return { success: true, messageId };
    } catch (error) {
      logError(error as Error, { context: 'single_email_sending', recipient: recipient.email });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private processTemplate(content: string, variables: Record<string, any>): string {
    let processed = content;
    
    // Replace variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, String(value || ''));
    });

    // Remove unused variables
    processed = processed.replace(/{{[^}]+}}/g, '');

    return processed;
  }

  // Metrics Tracking
  trackEmailMetrics(
    campaignId: string,
    recipientId: string,
    event: EmailMetrics['event'],
    metadata?: Record<string, any>
  ): void {
    const metric: EmailMetrics = {
      campaignId,
      recipientId,
      event,
      timestamp: new Date(),
      metadata
    };

    if (!this.metrics.has(campaignId)) {
      this.metrics.set(campaignId, []);
    }

    this.metrics.get(campaignId)!.push(metric);

    // Update campaign metrics
    const campaign = this.campaigns.get(campaignId);
    if (campaign) {
      switch (event) {
        case 'sent':
          campaign.metrics.sent++;
          break;
        case 'delivered':
          campaign.metrics.delivered++;
          break;
        case 'opened':
          campaign.metrics.opened++;
          break;
        case 'clicked':
          campaign.metrics.clicked++;
          break;
        case 'bounced':
          campaign.metrics.bounced++;
          break;
        case 'unsubscribed':
          campaign.metrics.unsubscribed++;
          break;
      }
    }
  }

  getCampaignMetrics(campaignId: string): EmailMetrics[] {
    return this.metrics.get(campaignId) || [];
  }

  // Template Content
  private getWelcomeTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Revolution Network</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #39FF14, #00FF00); padding: 30px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 30px; background: #39FF14; color: #000; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #000; margin: 0;">Welcome to Revolution Network!</h1>
          </div>
          <div class="content">
            <h2>Hello {{userName}}!</h2>
            <p>Welcome to the Revolution Network - where ideas become reality and change begins.</p>
            <p>You're now part of a community of visionaries, creators, and revolutionaries working together to build a better future.</p>
            <p>Here's what you can do next:</p>
            <ul>
              <li>Complete "The Anthony Letters" to unlock full platform access</li>
              <li>Explore revolutionary projects and ideas</li>
              <li>Connect with like-minded individuals</li>
              <li>Start your own revolutionary project</li>
            </ul>
            <p style="text-align: center; margin: 30px 0;">
              <a href="{{loginUrl}}" class="button">Start Your Journey</a>
            </p>
            <p>Thank you for joining the revolution!</p>
            <p>The Revolution Network Team</p>
          </div>
          <div class="footer">
            <p>You received this email because you signed up for Revolution Network.</p>
            <p><a href="{{unsubscribeUrl}}">Unsubscribe</a> | <a href="{{loginUrl}}">Manage Preferences</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getProjectUpdateTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Project Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #39FF14, #00FF00); padding: 30px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 30px; background: #39FF14; color: #000; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #000; margin: 0;">Project Update</h1>
          </div>
          <div class="content">
            <h2>Hello {{userName}}!</h2>
            <p>We have an exciting update for the project <strong>{{projectTitle}}</strong>:</p>
            <div style="background: white; padding: 20px; border-left: 4px solid #39FF14; margin: 20px 0;">
              {{updateContent}}
            </div>
            <p style="text-align: center; margin: 30px 0;">
              <a href="{{projectUrl}}" class="button">View Project</a>
            </p>
            <p>Thank you for your continued support!</p>
            <p>The Revolution Network Team</p>
          </div>
          <div class="footer">
            <p>You received this email because you're following this project.</p>
            <p><a href="{{unsubscribeUrl}}">Unsubscribe</a> | <a href="{{projectUrl}}">Manage Notifications</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getDonationReceiptTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Donation Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #39FF14, #00FF00); padding: 30px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .receipt { background: white; padding: 20px; border: 1px solid #ddd; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #39FF14; color: #000; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #000; margin: 0;">Thank You for Your Donation!</h1>
          </div>
          <div class="content">
            <h2>Hello {{userName}}!</h2>
            <p>Thank you for your generous donation to <strong>{{projectTitle}}</strong>!</p>
            <div class="receipt">
              <h3>Donation Receipt</h3>
              <p><strong>Project:</strong> {{projectTitle}}</p>
              <p><strong>Amount:</strong> ${{amount}}</p>
              <p><strong>Transaction ID:</strong> {{transactionId}}</p>
              <p><strong>Date:</strong> {{date}}</p>
            </div>
            <p style="text-align: center; margin: 30px 0;">
              <a href="{{receiptUrl}}" class="button">Download Receipt</a>
            </p>
            <p>Your support helps make revolutionary ideas a reality!</p>
            <p>The Revolution Network Team</p>
          </div>
          <div class="footer">
            <p>This is your official donation receipt for tax purposes.</p>
            <p><a href="{{unsubscribeUrl}}">Unsubscribe</a> | <a href="{{receiptUrl}}">Manage Donations</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getNewsletterTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Revolution Network Weekly Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #39FF14, #00FF00); padding: 30px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .section { margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #39FF14; color: #000; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #000; margin: 0;">Revolution Network Weekly Update</h1>
          </div>
          <div class="content">
            <h2>Hello {{userName}}!</h2>
            <p>Here's what's happening in the Revolution Network this week:</p>
            
            <div class="section">
              <h3>Featured Projects</h3>
              {{featuredProjects}}
            </div>
            
            <div class="section">
              <h3>Latest News</h3>
              {{news}}
            </div>
            
            <div class="section">
              <h3>Upcoming Events</h3>
              {{events}}
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="{{loginUrl}}" class="button">Explore Now</a>
            </p>
            <p>Keep revolutionizing!</p>
            <p>The Revolution Network Team</p>
          </div>
          <div class="footer">
            <p>You received this email because you subscribed to our newsletter.</p>
            <p><a href="{{unsubscribeUrl}}">Unsubscribe</a> | <a href="{{loginUrl}}">Manage Preferences</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getSecurityAlertTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Security Alert</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #FF4444, #FF6666); padding: 30px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .alert { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #FF4444; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #fff; margin: 0;">Security Alert</h1>
          </div>
          <div class="content">
            <h2>Hello {{userName}}!</h2>
            <div class="alert">
              <h3>Security Alert: {{alertType}}</h3>
              <p><strong>Description:</strong> {{alertDescription}}</p>
              <p><strong>Action Required:</strong> {{actionRequired}}</p>
            </div>
            <p>If you did not initiate this activity, please secure your account immediately.</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="{{loginUrl}}" class="button">Secure Account</a>
            </p>
            <p>For your security, we recommend:</p>
            <ul>
              <li>Changing your password</li>
              <li>Enabling two-factor authentication</li>
              <li>Reviewing your recent activity</li>
            </ul>
            <p>The Revolution Network Security Team</p>
          </div>
          <div class="footer">
            <p>This is an automated security alert. Please do not reply to this email.</p>
            <p><a href="{{unsubscribeUrl}}">Unsubscribe</a> | <a href="{{loginUrl}}">Security Center</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateId(): string {
    return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const emailAutomationManager = EmailAutomationManager.getInstance();
