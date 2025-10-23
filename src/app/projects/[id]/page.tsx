'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DonationForm from '@/components/forms/DonationForm';
import FecComplianceAlert from '@/components/ui/FecComplianceAlert';

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

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchProject();
  }, [session, status, router, params.id]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`);
      const data = await response.json();
      if (data.success) {
        setProject(data.data);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (!project) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-terminal-red text-xl">Project not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/projects"
            className="text-terminal-cyan hover:text-terminal-green transition-colors mb-4 inline-block"
          >
            ← Back to Projects
          </Link>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className={`text-sm font-semibold ${getStatusColor(project.status)}`}>
                {getStatusIcon(project.status)} {project.status.toUpperCase()}
              </span>
              <h1 className="text-3xl font-bold text-terminal-green neon-glow mt-2">
                {project.title}
              </h1>
            </div>
          </div>
        </div>

        {/* FEC Compliance Alert */}
        <FecComplianceAlert
          projectId={project.id}
          currentFunding={project.currentFunding}
          fundingGoal={project.fundingGoal}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="card-holographic p-6">
              <h2 className="text-2xl font-bold text-terminal-green mb-4">
                About This Project
              </h2>
              <div className="text-terminal-cyan whitespace-pre-wrap leading-relaxed">
                {project.longDescription}
              </div>
            </div>

            {/* Timeline */}
            <div className="card-holographic p-6">
              <h2 className="text-2xl font-bold text-terminal-green mb-4">
                Timeline
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-terminal-cyan">Start Date</span>
                  <span className="text-terminal-green">{formatDate(project.timeline.startDate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-terminal-cyan">End Date</span>
                  <span className="text-terminal-green">{formatDate(project.timeline.endDate)}</span>
                </div>
              </div>
              
              {project.timeline.milestones.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-terminal-cyan mb-4">Milestones</h3>
                  <div className="space-y-3">
                    {project.timeline.milestones.map((milestone, index) => (
                      <div key={index} className="p-4 bg-black/20 rounded border border-terminal-green">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-terminal-green font-semibold">
                            {milestone.title}
                          </h4>
                          <span className="text-terminal-cyan text-sm">
                            {formatDate(milestone.targetDate)}
                          </span>
                        </div>
                        <p className="text-terminal-cyan text-sm">
                          {milestone.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Team */}
            {project.team.length > 0 && (
              <div className="card-holographic p-6">
                <h2 className="text-2xl font-bold text-terminal-green mb-4">
                  Team
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.team.map((role, index) => (
                    <div key={index} className="p-4 bg-black/20 rounded border border-terminal-green">
                      <h3 className="text-terminal-green font-semibold mb-2">
                        {role.title}
                      </h3>
                      <p className="text-terminal-cyan text-sm mb-2">
                        {role.description}
                      </p>
                      {role.requirements.length > 0 && (
                        <div>
                          <h4 className="text-terminal-cyan text-sm font-semibold mb-1">Requirements:</h4>
                          <ul className="text-terminal-cyan text-sm space-y-1">
                            {role.requirements.map((req, reqIndex) => (
                              <li key={reqIndex}>• {req}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Updates */}
            {project.updates.length > 0 && (
              <div className="card-holographic p-6">
                <h2 className="text-2xl font-bold text-terminal-green mb-4">
                  Updates
                </h2>
                <div className="space-y-4">
                  {project.updates.map((update, index) => (
                    <div key={index} className="p-4 bg-black/20 rounded border border-terminal-green">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-terminal-green font-semibold">
                          {update.title}
                        </h3>
                        <span className="text-terminal-cyan text-sm">
                          {formatDate(update.createdAt)}
                        </span>
                      </div>
                      <p className="text-terminal-cyan text-sm">
                        {update.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Funding */}
            <div className="card-holographic p-6">
              <h2 className="text-xl font-bold text-terminal-green mb-4">
                Funding Progress
              </h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-terminal-cyan">Raised</span>
                    <span className="text-terminal-green">
                      {formatCurrency(project.currentFunding)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-terminal-green h-3 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage(project.currentFunding, project.fundingGoal)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-terminal-green mb-1">
                    {formatCurrency(project.fundingGoal)}
                  </div>
                  <div className="text-terminal-cyan text-sm">Funding Goal</div>
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-bold text-terminal-purple mb-1">
                    {project.backers}
                  </div>
                  <div className="text-terminal-cyan text-sm">Backers</div>
                </div>
              </div>
            </div>

            {/* Project Info */}
            <div className="card-holographic p-6">
              <h2 className="text-xl font-bold text-terminal-green mb-4">
                Project Info
              </h2>
              
              <div className="space-y-3">
                <div>
                  <span className="text-terminal-cyan text-sm">Category</span>
                  <div className="text-terminal-green">{project.category}</div>
                </div>
                
                <div>
                  <span className="text-terminal-cyan text-sm">Created</span>
                  <div className="text-terminal-green">{formatDate(project.createdAt)}</div>
                </div>
                
                <div>
                  <span className="text-terminal-cyan text-sm">Creator</span>
                  <div className="text-terminal-green">{project.creatorName}</div>
                </div>
              </div>
              
              {project.tags.length > 0 && (
                <div className="mt-4">
                  <span className="text-terminal-cyan text-sm">Tags</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-terminal-green/20 text-terminal-green rounded text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Donation Form */}
            <DonationForm
              projectId={project.id}
              projectTitle={project.title}
              onSuccess={() => {
                // Refresh project data after successful donation
                fetchProject();
              }}
            />

            {/* Actions */}
            <div className="card-holographic p-6">
              <h2 className="text-xl font-bold text-terminal-green mb-4">
                Actions
              </h2>
              
              <div className="space-y-3">
                <button className="w-full px-4 py-2 border border-terminal-cyan text-terminal-cyan rounded hover:bg-terminal-cyan hover:text-black transition-colors">
                  Share Project
                </button>
                
                {session?.user?.id === project.creatorId && (
                  <button className="w-full px-4 py-2 border border-terminal-purple text-terminal-purple rounded hover:bg-terminal-purple hover:text-black transition-colors">
                    Edit Project
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
