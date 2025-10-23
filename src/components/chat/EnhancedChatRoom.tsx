'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useSocket } from '@/hooks/useSocket';
import { Search, Smile, Paperclip, Edit2, Trash2, MoreVertical } from 'lucide-react';

interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  reactions: MessageReaction[];
  edited: boolean;
  editedAt?: string;
}

interface MessageReaction {
  emoji: string;
  userId: string;
  userName: string;
  timestamp: string;
}

interface TypingUser {
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: string;
}

interface EnhancedChatRoomProps {
  roomId: string;
  roomName: string;
}

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡', '🔥', '💯'];

export default function EnhancedChatRoom({ roomId, roomName }: EnhancedChatRoomProps) {
  const { data: session } = useSession();
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [messageMenuOpen, setMessageMenuOpen] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!socket || !session?.user) return;

    // Join room
    socket.emit('join-room', roomId);

    // Listen for message history
    socket.on('message-history', (data) => {
      if (data.roomId === roomId) {
        setMessages(data.messages || []);
      }
    });

    // Listen for new messages
    socket.on('new-message', (message: Message) => {
      if (message.roomId === roomId) {
        setMessages(prev => [...prev, message]);
      }
    });

    // Listen for edited messages
    socket.on('message-edited', (data) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId 
          ? { ...msg, content: data.content, edited: true, editedAt: data.editedAt }
          : msg
      ));
    });

    // Listen for reaction updates
    socket.on('message-reaction-update', (data) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId 
          ? { ...msg, reactions: data.reactions }
          : msg
      ));
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

    // Listen for rate limiting
    socket.on('rate-limit-exceeded', (data) => {
      alert(data.message);
    });

    // Clean up on unmount
    return () => {
      socket.emit('leave-room', roomId);
      socket.off('message-history');
      socket.off('new-message');
      socket.off('message-edited');
      socket.off('message-reaction-update');
      socket.off('user-typing');
      socket.off('rate-limit-exceeded');
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

  const handleReaction = (messageId: string, emoji: string) => {
    if (!socket || !session?.user) return;
    
    socket.emit('message-reaction', {
      messageId,
      emoji,
      userId: session.user.id,
      userName: session.user.name
    });
    
    setShowEmojiPicker(false);
  };

  const handleEditMessage = (message: Message) => {
    setEditingMessage(message.id);
    setEditContent(message.content);
    setMessageMenuOpen(null);
  };

  const handleSaveEdit = () => {
    if (!socket || !session?.user || !editingMessage) return;
    
    socket.emit('edit-message', {
      messageId: editingMessage,
      newContent: editContent,
      userId: session.user.id
    });
    
    setEditingMessage(null);
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditContent('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // TODO: Implement file upload to Cloudinary
    console.log('File upload:', file);
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

  const filteredMessages = messages.filter(message =>
    message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.senderName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-terminal-cyan" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full pl-10 pr-3 py-2 bg-black border border-terminal-green rounded text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {filteredMessages.map((message, index) => {
          const isOwnMessage = message.senderId === session?.user?.id;
          const showDate = index === 0 || 
            formatDate(message.timestamp) !== formatDate(filteredMessages[index - 1].timestamp);

          return (
            <div key={message.id}>
              {showDate && (
                <div className="text-center text-xs text-terminal-cyan mb-2">
                  {formatDate(message.timestamp)}
                </div>
              )}
              
              <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative group ${
                  isOwnMessage 
                    ? 'bg-terminal-green text-black' 
                    : 'bg-black/20 text-terminal-cyan border border-terminal-green'
                }`}>
                  {!isOwnMessage && (
                    <div className="text-xs font-semibold text-terminal-green mb-1">
                      {message.senderName}
                    </div>
                  )}
                  
                  {editingMessage === message.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-2 py-1 bg-black border border-terminal-green rounded text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
                        rows={2}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveEdit}
                          className="px-2 py-1 bg-terminal-green text-black rounded text-xs hover:bg-terminal-green/80"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-2 py-1 border border-terminal-cyan text-terminal-cyan rounded text-xs hover:bg-terminal-cyan hover:text-black"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-sm">{message.content}</div>
                      <div className={`flex items-center justify-between mt-1 ${
                        isOwnMessage ? 'text-black/70' : 'text-terminal-cyan/70'
                      }`}>
                        <div className="text-xs">
                          {formatTime(message.timestamp)}
                          {message.edited && <span className="ml-1">(edited)</span>}
                        </div>
                        
                        {isOwnMessage && (
                          <button
                            onClick={() => setMessageMenuOpen(messageMenuOpen === message.id ? null : message.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      
                      {/* Message Menu */}
                      {messageMenuOpen === message.id && (
                        <div className="absolute top-0 right-0 mt-6 bg-black border border-terminal-green rounded shadow-lg z-10">
                          <button
                            onClick={() => handleEditMessage(message)}
                            className="block w-full px-3 py-2 text-left text-terminal-cyan hover:bg-terminal-green hover:text-black text-xs"
                          >
                            <Edit2 className="w-3 h-3 inline mr-1" />
                            Edit
                          </button>
                        </div>
                      )}
                      
                      {/* Reactions */}
                      {message.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {message.reactions.map((reaction, reactionIndex) => (
                            <span
                              key={reactionIndex}
                              className="px-2 py-1 bg-terminal-green/20 text-terminal-green rounded text-xs"
                            >
                              {reaction.emoji} {reaction.userName}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
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
        <div className="flex-1 relative">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="w-full px-3 py-2 bg-black border border-terminal-green rounded text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
            disabled={!isConnected}
          />
          
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-full mb-2 left-0 bg-black border border-terminal-green rounded p-2 z-10">
              <div className="grid grid-cols-4 gap-1">
                {EMOJI_REACTIONS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setNewMessage(prev => prev + emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="p-1 hover:bg-terminal-green hover:text-black rounded"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="px-2 py-2 border border-terminal-cyan text-terminal-cyan rounded hover:bg-terminal-cyan hover:text-black transition-colors"
        >
          <Smile className="w-4 h-4" />
        </button>
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-2 py-2 border border-terminal-purple text-terminal-purple rounded hover:bg-terminal-purple hover:text-white transition-colors"
        >
          <Paperclip className="w-4 h-4" />
        </button>
        
        <button
          type="submit"
          disabled={!newMessage.trim() || !isConnected}
          className="px-4 py-2 bg-terminal-green text-black rounded hover:bg-terminal-green/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </form>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileUpload}
        className="hidden"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
      />
    </div>
  );
}
