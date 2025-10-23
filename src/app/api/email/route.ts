import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { emailAutomationManager } from '@/lib/email-automation';
import logger from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json();

    switch (action) {
      case 'send-email':
        return await sendEmail(req, session.user.id);
      
      case 'create-template':
        return await createTemplate(req, session.user.id);
      
      case 'create-campaign':
        return await createCampaign(req, session.user.id);
      
      case 'create-automation':
        return await createAutomation(req, session.user.id);
      
      default:
        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    logger.error('Email API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'templates';

    let result;

    switch (type) {
      case 'templates':
        result = emailAutomationManager.getAllTemplates();
        break;
      case 'campaigns':
        result = emailAutomationManager.getAllCampaigns();
        break;
      case 'automations':
        result = emailAutomationManager.getAllAutomations();
        break;
      case 'analytics':
        result = await getAnalytics();
        break;
      default:
        return NextResponse.json({ message: 'Invalid type parameter' }, { status: 400 });
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    logger.error('Email API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

async function sendEmail(req: NextRequest, userId: string) {
  try {
    const { templateId, recipients, variables, campaignId } = await req.json();

    if (!templateId || !recipients || !Array.isArray(recipients)) {
      return NextResponse.json({ message: 'Invalid email parameters' }, { status: 400 });
    }

    const result = await emailAutomationManager.sendEmail(
      templateId,
      recipients,
      variables,
      campaignId
    );

    if (result.success) {
      logger.info('Email sent successfully', { userId, templateId, recipientCount: recipients.length });
      return NextResponse.json({ success: true, messageId: result.messageId });
    } else {
      logger.error('Failed to send email', { userId, templateId, error: result.error });
      return NextResponse.json({ message: result.error || 'Failed to send email' }, { status: 500 });
    }
  } catch (error) {
    logger.error('Error sending email:', error);
    return NextResponse.json({ message: 'Failed to send email' }, { status: 500 });
  }
}

async function createTemplate(req: NextRequest, userId: string) {
  try {
    const templateData = await req.json();

    const template = emailAutomationManager.createTemplate({
      ...templateData,
      createdBy: userId
    });

    logger.info('Email template created', { userId, templateId: template.id });
    return NextResponse.json({ success: true, template });
  } catch (error) {
    logger.error('Error creating template:', error);
    return NextResponse.json({ message: 'Failed to create template' }, { status: 500 });
  }
}

async function createCampaign(req: NextRequest, userId: string) {
  try {
    const campaignData = await req.json();

    const campaign = emailAutomationManager.createCampaign({
      ...campaignData,
      createdBy: userId
    });

    logger.info('Email campaign created', { userId, campaignId: campaign.id });
    return NextResponse.json({ success: true, campaign });
  } catch (error) {
    logger.error('Error creating campaign:', error);
    return NextResponse.json({ message: 'Failed to create campaign' }, { status: 500 });
  }
}

async function createAutomation(req: NextRequest, userId: string) {
  try {
    const automationData = await req.json();

    const automation = emailAutomationManager.createAutomation({
      ...automationData,
      createdBy: userId
    });

    logger.info('Email automation created', { userId, automationId: automation.id });
    return NextResponse.json({ success: true, automation });
  } catch (error) {
    logger.error('Error creating automation:', error);
    return NextResponse.json({ message: 'Failed to create automation' }, { status: 500 });
  }
}

async function getAnalytics() {
  try {
    const campaigns = emailAutomationManager.getAllCampaigns();
    const templates = emailAutomationManager.getAllTemplates();
    const automations = emailAutomationManager.getAllAutomations();

    // Calculate overall metrics
    const totalSent = campaigns.reduce((sum, campaign) => sum + campaign.metrics.sent, 0);
    const totalDelivered = campaigns.reduce((sum, campaign) => sum + campaign.metrics.delivered, 0);
    const totalOpened = campaigns.reduce((sum, campaign) => sum + campaign.metrics.opened, 0);
    const totalClicked = campaigns.reduce((sum, campaign) => sum + campaign.metrics.clicked, 0);
    const totalBounced = campaigns.reduce((sum, campaign) => sum + campaign.metrics.bounced, 0);
    const totalUnsubscribed = campaigns.reduce((sum, campaign) => sum + campaign.metrics.unsubscribed, 0);

    const metrics = {
      totalSent,
      totalDelivered,
      totalOpened,
      totalClicked,
      totalBounced,
      totalUnsubscribed,
      deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
      openRate: totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0,
      clickRate: totalDelivered > 0 ? (totalClicked / totalDelivered) * 100 : 0,
      bounceRate: totalSent > 0 ? (totalBounced / totalSent) * 100 : 0,
      unsubscribeRate: totalDelivered > 0 ? (totalUnsubscribed / totalDelivered) * 100 : 0
    };

    return {
      campaigns,
      templates,
      automations,
      metrics
    };
  } catch (error) {
    logger.error('Error getting analytics:', error);
    throw error;
  }
}
