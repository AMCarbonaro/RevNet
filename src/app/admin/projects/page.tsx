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
  Clock,
  TrendingUp,
  DollarSign,
  Users,
  Calendar
} from 'lucide-react';
import { Project } from '@/types';

interface ProjectWithStats extends Project {
  creatorName: string;
  creatorEmail: string;
  totalDonations: number;
  totalBackers: number;
  completionPercentage: number;
  daysRemaining: number;
  isOverdue: boolean;
}

export default function AdminProjectsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'active' | 'completed' | 'cancelled'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session?.user?.userType !== 'admin') {
      router.push('/dashboard');
      return;
    }

    fetchProjects();
  }, [session, status, router]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectAction = async (projectId: string, action: string) => {
    try {
      const response = await fetch('/api/admin/projects/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, action }),
      });

      if (!response.ok) throw new Error('Action failed');
      
      fetchProjects();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedProjects.length === 0) return;

    try {
      const response = await fetch('/api/admin/projects/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectIds: selectedProjects, action }),
      });

      if (!response.ok) throw new Error('Bulk action failed');
      
      setSelectedProjects([]);
      fetchProjects();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.creatorName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || project.tags.includes(filterCategory);
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-terminal-green';
      case 'completed': return 'text-terminal-cyan';
      case 'cancelled': return 'text-terminal-red';
      case 'draft': return 'text-terminal-yellow';
      default: return 'text-terminal-cyan';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-terminal-green" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-terminal-cyan" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-terminal-red" />;
      case 'draft': return <Clock className="w-4 h-4 text-terminal-yellow" />;
      default: return <Clock className="w-4 h-4 text-terminal-cyan" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-matrix-darker flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-terminal-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-terminal-green">Loading projects...</p>
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
            Project Management
          </h1>
          <p className="text-terminal-cyan">
            Manage and moderate all platform projects
          </p>
        </div>

        {/* Search and Filters */}
        <div className="card-holographic p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-terminal-cyan" />
                <input
                  type="text"
                  placeholder="Search projects..."
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
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 bg-black border border-terminal-green rounded-lg text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
              >
                <option value="all">All Categories</option>
                <option value="Political Campaign">Political Campaign</option>
                <option value="Community Organization">Community Organization</option>
                <option value="Grassroots Movement">Grassroots Movement</option>
                <option value="Environmental Protection">Environmental Protection</option>
                <option value="Social Justice">Social Justice</option>
              </select>
              
              {selectedProjects.length > 0 && (
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

        {/* Projects Table */}
        <div className="card-holographic overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/20">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProjects.length === filteredProjects.length && filteredProjects.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProjects(filteredProjects.map(p => p._id?.toString() || ''));
                        } else {
                          setSelectedProjects([]);
                        }
                      }}
                      className="w-4 h-4 text-terminal-green bg-black border-terminal-green rounded focus:ring-terminal-green"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-terminal-green font-semibold">Project</th>
                  <th className="px-6 py-3 text-left text-terminal-green font-semibold">Creator</th>
                  <th className="px-6 py-3 text-left text-terminal-green font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-terminal-green font-semibold">Funding</th>
                  <th className="px-6 py-3 text-left text-terminal-green font-semibold">Progress</th>
                  <th className="px-6 py-3 text-left text-terminal-green font-semibold">Created</th>
                  <th className="px-6 py-3 text-left text-terminal-green font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-terminal-green/20">
                {filteredProjects.map((project) => (
                  <tr key={project._id?.toString()} className="hover:bg-black/10">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProjects.includes(project._id?.toString() || '')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProjects([...selectedProjects, project._id?.toString() || '']);
                          } else {
                            setSelectedProjects(selectedProjects.filter(id => id !== project._id?.toString()));
                          }
                        }}
                        className="w-4 h-4 text-terminal-green bg-black border-terminal-green rounded focus:ring-terminal-green"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-terminal-green mb-1">{project.title}</h3>
                        <p className="text-terminal-cyan text-sm line-clamp-2">{project.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.tags.slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className="text-xs px-2 py-1 bg-terminal-green/10 text-terminal-green rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-terminal-green">{project.creatorName}</div>
                        <div className="text-terminal-cyan text-sm">{project.creatorEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(project.status)}
                        <span className={`font-semibold ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-terminal-cyan">
                        <div className="font-semibold">${project.currentFunding.toLocaleString()}</div>
                        <div className="text-sm">of ${project.fundingGoal.toLocaleString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full bg-black rounded-full h-2 mb-2">
                        <div
                          className="bg-terminal-green h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(project.completionPercentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-terminal-cyan text-sm">
                        {project.completionPercentage.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 text-terminal-cyan text-sm">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleProjectAction(project._id?.toString() || '', 'view')}
                          className="p-2 text-terminal-cyan hover:bg-terminal-cyan/20 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleProjectAction(project._id?.toString() || '', 'edit')}
                          className="p-2 text-terminal-green hover:bg-terminal-green/20 rounded transition-colors"
                          title="Edit Project"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {project.status === 'draft' && (
                          <>
                            <button
                              onClick={() => handleProjectAction(project._id?.toString() || '', 'approve')}
                              className="p-2 text-terminal-green hover:bg-terminal-green/20 rounded transition-colors"
                              title="Approve Project"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleProjectAction(project._id?.toString() || '', 'reject')}
                              className="p-2 text-terminal-red hover:bg-terminal-red/20 rounded transition-colors"
                              title="Reject Project"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleProjectAction(project._id?.toString() || '', 'delete')}
                          className="p-2 text-terminal-red hover:bg-terminal-red/20 rounded transition-colors"
                          title="Delete Project"
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
            Showing {filteredProjects.length} of {projects.length} projects
          </div>
          
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-terminal-cyan text-terminal-cyan rounded-lg hover:bg-terminal-cyan hover:text-black transition-colors">
              Previous
            </button>
            <button className="px-4 py-2 border border-terminal-cyan text-terminal-cyan rounded-lg hover:bg-terminal-cyan hover:text-black transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}