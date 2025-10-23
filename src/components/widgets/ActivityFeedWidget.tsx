'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';

interface ActivityItem {
  id: string;
  type: 'project_update' | 'donation' | 'milestone' | 'achievement';
  title: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

export default function ActivityFeedWidget() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const { socket } = useSocket();

  useEffect(() => {
    // Listen for real-time updates
    if (socket) {
      socket.on('project-updated', (data) => {
        const newActivity: ActivityItem = {
          id: `activity_${Date.now()}`,
          type: 'project_update',
          title: 'Project Updated',
          description: `${data.update.title}`,
          timestamp: data.timestamp,
          metadata: data
        };
        setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
      });

      socket.on('new-donation', (data) => {
        const newActivity: ActivityItem = {
          id: `activity_${Date.now()}`,
          type: 'donation',
          title: 'New Donation',
          description: `$${data.donation.amount} donated to project`,
          timestamp: data.timestamp,
          metadata: data
        };
        setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
      });

      return () => {
        socket.off('project-updated');
        socket.off('new-donation');
      };
    }
  }, [socket]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project_update': return '🚀';
      case 'donation': return '💰';
      case 'milestone': return '🎯';
      case 'achievement': return '🏆';
      default: return '📢';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'project_update': return 'text-terminal-green';
      case 'donation': return 'text-terminal-purple';
      case 'milestone': return 'text-terminal-cyan';
      case 'achievement': return 'text-terminal-pink';
      default: return 'text-terminal-green';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="card-holographic p-6">
      <h2 className="text-xl font-bold text-terminal-green mb-4">
        Activity Feed
      </h2>
      
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📢</div>
            <p className="text-terminal-cyan text-sm">
              No recent activity
            </p>
          </div>
        ) : (
          activities.map(activity => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 bg-black/20 rounded border border-terminal-green">
              <div className="text-2xl">
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold ${getActivityColor(activity.type)}`}>
                    {activity.title}
                  </h3>
                  <span className="text-xs text-terminal-cyan">
                    {formatTime(activity.timestamp)}
                  </span>
                </div>
                
                <p className="text-terminal-cyan text-sm mt-1">
                  {activity.description}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
