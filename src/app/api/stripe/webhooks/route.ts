import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, handleWebhookEvent } from '@/lib/stripe/webhooks';

export const runtime = 'nodejs';

/**
 * Stripe webhook endpoint
 * Receives and processes Stripe events
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify the webhook signature
    const event = verifyWebhookSignature(body, signature, webhookSecret);

    // Handle the event
    await handleWebhookEvent(event);

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 400 }
    );
  }
}
