# Real-time Features Documentation

## Overview

Revolution Network implements real-time communication using Socket.IO for chat, user presence, live updates, and collaborative features. The system provides instant messaging, project collaboration, and community engagement.

## 🔌 Socket.IO Architecture

### Server Configuration

```javascript
// server.js - Socket.IO server setup
const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer();
  const io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Socket.IO event handlers
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join project chat room
    socket.on('join-room', (room) => {
      socket.join(room);
      console.log(`User ${socket.id} joined room ${room}`);
      
      // Notify others in the room
      socket.to(room).emit('user-joined', {
        userId: socket.userId,
        username: socket.username,
        timestamp: new Date()
      });
    });

    // Leave project chat room
    socket.on('leave-room', (room) => {
      socket.leave(room);
      console.log(`User ${socket.id} left room ${room}`);
      
      // Notify others in the room
      socket.to(room).emit('user-left', {
        userId: socket.userId,
        username: socket.username,
        timestamp: new Date()
      });
    });

    // Send chat message
    socket.on('send-message', (data) => {
      const message = {
        id: Date.now().toString(),
        content: data.content,
        author: {
          id: socket.userId,
          name: socket.username,
          avatar: socket.avatar
        },
        projectId: data.room,
        createdAt: new Date(),
        reactions: []
      };

      // Broadcast to room
      socket.to(data.room).emit('receive-message', message);
      
      // Store message in database
      storeMessage(message);
    });

    // User presence
    socket.on('user-online', (userId) => {
      socket.userId = userId;
      socket.broadcast.emit('user-status', { 
        userId, 
        status: 'online',
        timestamp: new Date()
      });
    });

    socket.on('user-offline', (userId) => {
      socket.broadcast.emit('user-status', { 
        userId, 
        status: 'offline',
        timestamp: new Date()
      });
    });

    // Typing indicators
    socket.on('typing-start', (data) => {
      socket.to(data.room).emit('user-typing', {
        userId: socket.userId,
        username: socket.username,
        isTyping: true
      });
    });

    socket.on('typing-stop', (data) => {
      socket.to(data.room).emit('user-typing', {
        userId: socket.userId,
        username: socket.username,
        isTyping: false
      });
    });

    // Project updates
    socket.on('project-update', (data) => {
      socket.to(data.projectId).emit('project-changed', {
        projectId: data.projectId,
        updates: data.updates,
        timestamp: new Date()
      });
    });

    // Disconnect handling
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      if (socket.userId) {
        socket.broadcast.emit('user-status', { 
          userId: socket.userId, 
          status: 'offline',
          timestamp: new Date()
        });
      }
    });
  });

  server.listen(3001, () => {
    console.log('Socket.IO server running on port 3001');
  });
});
```

### Client Configuration

```typescript
// Socket.IO client setup
import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(userId: string, username: string, avatar?: string) {
    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      auth: {
        userId,
        username,
        avatar
      },
      autoConnect: true
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.handleReconnect();
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.socket?.connect();
      }, 1000 * this.reconnectAttempts);
    }
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const socketService = new SocketService();
```

## 💬 Chat System

### Chat Room Management

```typescript
// Chat room types
interface ChatRoom {
  id: string;
  type: 'project' | 'general' | 'organization';
  name: string;
  description?: string;
  participants: string[];
  createdAt: Date;
  lastMessage?: ChatMessage;
}

// Chat message interface
interface ChatMessage {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  projectId?: string;
  organizationId?: string;
  createdAt: Date;
  editedAt?: Date;
  isDeleted: boolean;
  reactions: MessageReaction[];
  replies: ChatMessage[];
  parentId?: string;
}

interface MessageReaction {
  emoji: string;
  users: string[];
  count: number;
}
```

### Chat Component Implementation

```typescript
// Chat component with real-time features
export function ChatInterface({ projectId }: { projectId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Join project chat room
    socket.emit('join-room', projectId);

    // Load existing messages
    loadMessages(projectId);

    // Listen for new messages
    socket.on('receive-message', (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for typing indicators
    socket.on('user-typing', (data) => {
      if (data.isTyping) {
        setTypingUsers(prev => [...prev.filter(u => u !== data.username), data.username]);
      } else {
        setTypingUsers(prev => prev.filter(u => u !== data.username));
      }
    });

    // Listen for user presence
    socket.on('user-status', (data) => {
      if (data.status === 'online') {
        setOnlineUsers(prev => [...prev.filter(u => u !== data.userId), data.userId]);
      } else {
        setOnlineUsers(prev => prev.filter(u => u !== data.userId));
      }
    });

    return () => {
      socket.emit('leave-room', projectId);
      socket.off('receive-message');
      socket.off('user-typing');
      socket.off('user-status');
    };
  }, [socket, projectId]);

  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    socket.emit('send-message', {
      room: projectId,
      content: newMessage
    });

    setNewMessage('');
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      socket?.emit('typing-start', { room: projectId });
    }
  };

  const handleTypingStop = () => {
    setIsTyping(false);
    socket?.emit('typing-stop', { room: projectId });
  };

  return (
    <div className="chat-interface">
      {/* Online users */}
      <div className="online-users">
        <span>Online: {onlineUsers.length}</span>
        {onlineUsers.map(userId => (
          <span key={userId} className="user-indicator">●</span>
        ))}
      </div>

      {/* Messages */}
      <div className="messages">
        {messages.map(message => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>

      {/* Typing indicators */}
      {typingUsers.length > 0 && (
        <div className="typing-indicator">
          {typingUsers.join(', ')} is typing...
        </div>
      )}

      {/* Message input */}
      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={handleTyping}
          onBlur={handleTypingStop}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
```

