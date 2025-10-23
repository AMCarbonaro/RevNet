import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
});

export interface ConnectAccountData {
  userId: string;
  email: string;
  country?: string;
  type?: 'express' | 'standard';
  businessType?: 'individual' | 'company';
}

export interface ConnectAccountStatus {
  id: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirements: {
    currentlyDue: string[];
    eventuallyDue: string[];
    pastDue: string[];
  };
}

/**
 * Create a Stripe Connect account for a user to receive payments
 */
export async function createConnectAccount(data: ConnectAccountData): Promise<Stripe.Account> {
  try {
    const account = await stripe.accounts.create({
      type: data.type || 'express',
      country: data.country || 'US',
      email: data.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      },
      business_type: data.businessType || 'individual',
      metadata: {
        userId: data.userId
      }
    });

    console.log(`✅ Created Connect account: ${account.id} for user ${data.userId}`);
    return account;
  } catch (error) {
    console.error('❌ Error creating Connect account:', error);
    throw error;
  }
}

/**
 * Create an account link for onboarding
 */
export async function createAccountLink(
  accountId: string,
  refreshUrl: string,
  returnUrl: string
): Promise<Stripe.AccountLink> {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding'
    });

    return accountLink;
  } catch (error) {
    console.error('❌ Error creating account link:', error);
    throw error;
  }
}

/**
 * Get Connect account status and requirements
 */
export async function getConnectAccountStatus(accountId: string): Promise<ConnectAccountStatus> {
  try {
    const account = await stripe.accounts.retrieve(accountId);

    return {
      id: account.id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      requirements: {
        currentlyDue: account.requirements?.currently_due || [],
        eventuallyDue: account.requirements?.eventually_due || [],
        pastDue: account.requirements?.past_due || []
      }
    };
  } catch (error) {
    console.error('❌ Error getting account status:', error);
    throw error;
  }
}

/**
 * Create a login link for Connect dashboard access
 */
export async function createDashboardLink(accountId: string): Promise<string> {
  try {
    const loginLink = await stripe.accounts.createLoginLink(accountId);
    return loginLink.url;
  } catch (error) {
    console.error('❌ Error creating dashboard link:', error);
    throw error;
  }
}

/**
 * Create a transfer to a Connect account
 */
export async function createTransfer(
  amount: number,
  destinationAccountId: string,
  metadata?: Record<string, string>
): Promise<Stripe.Transfer> {
  try {
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      destination: destinationAccountId,
      metadata: metadata || {}
    });

    console.log(`✅ Created transfer: ${transfer.id} for $${amount}`);
    return transfer;
  } catch (error) {
    console.error('❌ Error creating transfer:', error);
    throw error;
  }
}

/**
 * Create a payment with application fee (marketplace model)
 */
export async function createPaymentWithFee(
  amount: number,
  destinationAccountId: string,
  applicationFeeAmount: number,
  paymentMethodId: string,
  metadata?: Record<string, string>
): Promise<Stripe.PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      payment_method: paymentMethodId,
      confirmation_method: 'manual',
      confirm: false,
      application_fee_amount: Math.round(applicationFeeAmount * 100),
      transfer_data: {
        destination: destinationAccountId
      },
      metadata: metadata || {}
    });

    console.log(`✅ Created payment intent with fee: ${paymentIntent.id}`);
    return paymentIntent;
  } catch (error) {
    console.error('❌ Error creating payment with fee:', error);
    throw error;
  }
}

/**
 * Get account balance
 */
export async function getAccountBalance(accountId: string): Promise<Stripe.Balance> {
  try {
    const balance = await stripe.balance.retrieve({
      stripeAccount: accountId
    });

    return balance;
  } catch (error) {
    console.error('❌ Error getting account balance:', error);
    throw error;
  }
}

/**
 * List payouts for an account
 */
export async function listPayouts(
  accountId: string,
  limit: number = 10
): Promise<Stripe.Payout[]> {
  try {
    const payouts = await stripe.payouts.list(
      { limit },
      { stripeAccount: accountId }
    );

    return payouts.data;
  } catch (error) {
    console.error('❌ Error listing payouts:', error);
    throw error;
  }
}

/**
 * Delete/close a Connect account
 */
export async function deleteConnectAccount(accountId: string): Promise<Stripe.DeletedAccount> {
  try {
    const deleted = await stripe.accounts.del(accountId);
    console.log(`✅ Deleted Connect account: ${accountId}`);
    return deleted;
  } catch (error) {
    console.error('❌ Error deleting account:', error);
    throw error;
  }
}

/**
 * Update Connect account information
 */
export async function updateConnectAccount(
  accountId: string,
  updates: Partial<Stripe.AccountUpdateParams>
): Promise<Stripe.Account> {
  try {
    const account = await stripe.accounts.update(accountId, updates);
    console.log(`✅ Updated Connect account: ${accountId}`);
    return account;
  } catch (error) {
    console.error('❌ Error updating account:', error);
    throw error;
  }
}

export default {
  createConnectAccount,
  createAccountLink,
  getConnectAccountStatus,
  createDashboardLink,
  createTransfer,
  createPaymentWithFee,
  getAccountBalance,
  listPayouts,
  deleteConnectAccount,
  updateConnectAccount
};
