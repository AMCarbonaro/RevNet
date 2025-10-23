'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ChatRoom from '@/components/chat/ChatRoom';

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedRoom, setSelectedRoom] = useState<string>('general');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-terminal-green text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const rooms = [
    { id: 'general', name: 'General Discussion' },
    { id: 'revolution', name: 'Revolution Talk' },
    { id: 'projects', name: 'Project Updates' },
    { id: 'letters', name: 'Anthony Letters Discussion' }
  ];

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-terminal-green neon-glow mb-4">
            Revolutionary Chat
          </h1>
          <p className="text-terminal-cyan text-lg">
            Connect with fellow revolutionaries
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Room List */}
          <div className="lg:col-span-1">
            <div className="card-holographic p-6">
              <h2 className="text-xl font-bold text-terminal-green mb-4">
                Chat Rooms
              </h2>
              
              <div className="space-y-2">
                {rooms.map(room => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room.id)}
                    className={`w-full text-left p-3 rounded transition-colors ${
                      selectedRoom === room.id
                        ? 'bg-terminal-green text-black'
                        : 'text-terminal-cyan hover:bg-terminal-green/20'
                    }`}
                  >
                    {room.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Room */}
          <div className="lg:col-span-3">
            <ChatRoom
              roomId={selectedRoom}
              roomName={rooms.find(room => room.id === selectedRoom)?.name || 'Chat Room'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