### Message Reactions

```typescript
// Message reaction system
export function MessageBubble({ message }: { message: ChatMessage }) {
  const [showReactions, setShowReactions] = useState(false);
  const { socket } = useSocket();

  const addReaction = (emoji: string) => {
    socket?.emit('add-reaction', {
      messageId: message.id,
      emoji,
      userId: getCurrentUserId()
    });
  };

  const removeReaction = (emoji: string) => {
    socket?.emit('remove-reaction', {
      messageId: message.id,
      emoji,
      userId: getCurrentUserId()
    });
  };

  return (
    <div className="message-bubble">
      <div className="message-header">
        <span className="author">{message.author.name}</span>
        <span className="timestamp">{formatTime(message.createdAt)}</span>
      </div>
      
      <div className="message-content">
        {message.content}
      </div>

      {/* Reactions */}
      <div className="message-reactions">
        {message.reactions.map(reaction => (
          <button
            key={reaction.emoji}
            className={`reaction ${reaction.users.includes(getCurrentUserId()) ? 'active' : ''}`}
            onClick={() => 
              reaction.users.includes(getCurrentUserId()) 
                ? removeReaction(reaction.emoji)
                : addReaction(reaction.emoji)
            }
          >
            {reaction.emoji} {reaction.count}
          </button>
        ))}
        
        <button 
          className="add-reaction"
          onClick={() => setShowReactions(!showReactions)}
        >
          +
        </button>
      </div>

      {/* Reaction picker */}
      {showReactions && (
        <div className="reaction-picker">
          {['👍', '❤️', '😂', '😮', '😢', '😡'].map(emoji => (
            <button
              key={emoji}
              onClick={() => {
                addReaction(emoji);
                setShowReactions(false);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 👥 User Presence System

### Presence Tracking

```typescript
// User presence management
class PresenceManager {
  private onlineUsers = new Map<string, UserPresence>();
  private socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
    this.setupPresenceHandlers();
  }

  private setupPresenceHandlers() {
    this.socket.on('user-status', (data) => {
      if (data.status === 'online') {
        this.onlineUsers.set(data.userId, {
          userId: data.userId,
          status: 'online',
          lastSeen: new Date(),
          currentRoom: data.room
        });
      } else {
        this.onlineUsers.delete(data.userId);
      }
    });
  }

  getOnlineUsers(): UserPresence[] {
    return Array.from(this.onlineUsers.values());
  }

  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  getUserPresence(userId: string): UserPresence | undefined {
    return this.onlineUsers.get(userId);
  }
}

