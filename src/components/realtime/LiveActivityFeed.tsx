'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Users, DollarSign, Zap, Eye, MessageCircle } from 'lucide-react';
import { LiveUpdate, UserPresence } from '@/lib/realtime';

interface LiveActivityFeedProps {
  maxItems?: number;
  showAvatars?: boolean;
  autoScroll?: boolean;
  className?: string;
}

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  user?: {
    name: string;
    image?: string;
  };
  amount?: number;
  timestamp: Date;
  metadata?: any;
}

const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({
  maxItems = 50,
  showAvatars = true,
  autoScroll = true,
  className = ''
}) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Socket.IO connection
    const initializeSocket = () => {
      const socket = new WebSocket(`ws://${window.location.host}/socket.io/?EIO=4&transport=websocket`);
      
      socket.onopen = () => {
        setIsConnected(true);
        console.log('✅ Connected to realtime feed');
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'live:update') {
            const activity = formatActivity(data);
            setActivities(prev => {
              const newActivities = [activity, ...prev].slice(0, maxItems);
              return newActivities;
            });
          } else if (data.type === 'user:presence') {
            setOnlineUsers(prev => {
              const updated = prev.filter(user => user.userId !== data.userId);
              if (data.status === 'online') {
                updated.push(data);
              }
              return updated;
            });
          }
        } catch (error) {
          console.error('Error parsing socket message:', error);
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        console.log('❌ Disconnected from realtime feed');
        
        // Reconnect after 3 seconds
        setTimeout(() => {
          initializeSocket();
        }, 3000);
      };

      socket.onerror = (error) => {
        console.error('Socket error:', error);
        setIsConnected(false);
      };

      return socket;
    };

    const socket = initializeSocket();

    return () => {
      socket.close();
    };
  }, [maxItems]);

  const formatActivity = (liveUpdate: LiveUpdate): ActivityItem => {
    const { type, data, timestamp } = liveUpdate;

    switch (type) {
      case 'donation_received':
        return {
          id: `${type}-${data.projectId}-${timestamp.getTime()}`,
          type: 'donation',
          message: `${data.donorName} donated $${data.amount.toLocaleString()}`,
          amount: data.amount,
          timestamp: new Date(timestamp),
          metadata: { projectId: data.projectId }
        };

      case 'project_created':
        return {
          id: `${type}-${data.projectId}-${timestamp.getTime()}`,
          type: 'project',
          message: `${data.creatorName} launched "${data.title}"`,
          timestamp: new Date(timestamp),
          metadata: { projectId: data.projectId }
        };

      case 'user_joined':
        return {
          id: `${type}-${data.userId}-${timestamp.getTime()}`,
          type: 'user',
          message: `${data.userName} joined the revolution`,
          timestamp: new Date(timestamp),
          metadata: { userId: data.userId }
        };

      default:
        return {
          id: `unknown-${timestamp.getTime()}`,
          type: 'unknown',
          message: 'New activity detected',
          timestamp: new Date(timestamp)
        };
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'donation':
        return <DollarSign className="w-4 h-4 text-green-400" />;
      case 'project':
        return <Zap className="w-4 h-4 text-blue-400" />;
      case 'user':
        return <Users className="w-4 h-4 text-purple-400" />;
      default:
        return <Eye className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return 'now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return timestamp.toLocaleDateString();
  };

  // Auto-scroll to bottom when new activities arrive
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activities, autoScroll]);

  return (
    <div className={`bg-black/20 border border-cyan-500/20 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
          <h3 className="text-cyan-400 font-mono text-sm">Live Activity</h3>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Users className="w-3 h-3" />
          <span>{onlineUsers.length} online</span>
        </div>
      </div>

      {/* Activity Feed */}
      <div 
        ref={scrollRef}
        className="h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent"
      >
        <AnimatePresence>
          {activities.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Waiting for activity...</p>
              </div>
            </div>
          ) : (
            activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-start gap-3 p-2 hover:bg-cyan-500/5 rounded transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {activity.message}
                  </p>
                  
                  {activity.amount && (
                    <div className="mt-1">
                      <span className="text-xs bg-green-400/20 text-green-400 px-2 py-1 rounded">
                        ${activity.amount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimeAgo(activity.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-cyan-500/10">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Real-time updates</span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            {activities.length} activities
          </span>
        </div>
      </div>
    </div>
  );
};

export default LiveActivityFeed;
