'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Eye, DollarSign, Calendar, Loader, Check, X, AlertCircle } from 'lucide-react';

interface Invoice {
  id: string;
  number: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  amountDue: number;
  amountPaid: number;
  created: number;
  dueDate: number | null;
  pdfUrl: string | null;
}

interface InvoiceListProps {
  customerId: string;
  className?: string;
}

const InvoiceList: React.FC<InvoiceListProps> = ({
  customerId,
  className = ''
}) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, [customerId]);

  const fetchInvoices = async () => {
    try {
      const response = await fetch(`/api/stripe/invoices?customerId=${customerId}`);
      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      paid: {
        color: 'bg-green-500/20 text-green-400 border-green-500/30',
        icon: <Check className="w-3 h-3" />,
        label: 'Paid'
      },
      open: {
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        icon: <AlertCircle className="w-3 h-3" />,
        label: 'Open'
      },
      draft: {
        color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        icon: <FileText className="w-3 h-3" />,
        label: 'Draft'
      },
      void: {
        color: 'bg-red-500/20 text-red-400 border-red-500/30',
        icon: <X className="w-3 h-3" />,
        label: 'Void'
      },
      uncollectible: {
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        icon: <AlertCircle className="w-3 h-3" />,
        label: 'Uncollectible'
      }
    };

    return configs[status] || configs.draft;
  };

  const handleDownload = (invoice: Invoice) => {
    if (invoice.pdfUrl) {
      window.open(invoice.pdfUrl, '_blank');
    }
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
          <FileText className="w-6 h-6 text-cyan-400" />
          <div>
            <h2 className="text-xl font-mono text-cyan-400">Invoices</h2>
            <p className="text-sm text-gray-400 mt-1">View and download your invoices</p>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="p-6">
        {invoices.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg text-gray-400 mb-2">No invoices</h3>
            <p className="text-sm text-gray-500">You don't have any invoices yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((invoice) => {
              const statusConfig = getStatusConfig(invoice.status);

              return (
                <motion.div
                  key={invoice.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black/40 border border-cyan-500/10 rounded-lg p-4 hover:border-cyan-500/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-mono text-cyan-400">
                          Invoice #{invoice.number || invoice.id.slice(-8)}
                        </h3>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded border text-xs ${statusConfig.color}`}>
                          {statusConfig.icon}
                          <span>{statusConfig.label}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Amount</p>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-green-400" />
                            <span className="text-gray-300">
                              ${(invoice.amountDue / 100).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">Created</p>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            <span className="text-gray-300 text-sm">
                              {new Date(invoice.created * 1000).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {invoice.dueDate && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Due Date</p>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-yellow-400" />
                              <span className="text-gray-300 text-sm">
                                {new Date(invoice.dueDate * 1000).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
                        className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded text-cyan-400 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {invoice.pdfUrl && (
                        <button
                          onClick={() => handleDownload(invoice)}
                          className="p-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded text-green-400 transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setSelectedInvoice(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-black border border-cyan-500/30 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-mono text-cyan-400">
                Invoice #{selectedInvoice.number || selectedInvoice.id.slice(-8)}
              </h3>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-2 hover:bg-gray-500/20 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-cyan-500/5 rounded border border-cyan-500/10">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-xs ${getStatusConfig(selectedInvoice.status).color}`}>
                    {getStatusConfig(selectedInvoice.status).icon}
                    <span>{getStatusConfig(selectedInvoice.status).label}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Amount Due</p>
                  <p className="text-2xl font-mono text-cyan-400">
                    ${(selectedInvoice.amountDue / 100).toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Created</p>
                  <p className="text-gray-300">
                    {new Date(selectedInvoice.created * 1000).toLocaleDateString()}
                  </p>
                </div>

                {selectedInvoice.dueDate && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Due Date</p>
                    <p className="text-gray-300">
                      {new Date(selectedInvoice.dueDate * 1000).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {selectedInvoice.pdfUrl && (
                <button
                  onClick={() => handleDownload(selectedInvoice)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded text-green-400 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span>Download PDF</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;