interface UserPresence {
  userId: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: Date;
  currentRoom?: string;
}
```

### Presence Component

```typescript
// Online users display component
export function OnlineUsers({ projectId }: { projectId: string }) {
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleUserStatus = (data: any) => {
      if (data.status === 'online') {
        setOnlineUsers(prev => [
          ...prev.filter(u => u.userId !== data.userId),
          {
            userId: data.userId,
            status: 'online',
            lastSeen: new Date(),
            currentRoom: projectId
          }
        ]);
      } else {
        setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
      }
    };

    socket.on('user-status', handleUserStatus);

    return () => {
      socket.off('user-status', handleUserStatus);
    };
  }, [socket, projectId]);

  return (
    <div className="online-users">
      <h3>Online Users ({onlineUsers.length})</h3>
      <div className="user-list">
        {onlineUsers.map(user => (
          <div key={user.userId} className="user-item">
            <div className="status-indicator online" />
            <span className="username">{user.userId}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 🔄 Live Updates System

### Project Updates

```typescript
// Live project updates
export function useProjectUpdates(projectId: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleProjectUpdate = (data: any) => {
      if (data.projectId === projectId) {
        setProject(prev => prev ? { ...prev, ...data.updates } : prev);
        setUpdates(prev => [data, ...prev]);
      }
    };

    socket.on('project-changed', handleProjectUpdate);

    return () => {
      socket.off('project-changed', handleProjectUpdate);
    };
  }, [socket, projectId]);

  const publishUpdate = (update: Partial<ProjectUpdate>) => {
    socket?.emit('project-update', {
      projectId,
      updates: update
    });
  };

  return { project, updates, publishUpdate };
}
```

### Real-time Notifications

```typescript
// Real-time notification system
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      
      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico'
        });
      }
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [socket]);

  const markAsRead = (notificationId: string) => {
    socket?.emit('mark-notification-read', notificationId);
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  return { notifications, markAsRead };
}
```

## 📊 Live Analytics

### Real-time Metrics

```typescript
// Live analytics dashboard
export function LiveAnalytics({ projectId }: { projectId: string }) {
  const [metrics, setMetrics] = useState<ProjectMetrics | null>(null);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleMetricsUpdate = (data: any) => {
      if (data.projectId === projectId) {
        setMetrics(data.metrics);
      }
    };

    socket.on('metrics-update', handleMetricsUpdate);

    return () => {
      socket.off('metrics-update', handleMetricsUpdate);
    };
  }, [socket, projectId]);

  return (
    <div className="live-analytics">
      <h3>Live Metrics</h3>
      <div className="metrics-grid">
        <div className="metric">
          <span className="label">Current Funding</span>
          <span className="value">${metrics?.currentFunding || 0}</span>
        </div>
        <div className="metric">
          <span className="label">Backers</span>
          <span className="value">{metrics?.backers || 0}</span>
        </div>
        <div className="metric">
          <span className="label">Views Today</span>
          <span className="value">{metrics?.viewsToday || 0}</span>
        </div>
      </div>
    </div>
  );
}
```

## 🔧 Socket.IO Hooks

### Custom React Hooks

```typescript
// Socket.IO connection hook
export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');
    
    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return { socket, isConnected };
}

// Chat room hook
export function useChatRoom(projectId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.emit('join-room', projectId);

    const handleMessage = (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    };

    const handleUserJoined = (data: any) => {
      setOnlineUsers(prev => [...prev, data.userId]);
    };

    const handleUserLeft = (data: any) => {
      setOnlineUsers(prev => prev.filter(id => id !== data.userId));
    };

    socket.on('receive-message', handleMessage);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);

    return () => {
      socket.emit('leave-room', projectId);
      socket.off('receive-message', handleMessage);
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
    };
  }, [socket, projectId]);

  const sendMessage = (content: string) => {
    socket?.emit('send-message', { room: projectId, content });
  };

  return { messages, onlineUsers, sendMessage };
}
```

## 🚀 Performance Optimization

### Connection Management

```typescript
// Socket.IO connection manager
class ConnectionManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(userId: string) {
    if (this.socket?.connected) return;

    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      auth: { userId },
      transports: ['websocket'],
      upgrade: true,
      rememberUpgrade: true
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      this.handleReconnect();
    });

    this.socket.on('connect_error', () => {
      this.handleReconnect();
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.socket?.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}
```

### Message Batching

```typescript
// Message batching for performance
class MessageBatcher {
  private messages: ChatMessage[] = [];
  private batchSize = 10;
  private batchTimeout = 1000;
  private timeoutId: NodeJS.Timeout | null = null;

  addMessage(message: ChatMessage) {
    this.messages.push(message);

    if (this.messages.length >= this.batchSize) {
      this.flushMessages();
    } else {
      this.scheduleFlush();
    }
  }

  private scheduleFlush() {
    if (this.timeoutId) return;

    this.timeoutId = setTimeout(() => {
      this.flushMessages();
    }, this.batchTimeout);
  }

  private flushMessages() {
    if (this.messages.length === 0) return;

    // Process batch of messages
    this.processBatch(this.messages);
    this.messages = [];

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private processBatch(messages: ChatMessage[]) {
    // Update UI with batched messages
    this.updateUI(messages);
  }
}
```

## 🧪 Testing Real-time Features

### Socket.IO Testing

```typescript
// Socket.IO testing utilities
import { io } from 'socket.io-client';

describe('Socket.IO Features', () => {
  let clientSocket: Socket;

  beforeEach((done) => {
    clientSocket = io('http://localhost:3001');
    clientSocket.on('connect', done);
  });

  afterEach(() => {
    clientSocket.close();
  });

  test('should join chat room', (done) => {
    clientSocket.emit('join-room', 'project123');
    
    clientSocket.on('user-joined', (data) => {
      expect(data.room).toBe('project123');
      done();
    });
  });

  test('should send and receive messages', (done) => {
    const message = {
      room: 'project123',
      content: 'Hello world!'
    };

    clientSocket.emit('send-message', message);
    
    clientSocket.on('receive-message', (receivedMessage) => {
      expect(receivedMessage.content).toBe('Hello world!');
      done();
    });
  });
});
```

This comprehensive real-time features system provides instant communication, collaboration, and engagement for Revolution Network users while maintaining performance and reliability.
