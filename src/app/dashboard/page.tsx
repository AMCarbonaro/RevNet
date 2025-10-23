'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ActivityFeedWidget from '@/components/widgets/ActivityFeedWidget';
import OnlineUsersWidget from '@/components/widgets/OnlineUsersWidget';
import ProjectListWidget from '@/components/widgets/ProjectListWidget';

interface User {
  id: string;
  name: string;
  email: string;
  userType: 'creator' | 'supporter';
  letterProgress: {
    completedLetters: number[];
    currentBook: number;
    currentLetter: number;
    totalProgress: number;
    lastCompletedAt?: Date;
    assignmentsCompleted: number[];
  };
  stats: {
    totalDonations: number;
    totalProjects: number;
    totalLettersRead: number;
    totalAssignmentsCompleted: number;
    revolutionaryBadge: boolean;
    lastActiveAt: Date;
  };
  achievements: any[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchUser();
  }, [session, status, router]);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/user/profile');
      const data = await response.json();
      if (data.success) {
        setUser(data.data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-terminal-green text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-terminal-red text-xl">Error loading user data</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-terminal-green neon-glow mb-4">
            Welcome, {user.name}
          </h1>
          <p className="text-terminal-cyan text-lg">
            Revolution Network Dashboard
          </p>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card-holographic p-6 text-center">
            <div className="text-3xl font-bold text-terminal-green mb-2">
              {user.letterProgress.totalProgress}
            </div>
            <div className="text-terminal-cyan">Letters Completed</div>
          </div>
          
          <div className="card-holographic p-6 text-center">
            <div className="text-3xl font-bold text-terminal-cyan mb-2">
              {user.stats.totalProjects}
            </div>
            <div className="text-terminal-cyan">Projects Created</div>
          </div>
          
          <div className="card-holographic p-6 text-center">
            <div className="text-3xl font-bold text-terminal-purple mb-2">
              {user.stats.totalDonations}
            </div>
            <div className="text-terminal-cyan">Donations Made</div>
          </div>
          
          <div className="card-holographic p-6 text-center">
            <div className="text-3xl font-bold text-terminal-pink mb-2">
              {user.stats.revolutionaryBadge ? '🏆' : '⏳'}
            </div>
            <div className="text-terminal-cyan">Revolutionary Badge</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            href="/letters"
            className="card-holographic p-6 hover:scale-105 transition-transform cursor-pointer"
          >
            <div className="text-2xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-terminal-green mb-2">
              The Anthony Letters
            </h3>
            <p className="text-terminal-cyan text-sm">
              Continue your revolutionary education
            </p>
          </Link>
          
          <Link
            href="/projects"
            className="card-holographic p-6 hover:scale-105 transition-transform cursor-pointer"
          >
            <div className="text-2xl mb-4">🚀</div>
            <h3 className="text-xl font-bold text-terminal-green mb-2">
              Projects
            </h3>
            <p className="text-terminal-cyan text-sm">
              Create or support revolutionary projects
            </p>
          </Link>
          
          <Link
            href="/chat"
            className="card-holographic p-6 hover:scale-105 transition-transform cursor-pointer"
          >
            <div className="text-2xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-terminal-green mb-2">
              Chat
            </h3>
            <p className="text-terminal-cyan text-sm">
              Connect with other revolutionaries
            </p>
          </Link>
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <ActivityFeedWidget />
          </div>
          <div>
            <OnlineUsersWidget />
          </div>
        </div>

        {/* Featured Projects */}
        <div className="mb-8">
          <ProjectListWidget />
        </div>

        {/* Recent Activity */}
        <div className="card-holographic p-6">
          <h2 className="text-2xl font-bold text-terminal-green mb-4">
            Your Progress
          </h2>
          
          {user.letterProgress.totalProgress === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🌟</div>
              <h3 className="text-xl font-bold text-terminal-cyan mb-2">
                Welcome to the Revolution!
              </h3>
              <p className="text-terminal-green mb-4">
                Start your journey by reading The Anthony Letters
              </p>
              <Link
                href="/letters"
                className="btn-neon"
              >
                Begin Reading
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-black/20 rounded">
                <div>
                  <div className="text-terminal-green font-semibold">
                    Letters Completed
                  </div>
                  <div className="text-terminal-cyan text-sm">
                    {user.letterProgress.totalProgress} out of 30 letters
                  </div>
                </div>
                <div className="text-terminal-green text-2xl">
                  {user.letterProgress.totalProgress}
                </div>
              </div>
              
              {user.letterProgress.lastCompletedAt && (
                <div className="flex items-center justify-between p-4 bg-black/20 rounded">
                  <div>
                    <div className="text-terminal-green font-semibold">
                      Last Letter Completed
                    </div>
                    <div className="text-terminal-cyan text-sm">
                      {new Date(user.letterProgress.lastCompletedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-terminal-green text-2xl">✓</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
