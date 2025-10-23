'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2,
  CheckCircle,
  XCircle,
  Shield,
  User,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  Activity
} from 'lucide-react';
import { User as UserType } from '@/types';

interface UserWithStats extends UserType {
  projectCount: number;
  donationCount: number;
  totalDonated: number;
  lastLogin: Date;
  isOnline: boolean;
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'user' | 'moderator' | 'admin'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'banned' | 'pending'>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
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

    fetchUsers();
  }, [session, status, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      const response = await fetch('/api/admin/users/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });

      if (!response.ok) throw new Error('Action failed');
      
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return;

    try {
      const response = await fetch('/api/admin/users/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: selectedUsers, action }),
      });

      if (!response.ok) throw new Error('Bulk action failed');
      
      setSelectedUsers([]);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.userType === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && !user.isBanned) ||
                         (filterStatus === 'banned' && user.isBanned) ||
                         (filterStatus === 'pending' && !user.emailVerified);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-terminal-red';
      case 'moderator': return 'text-terminal-purple';
      case 'user': return 'text-terminal-green';
      default: return 'text-terminal-cyan';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4 text-terminal-red" />;
      case 'moderator': return <UserCheck className="w-4 h-4 text-terminal-purple" />;
      case 'user': return <User className="w-4 h-4 text-terminal-green" />;
      default: return <User className="w-4 h-4 text-terminal-cyan" />;
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Calculate summary stats
  const totalUsers = users.length;
  const activeUsers = users.filter(u => !u.isBanned).length;
  const bannedUsers = users.filter(u => u.isBanned).length;
  const adminUsers = users.filter(u => u.userType === 'admin').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-matrix-darker flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-terminal-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-terminal-green">Loading users...</p>
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
            User Management
          </h1>
          <p className="text-terminal-cyan">
            Manage and moderate all platform users
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card-holographic p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-terminal-cyan text-sm">Total Users</p>
                <p className="text-2xl font-bold text-terminal-green">{totalUsers}</p>
              </div>
              <User className="w-8 h-8 text-terminal-green" />
            </div>
          </div>
          
          <div className="card-holographic p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-terminal-cyan text-sm">Active Users</p>
                <p className="text-2xl font-bold text-terminal-green">{activeUsers}</p>
              </div>
              <UserCheck className="w-8 h-8 text-terminal-green" />
            </div>
          </div>
          
          <div className="card-holographic p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-terminal-cyan text-sm">Banned Users</p>
                <p className="text-2xl font-bold text-terminal-red">{bannedUsers}</p>
              </div>
              <UserX className="w-8 h-8 text-terminal-red" />
            </div>
          </div>
          
          <div className="card-holographic p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-terminal-cyan text-sm">Admin Users</p>
                <p className="text-2xl font-bold text-terminal-red">{adminUsers}</p>
              </div>
              <Shield className="w-8 h-8 text-terminal-red" />
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
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-black border border-terminal-green rounded-lg text-terminal-green placeholder-terminal-cyan focus:outline-none focus:ring-2 focus:ring-terminal-green"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as any)}
                className="px-4 py-2 bg-black border border-terminal-green rounded-lg text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
              >
                <option value="all">All Roles</option>
                <option value="user">Users</option>
                <option value="moderator">Moderators</option>
                <option value="admin">Admins</option>
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 bg-black border border-terminal-green rounded-lg text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="banned">Banned</option>
                <option value="pending">Pending</option>
              </select>
              
              {selectedUsers.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkAction('ban')}
                    className="px-4 py-2 bg-terminal-red text-white rounded-lg hover:bg-terminal-red/80 transition-colors"
                  >
                    Ban Selected
                  </button>
                  <button
                    onClick={() => handleBulkAction('unban')}
                    className="px-4 py-2 bg-terminal-green text-black rounded-lg hover:bg-terminal-green/80 transition-colors"
                  >
                    Unban Selected
                  </button>
                  <button
                    onClick={() => handleBulkAction('promote')}
                    className="px-4 py-2 bg-terminal-purple text-white rounded-lg hover:bg-terminal-purple/80 transition-colors"
                  >
                    Promote Selected
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card-holographic overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/20">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(currentUsers.map(u => u._id?.toString() || ''));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                      className="w-4 h-4 text-terminal-green bg-black border-terminal-green rounded focus:ring-terminal-green"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-terminal-green font-semibold">User</th>
                  <th className="px-6 py-3 text-left text-terminal-green font-semibold">Role</th>
                  <th className="px-6 py-3 text-left text-terminal-green font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-terminal-green font-semibold">Activity</th>
                  <th className="px-6 py-3 text-left text-terminal-green font-semibold">Projects</th>
                  <th className="px-6 py-3 text-left text-terminal-green font-semibold">Donations</th>
                  <th className="px-6 py-3 text-left text-terminal-green font-semibold">Joined</th>
                  <th className="px-6 py-3 text-left text-terminal-green font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-terminal-green/20">
                {currentUsers.map((user) => (
                  <tr key={user._id?.toString()} className="hover:bg-black/10">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id?.toString() || '')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user._id?.toString() || '']);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user._id?.toString()));
                          }
                        }}
                        className="w-4 h-4 text-terminal-green bg-black border-terminal-green rounded focus:ring-terminal-green"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-terminal-green/20 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-terminal-green" />
                        </div>
                        <div>
                          <div className="font-semibold text-terminal-green">{user.name}</div>
                          <div className="text-terminal-cyan text-sm">{user.email}</div>
                          {user.isOnline && (
                            <div className="text-xs text-terminal-green">Online</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.userType)}
                        <span className={`font-semibold ${getRoleColor(user.userType)}`}>
                          {user.userType}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {user.isBanned ? (
                          <>
                            <XCircle className="w-4 h-4 text-terminal-red" />
                            <span className="font-semibold text-terminal-red">Banned</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 text-terminal-green" />
                            <span className="font-semibold text-terminal-green">Active</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-terminal-cyan text-sm">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-terminal-green">
                        {user.projectCount || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-terminal-green">
                        ${(user.totalDonated || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-terminal-cyan text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUserAction(user._id?.toString() || '', 'view')}
                          className="p-2 text-terminal-cyan hover:bg-terminal-cyan/20 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUserAction(user._id?.toString() || '', 'edit')}
                          className="p-2 text-terminal-green hover:bg-terminal-green/20 rounded transition-colors"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {user.userType !== 'admin' && (
                          <>
                            <button
                              onClick={() => handleUserAction(user._id?.toString() || '', user.isBanned ? 'unban' : 'ban')}
                              className={`p-2 ${user.isBanned ? 'text-terminal-green hover:bg-terminal-green/20' : 'text-terminal-red hover:bg-terminal-red/20'} rounded transition-colors`}
                              title={user.isBanned ? 'Unban User' : 'Ban User'}
                            >
                              {user.isBanned ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleUserAction(user._id?.toString() || '', 'promote')}
                              className="p-2 text-terminal-purple hover:bg-terminal-purple/20 rounded transition-colors"
                              title="Promote User"
                            >
                              <Shield className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleUserAction(user._id?.toString() || '', 'delete')}
                          className="p-2 text-terminal-red hover:bg-terminal-red/20 rounded transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
            Showing {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
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