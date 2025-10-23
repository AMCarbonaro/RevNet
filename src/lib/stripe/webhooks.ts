import Stripe from 'stripe';
import { connectDB } from '../mongodb';
import { UserModel, DonationModel, ProjectModel } from '../models';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
});

export type WebhookEvent = Stripe.Event;

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  try {
    const event = stripe.webhooks.constructEvent(payload, signature, secret);
    return event;
  } catch (error) {
    console.error('❌ Webhook signature verification failed:', error);
    throw new Error('Invalid signature');
  }
}

/**
 * Handle payment intent succeeded
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  console.log(`✅ Payment succeeded: ${paymentIntent.id}`);

  await connectDB();

  const { userId, projectId, donationType } = paymentIntent.metadata;

  if (userId && projectId) {
    // Update donation record
    await DonationModel.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      {
        status: 'completed',
        completedAt: new Date()
      }
    );

    // Update project funding
    const project = await ProjectModel.findOne({ id: projectId });
    if (project) {
      project.currentAmount += paymentIntent.amount / 100;
      await project.save();
    }

    // Update user stats
    const user = await UserModel.findOne({ id: userId });
    if (user) {
      user.stats.totalDonations += paymentIntent.amount / 100;
      await user.save();
    }
  }
}

/**
 * Handle payment intent failed
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  console.log(`❌ Payment failed: ${paymentIntent.id}`);

  await connectDB();

  // Update donation record
  await DonationModel.findOneAndUpdate(
    { stripePaymentIntentId: paymentIntent.id },
    {
      status: 'failed',
      failedAt: new Date()
    }
  );
}

/**
 * Handle charge refunded
 */
async function handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
  console.log(`💰 Refund processed: ${charge.id}`);

  await connectDB();

  const paymentIntent = charge.payment_intent as string;

  // Update donation record
  const donation = await DonationModel.findOne({ stripePaymentIntentId: paymentIntent });
  if (donation) {
    donation.status = 'refunded';
    donation.refundedAt = new Date();
    await donation.save();

    // Reverse project funding
    const project = await ProjectModel.findOne({ id: donation.projectId });
    if (project) {
      project.currentAmount -= donation.amount;
      await project.save();
    }

    // Reverse user stats
    const user = await UserModel.findOne({ id: donation.userId });
    if (user) {
      user.stats.totalDonations -= donation.amount;
      await user.save();
    }
  }
}

/**
 * Handle customer subscription created
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
  console.log(`📅 Subscription created: ${subscription.id}`);

  await connectDB();

  const customerId = subscription.customer as string;
  const user = await UserModel.findOne({ stripeCustomerId: customerId });

  if (user) {
    // Add subscription info to user
    if (!user.subscriptions) {
      user.subscriptions = [];
    }

    user.subscriptions.push({
      id: subscription.id,
      status: subscription.status,
      priceId: subscription.items.data[0].price.id,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000)
    } as any);

    await user.save();
  }
}

/**
 * Handle customer subscription updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  console.log(`📅 Subscription updated: ${subscription.id}`);

  await connectDB();

  const customerId = subscription.customer as string;
  const user = await UserModel.findOne({ stripeCustomerId: customerId });

  if (user && user.subscriptions) {
    const subIndex = (user.subscriptions as any[]).findIndex(
      (sub: any) => sub.id === subscription.id
    );

    if (subIndex !== -1) {
      (user.subscriptions as any[])[subIndex] = {
        id: subscription.id,
        status: subscription.status,
        priceId: subscription.items.data[0].price.id,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000)
      };

      await user.save();
    }
  }
}

/**
 * Handle customer subscription deleted
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  console.log(`📅 Subscription deleted: ${subscription.id}`);

  await connectDB();

  const customerId = subscription.customer as string;
  const user = await UserModel.findOne({ stripeCustomerId: customerId });

  if (user && user.subscriptions) {
    user.subscriptions = (user.subscriptions as any[]).filter(
      (sub: any) => sub.id !== subscription.id
    );

    await user.save();
  }
}

/**
 * Handle invoice payment succeeded
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  console.log(`📄 Invoice paid: ${invoice.id}`);

  await connectDB();

  // Handle subscription invoices
  if (invoice.subscription) {
    const customerId = invoice.customer as string;
    const user = await UserModel.findOne({ stripeCustomerId: customerId });

    if (user) {
      // Update user subscription status
      // Additional logic as needed
    }
  }
}

/**
 * Handle invoice payment failed
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  console.log(`📄 Invoice payment failed: ${invoice.id}`);

  await connectDB();

  // Send notification to user about failed payment
  const customerId = invoice.customer as string;
  const user = await UserModel.findOne({ stripeCustomerId: customerId });

  if (user) {
    // TODO: Send email notification about failed payment
    console.log(`⚠️ Notify user ${user.email} about failed payment`);
  }
}

/**
 * Handle Connect account updated
 */
async function handleAccountUpdated(account: Stripe.Account): Promise<void> {
  console.log(`🔗 Connect account updated: ${account.id}`);

  await connectDB();

  const userId = account.metadata?.userId;
  if (userId) {
    const user = await UserModel.findOne({ id: userId });
    if (user) {
      // Update connect account status
      user.connectAccountStatus = {
        accountId: account.id,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted
      } as any;

      await user.save();
    }
  }
}

/**
 * Handle dispute created
 */
async function handleDisputeCreated(dispute: Stripe.Dispute): Promise<void> {
  console.log(`⚠️ Dispute created: ${dispute.id}`);

  await connectDB();

  const chargeId = dispute.charge as string;

  // Log dispute for admin review
  // TODO: Send notification to admin
  console.log(`⚠️ Dispute requires attention: ${dispute.id}`);
}

/**
 * Main webhook handler - routes events to appropriate handlers
 */
export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  console.log(`📥 Webhook received: ${event.type}`);

  try {
    switch (event.type) {
      // Payment Intents
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      // Charges
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      // Subscriptions
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      // Invoices
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      // Connect Accounts
      case 'account.updated':
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;

      // Disputes
      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object as Stripe.Dispute);
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`❌ Error handling webhook event ${event.type}:`, error);
    throw error;
  }
}

export default {
  verifyWebhookSignature,
  handleWebhookEvent
};
