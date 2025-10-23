import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
});

export interface CreateInvoiceData {
  customerId: string;
  items: {
    description: string;
    amount: number;
    quantity?: number;
  }[];
  dueDate?: Date;
  autoAdvance?: boolean;
  metadata?: Record<string, string>;
}

/**
 * Create a draft invoice
 */
export async function createInvoice(data: CreateInvoiceData): Promise<Stripe.Invoice> {
  try {
    // Create invoice
    const invoice = await stripe.invoices.create({
      customer: data.customerId,
      auto_advance: data.autoAdvance ?? true,
      collection_method: 'send_invoice',
      days_until_due: data.dueDate 
        ? Math.ceil((data.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 30,
      metadata: data.metadata || {}
    });

    // Add invoice items
    for (const item of data.items) {
      await stripe.invoiceItems.create({
        customer: data.customerId,
        invoice: invoice.id,
        description: item.description,
        amount: Math.round(item.amount * 100),
        quantity: item.quantity || 1,
        currency: 'usd'
      });
    }

    console.log(`✅ Created invoice: ${invoice.id}`);
    return invoice;
  } catch (error) {
    console.error('❌ Error creating invoice:', error);
    throw error;
  }
}

/**
 * Get invoice details
 */
export async function getInvoice(invoiceId: string): Promise<Stripe.Invoice> {
  try {
    const invoice = await stripe.invoices.retrieve(invoiceId, {
      expand: ['customer', 'charge', 'payment_intent']
    });

    return invoice;
  } catch (error) {
    console.error('❌ Error getting invoice:', error);
    throw error;
  }
}

/**
 * List customer invoices
 */
export async function listCustomerInvoices(
  customerId: string,
  limit: number = 10
): Promise<Stripe.Invoice[]> {
  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit,
      expand: ['data.charge', 'data.payment_intent']
    });

    return invoices.data;
  } catch (error) {
    console.error('❌ Error listing invoices:', error);
    throw error;
  }
}

/**
 * Finalize and send invoice
 */
export async function finalizeInvoice(invoiceId: string): Promise<Stripe.Invoice> {
  try {
    const invoice = await stripe.invoices.finalizeInvoice(invoiceId, {
      auto_advance: true
    });

    console.log(`✅ Finalized invoice: ${invoiceId}`);
    return invoice;
  } catch (error) {
    console.error('❌ Error finalizing invoice:', error);
    throw error;
  }
}

/**
 * Send invoice to customer
 */
export async function sendInvoice(invoiceId: string): Promise<Stripe.Invoice> {
  try {
    const invoice = await stripe.invoices.sendInvoice(invoiceId);

    console.log(`✅ Sent invoice: ${invoiceId}`);
    return invoice;
  } catch (error) {
    console.error('❌ Error sending invoice:', error);
    throw error;
  }
}

/**
 * Pay invoice manually
 */
export async function payInvoice(invoiceId: string): Promise<Stripe.Invoice> {
  try {
    const invoice = await stripe.invoices.pay(invoiceId);

    console.log(`✅ Paid invoice: ${invoiceId}`);
    return invoice;
  } catch (error) {
    console.error('❌ Error paying invoice:', error);
    throw error;
  }
}

/**
 * Void invoice
 */
export async function voidInvoice(invoiceId: string): Promise<Stripe.Invoice> {
  try {
    const invoice = await stripe.invoices.voidInvoice(invoiceId);

    console.log(`✅ Voided invoice: ${invoiceId}`);
    return invoice;
  } catch (error) {
    console.error('❌ Error voiding invoice:', error);
    throw error;
  }
}

/**
 * Delete draft invoice
 */
export async function deleteInvoice(invoiceId: string): Promise<Stripe.DeletedInvoice> {
  try {
    const deleted = await stripe.invoices.del(invoiceId);

    console.log(`✅ Deleted invoice: ${invoiceId}`);
    return deleted;
  } catch (error) {
    console.error('❌ Error deleting invoice:', error);
    throw error;
  }
}

/**
 * Update invoice
 */
