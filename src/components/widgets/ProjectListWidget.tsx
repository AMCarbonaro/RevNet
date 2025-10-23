'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Project {
  _id: string;
  id: string;
  title: string;
  description: string;
  category: string;
  currentFunding: number;
  fundingGoal: number;
  status: string;
  createdAt: Date;
}

export default function ProjectListWidget() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects?status=active&limit=5');
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

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="card-holographic p-6">
        <h2 className="text-xl font-bold text-terminal-green mb-4">
          Featured Projects
        </h2>
        <div className="text-center py-8">
          <div className="text-terminal-green">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-holographic p-6">
      <h2 className="text-xl font-bold text-terminal-green mb-4">
        Featured Projects
      </h2>
      
      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🚀</div>
            <p className="text-terminal-cyan text-sm">
              No active projects
            </p>
          </div>
        ) : (
          projects.map(project => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block p-4 bg-black/20 rounded border border-terminal-green hover:bg-terminal-green/10 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-terminal-green font-semibold line-clamp-1">
                  {project.title}
                </h3>
                <span className="text-xs text-terminal-cyan">
                  {formatDate(project.createdAt)}
                </span>
              </div>
              
              <p className="text-terminal-cyan text-sm mb-3 line-clamp-2">
                {project.description}
              </p>
              
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-terminal-cyan">Progress</span>
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
                
                <div className="flex justify-between text-xs">
                  <span className="text-terminal-purple">
                    {project.category}
                  </span>
                  <span className="text-terminal-cyan">
                    {project.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
      
      <div className="mt-6 text-center">
        <Link
          href="/projects"
          className="btn-neon text-sm px-4 py-2"
        >
          View All Projects
        </Link>
      </div>
    </div>
  );
}
