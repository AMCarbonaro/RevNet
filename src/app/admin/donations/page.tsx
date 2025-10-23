'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  User,
  CreditCard,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Donation } from '@/types';

interface DonationWithDetails extends Donation {
  donorName: string;
  donorEmail: string;
  projectTitle: string;
  projectCreatorName: string;
}

export default function AdminDonationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [donations, setDonations] = useState<DonationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'failed' | 'refunded'>('all');
  const [filterDateRange, setFilterDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [selectedDonations, setSelectedDonations] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session?.user?.userType !== 'admin') {
      router.push('/dashboard');
      return;
    }

    fetchDonations();
  }, [session, status, router, filterDateRange]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterDateRange !== 'all') {
        params.append('dateRange', filterDateRange);
      }
      
      const response = await fetch(`/api/admin/donations?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch donations');
      const data = await response.json();
      setDonations(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDonationAction = async (donationId: string, action: string) => {
    try {
      const response = await fetch('/api/admin/donations/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donationId, action }),
      });

      if (!response.ok) throw new Error('Action failed');
      
      fetchDonations();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedDonations.length === 0) return;

    try {
      const response = await fetch('/api/admin/donations/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donationIds: selectedDonations, action }),
      });

      if (!response.ok) throw new Error('Bulk action failed');
      
      setSelectedDonations([]);
      fetchDonations();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = donation.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         donation.donorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         donation.projectTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || donation.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-terminal-green';
      case 'pending': return 'text-terminal-yellow';
      case 'failed': return 'text-terminal-red';
      case 'refunded': return 'text-terminal-cyan';
      default: return 'text-terminal-cyan';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-terminal-green" />;
      case 'pending': return <Clock className="w-4 h-4 text-terminal-yellow" />;
      case 'failed': return <XCircle className="w-4 h-4 text-terminal-red" />;
      case 'refunded': return <TrendingDown className="w-4 h-4 text-terminal-cyan" />;
      default: return <Clock className="w-4 h-4 text-terminal-cyan" />;
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredDonations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDonations = filteredDonations.slice(startIndex, endIndex);

  // Calculate summary stats
  const totalAmount = filteredDonations.reduce((sum, d) => sum + d.amount, 0);
  const completedAmount = filteredDonations
    .filter(d => d.status === 'completed')
    .reduce((sum, d) => sum + d.amount, 0);
  const pendingAmount = filteredDonations
    .filter(d => d.status === 'pending')
    .reduce((sum, d) => sum + d.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-matrix-darker flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-terminal-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-terminal-green">Loading donations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-matrix-darker text-terminal-green p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold neon-glow mb-2">
            Donation Management
          </h1>
          <p className="text-terminal-cyan">
            Monitor and manage all platform donations
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card-holographic p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-terminal-cyan text-sm">Total Donations</p>
                <p className="text-2xl font-bold text-terminal-green">${totalAmount.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-terminal-green" />
            </div>
          </div>
          
          <div className="card-holographic p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-terminal-cyan text-sm">Completed</p>
                <p className="text-2xl font-bold text-terminal-green">${completedAmount.toLocaleString()}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-terminal-green" />
            </div>
          </div>
          
          <div className="card-holographic p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-terminal-cyan text-sm">Pending</p>
                <p className="text-2xl font-bold text-terminal-yellow">${pendingAmount.toLocaleString()}</p>
              </div>
              <Clock className="w-8 h-8 text-terminal-yellow" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card-holographic p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-terminal-cyan" />
                <input
                  type="text"
                  placeholder="Search donations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-black border border-terminal-green rounded-lg text-terminal-green placeholder-terminal-cyan focus:outline-none focus:ring-2 focus:ring-terminal-green"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 bg-black border border-terminal-green rounded-lg text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
              
              <select
                value={filterDateRange}
                onChange={(e) => setFilterDateRange(e.target.value as any)}
                className="px-4 py-2 bg-black border border-terminal-green rounded-lg text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </select>
              
              {selectedDonations.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkAction('refund')}
                    className="px-4 py-2 bg-terminal-red text-white rounded-lg hover:bg-terminal-red/80 transition-colors"
                  >
                    Refund Selected
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Donations Table */}
        <div className="card-holographic overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/20">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedDonations.length === currentDonations.length && currentDonations.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDonations(currentDonations.map(d => d._id?.toString() || ''));
                        } else {
                          setSelectedDonations([]);
                        }
                      }}
                      className="w-4 h-4 text-terminal-green bg-black border-terminal-green rounded focus:ring-terminal-green"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-terminal-green font-semibold">Donation</th>
                  <th className="px-6 py-3 text-left text-terminal-green font-semibold">Donor</th>
                  <th className="px-6 py-3 text-left text-terminal-green font-semibold">Project</th>
                  <th className="px-6 py-3 text-left text-terminal-green font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-terminal-green font-semibold">Amount</th>
                  <th className="px-6 py-3 text-left text-terminal-green font-semibold">Date</th>
                  <th className="px-6 py-3 text-left text-terminal-green font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-terminal-green/20">
                {currentDonations.map((donation) => (
                  <tr key={donation._id?.toString()} className="hover:bg-black/10">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedDonations.includes(donation._id?.toString() || '')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDonations([...selectedDonations, donation._id?.toString() || '']);
                          } else {
                            setSelectedDonations(selectedDonations.filter(id => id !== donation._id?.toString()));
                          }
                        }}
                        className="w-4 h-4 text-terminal-green bg-black border-terminal-green rounded focus:ring-terminal-green"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-terminal-green">#{donation._id?.toString().substring(0, 8)}</div>
                        <div className="text-terminal-cyan text-sm">{donation.paymentMethod}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-terminal-green">{donation.donorName}</div>
                        <div className="text-terminal-cyan text-sm">{donation.donorEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-terminal-green">{donation.projectTitle}</div>
                        <div className="text-terminal-cyan text-sm">by {donation.projectCreatorName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(donation.status)}
                        <span className={`font-semibold ${getStatusColor(donation.status)}`}>
                          {donation.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-terminal-green">
                        ${donation.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-terminal-cyan text-sm">
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDonationAction(donation._id?.toString() || '', 'view')}
                          className="p-2 text-terminal-cyan hover:bg-terminal-cyan/20 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {donation.status === 'completed' && (
                          <button
                            onClick={() => handleDonationAction(donation._id?.toString() || '', 'refund')}
                            className="p-2 text-terminal-red hover:bg-terminal-red/20 rounded transition-colors"
                            title="Refund Donation"
                          >
                            <TrendingDown className="w-4 h-4" />
                          </button>
                        )}
                        {donation.status === 'failed' && (
                          <button
                            onClick={() => handleDonationAction(donation._id?.toString() || '', 'retry')}
                            className="p-2 text-terminal-green hover:bg-terminal-green/20 rounded transition-colors"
                            title="Retry Payment"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-terminal-cyan text-sm">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredDonations.length)} of {filteredDonations.length} donations
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-terminal-cyan text-terminal-cyan rounded-lg hover:bg-terminal-cyan hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-terminal-cyan">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-terminal-cyan text-terminal-cyan rounded-lg hover:bg-terminal-cyan hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}