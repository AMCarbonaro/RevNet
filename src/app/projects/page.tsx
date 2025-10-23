'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Project {
  _id: string;
  id: string;
  title: string;
  description: string;
  longDescription: string;
  category: string;
  tags: string[];
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  fundingGoal: number;
  currentFunding: number;
  backers: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled' | 'paused';
  timeline: {
    startDate: Date;
    endDate: Date;
    milestones: any[];
  };
  team: any[];
  updates: any[];
  createdAt: Date;
  updatedAt: Date;
}

export default function ProjectsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchProjects();
  }, [session, status, router]);

  const fetchProjects = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedStatus) params.append('status', selectedStatus);
      
      const response = await fetch(`/api/projects?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setProjects(data.data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [searchTerm, selectedCategory, selectedStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-terminal-green';
      case 'draft': return 'text-terminal-cyan';
      case 'completed': return 'text-terminal-purple';
      case 'cancelled': return 'text-terminal-red';
      case 'paused': return 'text-terminal-orange';
      default: return 'text-terminal-green';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '🚀';
      case 'draft': return '📝';
      case 'completed': return '✅';
      case 'cancelled': return '❌';
      case 'paused': return '⏸️';
      default: return '🚀';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-terminal-green text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-terminal-green neon-glow mb-4">
            Revolutionary Projects
          </h1>
          <p className="text-terminal-cyan text-lg mb-6">
            Discover and support grassroots political activism
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/projects/create"
              className="btn-neon"
            >
              Create New Project
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="card-holographic p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-terminal-cyan mb-2">
                Search Projects
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-black border border-terminal-green rounded text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
                placeholder="Search by title, description, or tags"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-terminal-cyan mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-black border border-terminal-green rounded text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
              >
                <option value="">All Categories</option>
                <option value="Political Campaign">Political Campaign</option>
                <option value="Community Organization">Community Organization</option>
                <option value="Grassroots Movement">Grassroots Movement</option>
                <option value="Educational Initiative">Educational Initiative</option>
                <option value="Media Project">Media Project</option>
                <option value="Legal Action">Legal Action</option>
                <option value="Research Project">Research Project</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-terminal-cyan mb-2">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 bg-black border border-terminal-green rounded text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-terminal-cyan mb-2">
              No projects found
            </h3>
            <p className="text-terminal-green mb-6">
              {searchTerm || selectedCategory || selectedStatus
                ? 'Try adjusting your filters or search terms.'
                : 'Be the first to create a revolutionary project!'
              }
            </p>
            <Link
              href="/projects/create"
              className="btn-neon"
            >
              Create Project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="card-holographic p-6 hover:scale-105 transition-transform cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-sm font-semibold ${getStatusColor(project.status)}`}>
                    {getStatusIcon(project.status)} {project.status.toUpperCase()}
                  </span>
                  <span className="text-xs text-terminal-cyan">
                    {formatDate(project.createdAt)}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-terminal-green mb-2 line-clamp-2">
                  {project.title}
                </h3>
                
                <p className="text-terminal-cyan text-sm mb-4 line-clamp-3">
                  {project.description}
                </p>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-terminal-cyan">Funding Progress</span>
                      <span className="text-terminal-green">
                        {formatCurrency(project.currentFunding)} / {formatCurrency(project.fundingGoal)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-terminal-green h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(project.currentFunding, project.fundingGoal)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-terminal-cyan">
                      {project.backers} backers
                    </span>
                    <span className="text-terminal-purple">
                      {project.category}
                    </span>
                  </div>
                  
                  {project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-terminal-green/20 text-terminal-green rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 3 && (
                        <span className="px-2 py-1 bg-terminal-green/20 text-terminal-green rounded text-xs">
                          +{project.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
