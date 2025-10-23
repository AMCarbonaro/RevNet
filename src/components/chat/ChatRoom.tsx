'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useSocket } from '@/hooks/useSocket';

interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

interface TypingUser {
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: string;
}

interface ChatRoomProps {
  roomId: string;
  roomName: string;
}

export default function ChatRoom({ roomId, roomName }: ChatRoomProps) {
  const { data: session } = useSession();
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!socket || !session?.user) return;

    // Join room
    socket.emit('join-room', roomId);

    // Listen for new messages
    socket.on('new-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for typing indicators
    socket.on('user-typing', (typingData: TypingUser) => {
      setTypingUsers(prev => {
        const filtered = prev.filter(user => user.userId !== typingData.userId);
        if (typingData.isTyping) {
          return [...filtered, typingData];
        }
        return filtered;
      });
    });

    // Clean up on unmount
    return () => {
      socket.emit('leave-room', roomId);
      socket.off('new-message');
      socket.off('user-typing');
    };
  }, [socket, roomId, session]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !socket || !session?.user) return;

    socket.emit('send-message', {
      roomId,
      content: newMessage.trim(),
      senderId: session.user.id,
      senderName: session.user.name
    });

    setNewMessage('');
    setIsTyping(false);
    
    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (!socket || !session?.user) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing-start', {
        roomId,
        userId: session.user.id,
        userName: session.user.name
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing-stop', {
        roomId,
        userId: session.user.id,
        userName: session.user.name
      });
    }, 1000);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="card-holographic p-6 h-96 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-terminal-green">
        <h3 className="text-lg font-bold text-terminal-green">
          {roomName}
        </h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-terminal-green' : 'bg-terminal-red'
          }`}></div>
          <span className="text-xs text-terminal-cyan">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message, index) => {
          const isOwnMessage = message.senderId === session?.user?.id;
          const showDate = index === 0 || 
            formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);

          return (
            <div key={message.id}>
              {showDate && (
                <div className="text-center text-xs text-terminal-cyan mb-2">
                  {formatDate(message.timestamp)}
                </div>
              )}
              
              <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwnMessage 
                    ? 'bg-terminal-green text-black' 
                    : 'bg-black/20 text-terminal-cyan border border-terminal-green'
                }`}>
                  {!isOwnMessage && (
                    <div className="text-xs font-semibold text-terminal-green mb-1">
                      {message.senderName}
                    </div>
                  )}
                  <div className="text-sm">{message.content}</div>
                  <div className={`text-xs mt-1 ${
                    isOwnMessage ? 'text-black/70' : 'text-terminal-cyan/70'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Typing indicators */}
        {typingUsers.length > 0 && (
          <div className="flex items-center space-x-2 text-terminal-cyan text-sm">
            <span>
              {typingUsers.map(user => user.userName).join(', ')} 
              {typingUsers.length === 1 ? ' is' : ' are'} typing...
            </span>
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-terminal-cyan rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-terminal-cyan rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1 h-1 bg-terminal-cyan rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="flex space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={handleTyping}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 bg-black border border-terminal-green rounded text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
          disabled={!isConnected}
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || !isConnected}
          className="px-4 py-2 bg-terminal-green text-black rounded hover:bg-terminal-green/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
