import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { DonationModel, ProjectModel } from '@/lib/models';
import connectDB from '@/lib/db';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    
    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
    }
    
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
    
    await connectDB();
    
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Find the donation record
        const donation = await DonationModel.findOne({
          stripePaymentIntentId: paymentIntent.id
        });
        
        if (!donation) {
          console.error('Donation not found for payment intent:', paymentIntent.id);
          break;
        }
        
        // Update donation status
        donation.status = 'completed';
        donation.updatedAt = new Date();
        await donation.save();
        
        // Update project funding
        const project = await ProjectModel.findOne({ id: donation.projectId });
        if (project) {
          project.currentFunding += donation.amount;
          project.backers += 1;
          project.updatedAt = new Date();
          await project.save();
          
          // Check FEC compliance thresholds
          await checkFecCompliance(project);
        }
        
        console.log('Payment succeeded for donation:', donation.id);
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Find the donation record
        const donation = await DonationModel.findOne({
          stripePaymentIntentId: paymentIntent.id
        });
        
        if (donation) {
          donation.status = 'failed';
          donation.updatedAt = new Date();
          await donation.save();
        }
        
        console.log('Payment failed for payment intent:', paymentIntent.id);
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}

async function checkFecCompliance(project: any) {
  try {
    // FEC compliance thresholds
    const threshold4500 = 4500;
    const threshold5000 = 5000;
    
    if (project.currentFunding >= threshold4500 && project.currentFunding < threshold5000) {
      // Send warning notification
      console.log(`FEC compliance warning: Project ${project.id} has reached $4,500 threshold`);
      // TODO: Send notification to project creator
    }
    
    if (project.currentFunding >= threshold5000) {
      // Send alert notification
      console.log(`FEC compliance alert: Project ${project.id} has reached $5,000 threshold`);
      // TODO: Send alert to project creator and provide legal resources
    }
  } catch (error) {
    console.error('Error checking FEC compliance:', error);
  }
}
