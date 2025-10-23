import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
});

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  amount: number;
  interval: 'month' | 'year';
  features: string[];
  priceId?: string;
  productId?: string;
}

export interface CreateSubscriptionData {
  customerId: string;
  priceId: string;
  trialDays?: number;
  metadata?: Record<string, string>;
}

/**
 * Create or get subscription plans (products and prices)
 */
export async function createSubscriptionPlan(plan: SubscriptionPlan): Promise<{
  product: Stripe.Product;
  price: Stripe.Price;
}> {
  try {
    // Create product
    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: {
        features: JSON.stringify(plan.features)
      }
    });

    // Create price
    const price = await stripe.prices.create({
      product: product.id,
      currency: 'usd',
      unit_amount: Math.round(plan.amount * 100),
      recurring: {
        interval: plan.interval
      }
    });

    console.log(`✅ Created subscription plan: ${product.id}`);
    return { product, price };
  } catch (error) {
    console.error('❌ Error creating subscription plan:', error);
    throw error;
  }
}

/**
 * List all subscription plans
 */
export async function listSubscriptionPlans(): Promise<Stripe.Product[]> {
  try {
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price']
    });

    return products.data;
  } catch (error) {
    console.error('❌ Error listing subscription plans:', error);
    throw error;
  }
}

/**
 * Create a subscription for a customer
 */
export async function createSubscription(data: CreateSubscriptionData): Promise<Stripe.Subscription> {
  try {
    const subscriptionData: Stripe.SubscriptionCreateParams = {
      customer: data.customerId,
      items: [{ price: data.priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: data.metadata || {}
    };

    // Add trial if specified
    if (data.trialDays && data.trialDays > 0) {
      subscriptionData.trial_period_days = data.trialDays;
    }

    const subscription = await stripe.subscriptions.create(subscriptionData);

    console.log(`✅ Created subscription: ${subscription.id}`);
    return subscription;
  } catch (error) {
    console.error('❌ Error creating subscription:', error);
    throw error;
  }
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['customer', 'default_payment_method', 'items.data.price.product']
    });

    return subscription;
  } catch (error) {
    console.error('❌ Error getting subscription:', error);
    throw error;
  }
}

/**
 * List customer subscriptions
 */
export async function listCustomerSubscriptions(customerId: string): Promise<Stripe.Subscription[]> {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      expand: ['data.default_payment_method', 'data.items.data.price.product']
    });

    return subscriptions.data;
  } catch (error) {
    console.error('❌ Error listing subscriptions:', error);
    throw error;
  }
}

/**
 * Update subscription (change plan, quantity, etc.)
 */
export async function updateSubscription(
  subscriptionId: string,
  updates: Partial<Stripe.SubscriptionUpdateParams>
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, updates);

    console.log(`✅ Updated subscription: ${subscriptionId}`);
    return subscription;
  } catch (error) {
    console.error('❌ Error updating subscription:', error);
    throw error;
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  immediately: boolean = false
): Promise<Stripe.Subscription> {
  try {
    let subscription: Stripe.Subscription;

    if (immediately) {
      subscription = await stripe.subscriptions.cancel(subscriptionId);
    } else {
      subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });
    }

    console.log(`✅ Cancelled subscription: ${subscriptionId} (immediate: ${immediately})`);
    return subscription;
  } catch (error) {
    console.error('❌ Error cancelling subscription:', error);
    throw error;
  }
}

/**
 * Resume a cancelled subscription
 */
export async function resumeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false
    });

    console.log(`✅ Resumed subscription: ${subscriptionId}`);
    return subscription;
  } catch (error) {
    console.error('❌ Error resuming subscription:', error);
    throw error;
  }
}

/**
 * Pause subscription
 */
export async function pauseSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      pause_collection: {
        behavior: 'mark_uncollectible'
      }
    });

    console.log(`✅ Paused subscription: ${subscriptionId}`);
    return subscription;
  } catch (error) {
    console.error('❌ Error pausing subscription:', error);
    throw error;
  }
}

/**
 * Unpause subscription
 */
export async function unpauseSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      pause_collection: null as any
    });

    console.log(`✅ Unpaused subscription: ${subscriptionId}`);
    return subscription;
  } catch (error) {
    console.error('❌ Error unpausing subscription:', error);
    throw error;
  }
}

/**
 * Preview upcoming invoice for subscription
 */
export async function previewSubscriptionInvoice(
  subscriptionId: string
): Promise<Stripe.Invoice> {
  try {
    const invoice = await stripe.invoices.retrieveUpcoming({
      subscription: subscriptionId
    });

    return invoice;
  } catch (error) {
    console.error('❌ Error previewing invoice:', error);
    throw error;
  }
}

/**
 * Get subscription usage (for metered billing)
 */
export async function getSubscriptionUsage(
  subscriptionItemId: string
): Promise<Stripe.UsageRecord[]> {
  try {
    const usageRecords = await stripe.subscriptionItems.listUsageRecordSummaries(
      subscriptionItemId,
      { limit: 100 }
    );

    return usageRecords.data;
  } catch (error) {
    console.error('❌ Error getting usage:', error);
    throw error;
  }
}

/**
 * Create usage record (for metered billing)
 */
export async function createUsageRecord(
  subscriptionItemId: string,
  quantity: number,
  timestamp?: number
): Promise<Stripe.UsageRecord> {
  try {
    const usageRecord = await stripe.subscriptionItems.createUsageRecord(
      subscriptionItemId,
      {
        quantity,
        timestamp: timestamp || Math.floor(Date.now() / 1000),
        action: 'increment'
      }
    );

    console.log(`✅ Created usage record: ${quantity} units`);
    return usageRecord;
  } catch (error) {
    console.error('❌ Error creating usage record:', error);
    throw error;
  }
}

export default {
  createSubscriptionPlan,
  listSubscriptionPlans,
  createSubscription,
  getSubscription,
  listCustomerSubscriptions,
  updateSubscription,
  cancelSubscription,
  resumeSubscription,
  pauseSubscription,
  unpauseSubscription,
  previewSubscriptionInvoice,
  getSubscriptionUsage,
  createUsageRecord
};
