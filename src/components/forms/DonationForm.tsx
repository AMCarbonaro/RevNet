'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { loadStripe } from '@stripe/stripe-js';

interface DonationFormProps {
  projectId: string;
  projectTitle: string;
  onSuccess?: () => void;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function DonationForm({ projectId, projectTitle, onSuccess }: DonationFormProps) {
  const { data: session } = useSession();
  const [amount, setAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState(session?.user?.name || '');
  const [donorEmail, setDonorEmail] = useState(session?.user?.email || '');
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  const presetAmounts = [25, 50, 100, 250, 500, 1000];

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setAmount(numValue);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || amount < 1) {
      alert('Please select a valid donation amount');
      return;
    }
    
    if (!donorName.trim() || !donorEmail.trim()) {
      alert('Please provide your name and email');
      return;
    }

    setLoading(true);
    
    try {
      // Create payment intent
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          projectId,
          donorName: donorName.trim(),
          donorEmail: donorEmail.trim(),
          message: message.trim(),
          anonymous
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error } = await stripe.confirmPayment({
        clientSecret: data.data.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/projects/${projectId}?donation=success`,
        },
      });

      if (error) {
        console.error('Payment confirmation error:', error);
        alert('Payment failed: ' + error.message);
      } else {
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Donation error:', error);
      alert('An error occurred while processing your donation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-holographic p-6">
      <h2 className="text-2xl font-bold text-terminal-green mb-6">
        Support This Project
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount Selection */}
        <div>
          <label className="block text-sm font-medium text-terminal-cyan mb-3">
            Select Donation Amount
          </label>
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            {presetAmounts.map(presetAmount => (
              <button
                key={presetAmount}
                type="button"
                onClick={() => handleAmountSelect(presetAmount)}
                className={`p-3 border rounded transition-colors ${
                  amount === presetAmount
                    ? 'border-terminal-green bg-terminal-green text-black'
                    : 'border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-black'
                }`}
              >
                ${presetAmount}
              </button>
            ))}
          </div>
          
          <div>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
              className="w-full px-3 py-2 bg-black border border-terminal-green rounded text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
              placeholder="Custom amount"
              min="1"
            />
          </div>
        </div>

        {/* Donor Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-terminal-cyan mb-2">
              Your Name *
            </label>
            <input
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              className="w-full px-3 py-2 bg-black border border-terminal-green rounded text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-terminal-cyan mb-2">
              Your Email *
            </label>
            <input
              type="email"
              value={donorEmail}
              onChange={(e) => setDonorEmail(e.target.value)}
              className="w-full px-3 py-2 bg-black border border-terminal-green rounded text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
              required
            />
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-terminal-cyan mb-2">
            Message (Optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-black border border-terminal-green rounded text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
            placeholder="Leave a message of support..."
          />
        </div>

        {/* Anonymous Donation */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="anonymous"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="anonymous" className="text-terminal-cyan text-sm">
            Make this donation anonymous
          </label>
        </div>

        {/* Donation Summary */}
        {amount > 0 && (
          <div className="p-4 bg-black/20 rounded border border-terminal-green">
            <div className="flex justify-between items-center">
              <span className="text-terminal-cyan">Donation Amount</span>
              <span className="text-terminal-green font-bold text-xl">
                ${amount.toLocaleString()}
              </span>
            </div>
            <div className="text-terminal-cyan text-sm mt-2">
              Supporting: {projectTitle}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || amount < 1}
          className="w-full btn-neon disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : `Donate $${amount.toLocaleString()}`}
        </button>
      </form>
    </div>
  );
}
