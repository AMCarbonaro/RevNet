import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe, formatAmountForStripe } from '@/lib/stripe';
import { DonationModel } from '@/lib/models';
import connectDB from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, projectId, donorName, donorEmail, message, anonymous } = await request.json();
    
    if (!amount || !projectId || !donorName || !donorEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (amount < 1) {
      return NextResponse.json(
        { error: 'Amount must be at least $1' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Create donation record
    const donation = new DonationModel({
      id: `donation_${Date.now()}`,
      projectId,
      donorId: session.user.id,
      donorName,
      donorEmail,
      amount,
      message: message || '',
      anonymous: anonymous || false,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const savedDonation = await donation.save();
    
    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(amount),
      currency: 'usd',
      metadata: {
        donationId: savedDonation.id,
        projectId,
        donorId: session.user.id,
        donorName,
        donorEmail
      },
      description: `Donation to project ${projectId}`,
    });
    
    // Update donation with payment intent ID
    savedDonation.stripePaymentIntentId = paymentIntent.id;
    await savedDonation.save();
    
    return NextResponse.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        donationId: savedDonation.id
      }
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
