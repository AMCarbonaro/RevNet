'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Plus, Trash2, Check, Loader, Star } from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
}

interface PaymentMethodsProps {
  customerId: string;
  className?: string;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  customerId,
  className = ''
}) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showAddCard, setShowAddCard] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
  }, [customerId]);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch(`/api/stripe/payment-methods?customerId=${customerId}`);
      const data = await response.json();
      setPaymentMethods(data.paymentMethods || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    setActionLoading(paymentMethodId);
    try {
      const response = await fetch('/api/stripe/payment-methods/set-default', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, paymentMethodId })
      });

      if (response.ok) {
        await fetchPaymentMethods();
      }
    } catch (error) {
      console.error('Error setting default payment method:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (paymentMethodId: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) return;

    setActionLoading(paymentMethodId);
    try {
      const response = await fetch('/api/stripe/payment-methods/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId })
      });

      if (response.ok) {
        await fetchPaymentMethods();
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getCardBrandIcon = (brand: string) => {
    const brandColors: Record<string, string> = {
      visa: 'text-blue-400',
      mastercard: 'text-orange-400',
      amex: 'text-green-400',
      discover: 'text-purple-400',
    };

    return (
      <div className={`font-bold ${brandColors[brand.toLowerCase()] || 'text-gray-400'}`}>
        {brand.toUpperCase()}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`bg-black/20 border border-cyan-500/20 rounded-lg p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <Loader className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-black/20 border border-cyan-500/20 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-cyan-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-cyan-400" />
            <div>
              <h2 className="text-xl font-mono text-cyan-400">Payment Methods</h2>
              <p className="text-sm text-gray-400 mt-1">Manage your saved payment methods</p>
            </div>
          </div>

          <button
            onClick={() => setShowAddCard(true)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded text-cyan-400 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Card</span>
          </button>
        </div>
      </div>

      {/* Payment Methods List */}
      <div className="p-6">
        {paymentMethods.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg text-gray-400 mb-2">No payment methods</h3>
            <p className="text-sm text-gray-500 mb-4">Add a payment method to get started.</p>
            <button
              onClick={() => setShowAddCard(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded text-cyan-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Payment Method</span>
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <AnimatePresence>
              {paymentMethods.map((method) => (
                <motion.div
                  key={method.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`relative bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border rounded-lg p-4 hover:border-cyan-500/30 transition-colors ${
                    method.isDefault ? 'border-cyan-500/50' : 'border-cyan-500/10'
                  }`}
                >
                  {/* Default Badge */}
                  {method.isDefault && (
                    <div className="absolute top-2 right-2">
                      <div className="flex items-center gap-1 px-2 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded text-xs text-cyan-400">
                        <Star className="w-3 h-3 fill-current" />
                        <span>Default</span>
                      </div>
                    </div>
                  )}

                  {/* Card Info */}
                  {method.card && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        {getCardBrandIcon(method.card.brand)}
                        <CreditCard className="w-8 h-8 text-gray-600" />
                      </div>

                      <div className="font-mono text-xl text-gray-300">
                        •••• •••• •••• {method.card.last4}
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>
                          Expires {method.card.expMonth.toString().padStart(2, '0')}/
                          {method.card.expYear}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-cyan-500/10">
                        {!method.isDefault && (
                          <button
                            onClick={() => handleSetDefault(method.id)}
                            disabled={actionLoading === method.id}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded text-cyan-400 text-sm transition-colors disabled:opacity-50"
                          >
                            {actionLoading === method.id ? (
                              <Loader className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Set Default</span>
                              </>
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(method.id)}
                          disabled={actionLoading === method.id || method.isDefault}
                          className="flex items-center justify-center gap-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-red-400 text-sm transition-colors disabled:opacity-50"
                          title={method.isDefault ? 'Cannot delete default payment method' : 'Remove card'}
                        >
                          {actionLoading === method.id ? (
                            <Loader className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add Card Modal */}
      {showAddCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black border border-cyan-500/30 rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-mono text-cyan-400 mb-4">Add Payment Method</h3>
            <p className="text-gray-400 mb-4">
              This would integrate with Stripe Elements to securely add a new payment method.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddCard(false)}
                className="flex-1 px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 rounded text-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowAddCard(false);
                  // Integrate with Stripe Elements here
                }}
                className="flex-1 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded text-cyan-400 transition-colors"
              >
                Add Card
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;
