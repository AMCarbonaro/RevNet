'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';

interface OnlineUser {
  userId: string;
  userName: string;
  status: 'online' | 'offline';
  timestamp: string;
}

export default function OnlineUsersWidget() {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const { socket } = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on('user-presence', (data: OnlineUser) => {
        setOnlineUsers(prev => {
          const filtered = prev.filter(user => user.userId !== data.userId);
          if (data.status === 'online') {
            return [...filtered, data];
          }
          return filtered;
        });
      });

      return () => {
        socket.off('user-presence');
      };
    }
  }, [socket]);

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
        Online Users
      </h2>
      
      <div className="space-y-3">
        {onlineUsers.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">👥</div>
            <p className="text-terminal-cyan text-sm">
              No users online
            </p>
          </div>
        ) : (
          onlineUsers.map(user => (
            <div key={user.userId} className="flex items-center justify-between p-3 bg-black/20 rounded border border-terminal-green">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-terminal-green rounded-full animate-pulse"></div>
                <span className="text-terminal-cyan font-medium">
                  {user.userName}
                </span>
              </div>
              
              <span className="text-xs text-terminal-cyan">
                {formatTime(user.timestamp)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