export async function updateInvoice(
  invoiceId: string,
  updates: Partial<Stripe.InvoiceUpdateParams>
): Promise<Stripe.Invoice> {
  try {
    const invoice = await stripe.invoices.update(invoiceId, updates);

    console.log(`✅ Updated invoice: ${invoiceId}`);
    return invoice;
  } catch (error) {
    console.error('❌ Error updating invoice:', error);
    throw error;
  }
}

/**
 * Mark invoice as uncollectible
 */
export async function markUncollectible(invoiceId: string): Promise<Stripe.Invoice> {
  try {
    const invoice = await stripe.invoices.markUncollectible(invoiceId);

    console.log(`✅ Marked invoice as uncollectible: ${invoiceId}`);
    return invoice;
  } catch (error) {
    console.error('❌ Error marking uncollectible:', error);
    throw error;
  }
}

/**
 * Get upcoming invoice for customer
 */
export async function getUpcomingInvoice(customerId: string): Promise<Stripe.Invoice> {
  try {
    const invoice = await stripe.invoices.retrieveUpcoming({
      customer: customerId
    });

    return invoice;
  } catch (error) {
    console.error('❌ Error getting upcoming invoice:', error);
    throw error;
  }
}

/**
 * List all invoices (admin)
 */
export async function listAllInvoices(
  limit: number = 100,
  status?: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void'
): Promise<Stripe.Invoice[]> {
  try {
    const params: Stripe.InvoiceListParams = {
      limit,
      expand: ['data.customer', 'data.charge']
    };

    if (status) {
      params.status = status;
    }

    const invoices = await stripe.invoices.list(params);

    return invoices.data;
  } catch (error) {
    console.error('❌ Error listing all invoices:', error);
    throw error;
  }
}

/**
 * Create invoice item (add line item to invoice)
 */
export async function createInvoiceItem(
  customerId: string,
  description: string,
  amount: number,
  invoiceId?: string
): Promise<Stripe.InvoiceItem> {
  try {
    const params: Stripe.InvoiceItemCreateParams = {
      customer: customerId,
      description,
      amount: Math.round(amount * 100),
      currency: 'usd'
    };

    if (invoiceId) {
      params.invoice = invoiceId;
    }

    const invoiceItem = await stripe.invoiceItems.create(params);

    console.log(`✅ Created invoice item: ${invoiceItem.id}`);
    return invoiceItem;
  } catch (error) {
    console.error('❌ Error creating invoice item:', error);
    throw error;
  }
}

/**
 * Get invoice PDF
 */
export async function getInvoicePDF(invoiceId: string): Promise<string | null> {
  try {
    const invoice = await stripe.invoices.retrieve(invoiceId);
    return invoice.invoice_pdf || null;
  } catch (error) {
    console.error('❌ Error getting invoice PDF:', error);
    throw error;
  }
}

/**
 * Get invoice statistics for a customer
 */
export async function getCustomerInvoiceStats(customerId: string): Promise<{
  total: number;
  paid: number;
  open: number;
  overdue: number;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
}> {
  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 100
    });

    const stats = {
      total: invoices.data.length,
      paid: 0,
      open: 0,
      overdue: 0,
      totalAmount: 0,
      paidAmount: 0,
      unpaidAmount: 0
    };

    invoices.data.forEach((invoice) => {
      stats.totalAmount += invoice.amount_due / 100;

      if (invoice.status === 'paid') {
        stats.paid++;
        stats.paidAmount += invoice.amount_paid / 100;
      } else if (invoice.status === 'open') {
        stats.open++;
        stats.unpaidAmount += invoice.amount_due / 100;

        // Check if overdue
        if (invoice.due_date && invoice.due_date < Math.floor(Date.now() / 1000)) {
          stats.overdue++;
        }
      }
    });

    return stats;
  } catch (error) {
    console.error('❌ Error getting invoice stats:', error);
    throw error;
  }
}

export default {
  createInvoice,
  getInvoice,
  listCustomerInvoices,
  finalizeInvoice,
  sendInvoice,
  payInvoice,
  voidInvoice,
  deleteInvoice,
  updateInvoice,
  markUncollectible,
  getUpcomingInvoice,
  listAllInvoices,
  createInvoiceItem,
  getInvoicePDF,
  getCustomerInvoiceStats
};
