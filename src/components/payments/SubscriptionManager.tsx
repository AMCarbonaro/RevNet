'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, Check, X, Calendar, DollarSign, 
  AlertCircle, Loader, Pause, Play, Trash2 
} from 'lucide-react';

interface Subscription {
  id: string;
  status: string;
  priceId: string;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd?: boolean;
  plan?: {
    name: string;
    amount: number;
    interval: string;
  };
}

interface SubscriptionManagerProps {
  userId: string;
  className?: string;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({
  userId,
  className = ''
}) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, [userId]);

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch(`/api/stripe/subscriptions?userId=${userId}`);
      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return;

    setActionLoading(subscriptionId);
    try {
      const response = await fetch('/api/stripe/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId })
      });

      if (response.ok) {
        await fetchSubscriptions();
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResumeSubscription = async (subscriptionId: string) => {
    setActionLoading(subscriptionId);
    try {
      const response = await fetch('/api/stripe/subscriptions/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId })
      });

      if (response.ok) {
        await fetchSubscriptions();
      }
    } catch (error) {
      console.error('Error resuming subscription:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePauseSubscription = async (subscriptionId: string) => {
    setActionLoading(subscriptionId);
    try {
      const response = await fetch('/api/stripe/subscriptions/pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId })
      });

      if (response.ok) {
        await fetchSubscriptions();
      }
    } catch (error) {
      console.error('Error pausing subscription:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
      active: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: <Check className="w-3 h-3" /> },
      past_due: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: <AlertCircle className="w-3 h-3" /> },
      canceled: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: <X className="w-3 h-3" /> },
      incomplete: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: <AlertCircle className="w-3 h-3" /> },
      paused: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: <Pause className="w-3 h-3" /> },
    };

    const config = statusConfig[status] || statusConfig.incomplete;

    return (
      <div className={`flex items-center gap-1 px-2 py-1 rounded border text-xs ${config.color}`}>
        {config.icon}
        <span className="capitalize">{status}</span>
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
        <div className="flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-cyan-400" />
          <div>
            <h2 className="text-xl font-mono text-cyan-400">Subscriptions</h2>
            <p className="text-sm text-gray-400 mt-1">Manage your active subscriptions</p>
          </div>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="p-6">
        {subscriptions.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg text-gray-400 mb-2">No active subscriptions</h3>
            <p className="text-sm text-gray-500">You don't have any subscriptions yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((subscription) => (
              <motion.div
                key={subscription.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/40 border border-cyan-500/10 rounded-lg p-4 hover:border-cyan-500/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-mono text-cyan-400">
                        {subscription.plan?.name || 'Subscription'}
                      </h3>
                      {getStatusBadge(subscription.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Amount</p>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-400" />
                          <span className="text-gray-300">
                            ${subscription.plan?.amount || 0}/{subscription.plan?.interval || 'month'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">Next billing date</p>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          <span className="text-gray-300">
                            {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {subscription.cancelAtPeriodEnd && (
                      <div className="mt-3 flex items-center gap-2 text-yellow-400 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>Cancels at period end</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
                      <>
                        <button
                          onClick={() => handlePauseSubscription(subscription.id)}
                          disabled={actionLoading === subscription.id}
                          className="p-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded text-blue-400 transition-colors disabled:opacity-50"
                          title="Pause subscription"
                        >
                          {actionLoading === subscription.id ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Pause className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => handleCancelSubscription(subscription.id)}
                          disabled={actionLoading === subscription.id}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-red-400 transition-colors disabled:opacity-50"
                          title="Cancel subscription"
                        >
                          {actionLoading === subscription.id ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </>
                    )}

                    {subscription.cancelAtPeriodEnd && (
                      <button
                        onClick={() => handleResumeSubscription(subscription.id)}
                        disabled={actionLoading === subscription.id}
                        className="p-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded text-green-400 transition-colors disabled:opacity-50"
                        title="Resume subscription"
                      >
                        {actionLoading === subscription.id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManager;
