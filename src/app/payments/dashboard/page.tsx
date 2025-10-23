'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  DollarSign, CreditCard, FileText, TrendingUp, 
  Users, Calendar, ArrowUpRight, Loader 
} from 'lucide-react';
import SubscriptionManager from '@/components/payments/SubscriptionManager';
import PaymentMethods from '@/components/payments/PaymentMethods';
import InvoiceList from '@/components/payments/InvoiceList';

interface PaymentStats {
  totalSpent: number;
  activeSubscriptions: number;
  unpaidInvoices: number;
  totalTransactions: number;
}

export default function PaymentsDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'subscriptions' | 'methods' | 'invoices'>('overview');

  useEffect(() => {
    if (session?.user?.id) {
      fetchPaymentStats();
    }
  }, [session]);

  const fetchPaymentStats = async () => {
    try {
      const response = await fetch('/api/stripe/stats');
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching payment stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const customerId = (session.user as any).stripeCustomerId;

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-mono text-cyan-400 mb-2">Payment Dashboard</h1>
          <p className="text-gray-400">Manage your subscriptions, payment methods, and invoices</p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-black/20 border border-cyan-500/20 rounded-lg p-6 animate-pulse">
                <div className="h-12 bg-cyan-500/10 rounded" />
              </div>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-green-500/10 to-cyan-500/10 border border-green-500/20 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8 text-green-400" />
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-3xl font-mono text-green-400 mb-1">
                ${stats.totalSpent.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total Spent</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <Calendar className="w-8 h-8 text-blue-400" />
                <ArrowUpRight className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-mono text-blue-400 mb-1">
                {stats.activeSubscriptions}
              </div>
              <div className="text-sm text-gray-400">Active Subscriptions</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <FileText className="w-8 h-8 text-yellow-400" />
                <ArrowUpRight className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="text-3xl font-mono text-yellow-400 mb-1">
                {stats.unpaidInvoices}
              </div>
              <div className="text-sm text-gray-400">Unpaid Invoices</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-purple-400" />
                <ArrowUpRight className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-3xl font-mono text-purple-400 mb-1">
                {stats.totalTransactions}
              </div>
              <div className="text-sm text-gray-400">Total Transactions</div>
            </motion.div>
          </div>
        ) : null}

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-cyan-500/20">
            {[
              { id: 'overview', label: 'Overview', icon: DollarSign },
              { id: 'subscriptions', label: 'Subscriptions', icon: Calendar },
              { id: 'methods', label: 'Payment Methods', icon: CreditCard },
              { id: 'invoices', label: 'Invoices', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 font-mono transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-cyan-400'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-8 text-center">
                <h2 className="text-2xl font-mono text-cyan-400 mb-3">Welcome to Payment Dashboard</h2>
                <p className="text-gray-400">
                  Manage all your payment-related activities from one central location.
                  View subscriptions, payment methods, and invoices.
                </p>
              </div>

              {customerId && (
                <>
                  <SubscriptionManager userId={session.user.id} />
                  <InvoiceList customerId={customerId} />
                </>
              )}
            </div>
          )}

          {activeTab === 'subscriptions' && customerId && (
            <SubscriptionManager userId={session.user.id} />
          )}

          {activeTab === 'methods' && customerId && (
            <PaymentMethods customerId={customerId} />
          )}

          {activeTab === 'invoices' && customerId && (
            <InvoiceList customerId={customerId} />
          )}
        </motion.div>
      </div>
    </div>
  );
}
