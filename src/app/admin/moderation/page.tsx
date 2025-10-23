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
  AlertTriangle,
  Flag,
  MessageSquare,
  User,
  Calendar,
  Clock,
  Shield
} from 'lucide-react';

interface ModerationItem {
  _id: string;
  type: 'project' | 'donation' | 'user' | 'comment' | 'report';
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'critical';
  reportedBy?: string;
  reportedUser?: string;
  createdAt: Date;
  updatedAt: Date;
  reason?: string;
  evidence?: string[];
}

export default function AdminModerationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'project' | 'donation' | 'user' | 'comment' | 'report'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'escalated'>('pending');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
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

    fetchModerationItems();
  }, [session, status, router]);

  const fetchModerationItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/moderation');
      if (!response.ok) throw new Error('Failed to fetch moderation items');
      const data = await response.json();
      setItems(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModerationAction = async (itemId: string, action: string, reason?: string) => {
    try {
      const response = await fetch('/api/admin/moderation/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, action, reason }),
      });

      if (!response.ok) throw new Error('Action failed');
      
      fetchModerationItems();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleBulkAction = async (action: string, reason?: string) => {
    if (selectedItems.length === 0) return;

    try {
      const response = await fetch('/api/admin/moderation/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds: selectedItems, action, reason }),
      });

      if (!response.ok) throw new Error('Bulk action failed');
      
      setSelectedItems([]);
      fetchModerationItems();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.reportedBy?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || item.priority === filterPriority;
    
    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-terminal-red';
      case 'high': return 'text-terminal-orange';
      case 'medium': return 'text-terminal-yellow';
      case 'low': return 'text-terminal-green';
      default: return 'text-terminal-cyan';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-terminal-red" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-terminal-orange" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-terminal-yellow" />;
      case 'low': return <AlertTriangle className="w-4 h-4 text-terminal-green" />;
      default: return <AlertTriangle className="w-4 h-4 text-terminal-cyan" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-terminal-yellow';
      case 'approved': return 'text-terminal-green';
      case 'rejected': return 'text-terminal-red';
      case 'escalated': return 'text-terminal-purple';
      default: return 'text-terminal-cyan';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-terminal-yellow" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-terminal-green" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-terminal-red" />;
      case 'escalated': return <Shield className="w-4 h-4 text-terminal-purple" />;
      default: return <Clock className="w-4 h-4 text-terminal-cyan" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project': return <MessageSquare className="w-4 h-4 text-terminal-blue" />;
      case 'donation': return <MessageSquare className="w-4 h-4 text-terminal-green" />;
      case 'user': return <User className="w-4 h-4 text-terminal-purple" />;
      case 'comment': return <MessageSquare className="w-4 h-4 text-terminal-cyan" />;
      case 'report': return <Flag className="w-4 h-4 text-terminal-red" />;
      default: return <MessageSquare className="w-4 h-4 text-terminal-cyan" />;
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  // Calculate summary stats
  const pendingItems = items.filter(i => i.status === 'pending').length;
  const criticalItems = items.filter(i => i.priority === 'critical').length;
  const highPriorityItems = items.filter(i => i.priority === 'high').length;
  const totalItems = items.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-matrix-darker flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-terminal-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-terminal-green">Loading moderation items...</p>
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
            Content Moderation
          </h1>
          <p className="text-terminal-cyan">
            Review and moderate platform content
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card-holographic p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-terminal-cyan text-sm">Total Items</p>
                <p className="text-2xl font-bold text-terminal-green">{totalItems}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-terminal-green" />
            </div>
          </div>
          
          <div className="card-holographic p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-terminal-cyan text-sm">Pending Review</p>
                <p className="text-2xl font-bold text-terminal-yellow">{pendingItems}</p>
              </div>
              <Clock className="w-8 h-8 text-terminal-yellow" />
            </div>
          </div>
          
          <div className="card-holographic p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-terminal-cyan text-sm">Critical Priority</p>
                <p className="text-2xl font-bold text-terminal-red">{criticalItems}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-terminal-red" />
            </div>
          </div>
          
          <div className="card-holographic p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-terminal-cyan text-sm">High Priority</p>
                <p className="text-2xl font-bold text-terminal-orange">{highPriorityItems}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-terminal-orange" />
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
                  placeholder="Search moderation items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-black border border-terminal-green rounded-lg text-terminal-green placeholder-terminal-cyan focus:outline-none focus:ring-2 focus:ring-terminal-green"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-4 py-2 bg-black border border-terminal-green rounded-lg text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
              >
                <option value="all">All Types</option>
                <option value="project">Projects</option>
                <option value="donation">Donations</option>
                <option value="user">Users</option>
                <option value="comment">Comments</option>
                <option value="report">Reports</option>
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 bg-black border border-terminal-green rounded-lg text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="escalated">Escalated</option>
              </select>
              
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as any)}
                className="px-4 py-2 bg-black border border-terminal-green rounded-lg text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              
              {selectedItems.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkAction('approve')}
                    className="px-4 py-2 bg-terminal-green text-black rounded-lg hover:bg-terminal-green/80 transition-colors"
                  >
                    Approve Selected
                  </button>
                  <button
                    onClick={() => handleBulkAction('reject')}
                    className="px-4 py-2 bg-terminal-red text-white rounded-lg hover:bg-terminal-red/80 transition-colors"
                  >
                    Reject Selected
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Moderation Items Table */}
        <div className="card-holographic overflow-hidden">
          <div className="overflow-x-auto">
            maybe I should add the missing import for Clock icon here?
            <table className="w-full">
              <thead className="bg-black/20">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === currentItems.length && currentItems.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(currentItems.map(i => i._id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                      className="w-4 h-4 text-terminal-green bg-black border-terminal-green rounded focus:ring-terminal-green"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-terminal-green font-semibold">Item</th>
                  <th className="px-6 py-3 text-left text-terminal-green font-semibold">Type</th>
                  <th className="px-6 py-3 text-left text-terminal-green font-semibold">Priority</th>
                  <th className="px-6 py-3 text-left text-terminal-green font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-terminal-green font-semibold">Reported By</th>
                  <th className="px-6 py-3 text-left text-terminal-green font-semibold">Created</th>
                  <th className="px-6 py-3 text-left text-terminal-green font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-terminal-green/20">
                {currentItems.map((item) => (
                  <tr key={item._id} className="hover:bg-black/10">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems([...selectedItems, item._id]);
                          } else {
                            setSelectedItems(selectedItems.filter(id => id !== item._id));
                          }
                        }}
                        className="w-4 h-4 text-terminal-green bg-black border-terminal-green rounded focus:ring-terminal-green"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-terminal-green mb-1">{item.title}</div>
                        <div className="text-terminal-cyan text-sm line-clamp-2">{item.description}</div>
                        {item.reason && (
                          <div className="text-terminal-red text-xs mt-1">Reason: {item.reason}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(item.type)}
                        <span className="font-semibold text-terminal-cyan capitalize">
                          {item.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(item.priority)}
                        <span className={`font-semibold ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        <span className={`font-semibold ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-terminal-cyan text-sm">
                        {item.reportedBy || 'System'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-terminal-cyan text-sm">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleModerationAction(item._id, 'view')}
                          className="p-2 text-terminal-cyan hover:bg-terminal-cyan/20 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {item.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleModerationAction(item._id, 'approve')}
                              className="p-2 text-terminal-green hover:bg-terminal-green/20 rounded transition-colors"
                              title="Approve Item"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleModerationAction(item._id, 'reject')}
                              className="p-2 text-terminal-red hover:bg-terminal-red/20 rounded transition-colors"
                              title="Reject Item"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleModerationAction(item._id, 'escalate')}
                              className="p-2 text-terminal-purple hover:bg-terminal-purple/20 rounded transition-colors"
                              title="Escalate Item"
                            >
                              <Shield className="w-4 h-4" />
                            </button>
                          </>
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
            Showing {startIndex + 1}-{Math.min(endIndex, filteredItems.length)} of {filteredItems.length} items
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