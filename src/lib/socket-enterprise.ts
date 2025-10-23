import { Server as NetServer } from 'http';
import { NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { ChatMessageModel } from './models';
import connectDB from './db';

export const config = {
  api: {
    bodyParser: false,
  },
};

export type NextApiResponseServerIO = NextApiResponse & {
  socket: any & {
    server: NetServer & {
      io: ServerIO;
    };
  };
};

export const SocketHandler = async (req: any, res: NextApiResponseServerIO) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing with Redis adapter');
    
    const io = new ServerIO(res.socket.server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.NEXTAUTH_URL 
          : "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    // Set up Redis adapter for scaling
    let redisClient;
    let redisAdapter;
    
    try {
      if (process.env.REDIS_URL) {
        redisClient = createClient({ url: process.env.REDIS_URL });
        const pubClient = redisClient.duplicate();
        
        await Promise.all([redisClient.connect(), pubClient.connect()]);
        
        redisAdapter = createAdapter(redisClient, pubClient);
        io.adapter(redisAdapter);
        console.log('Redis adapter connected');
      }
    } catch (error) {
      console.warn('Redis connection failed, using memory adapter:', error);
    }

    res.socket.server.io = io;

    // Rate limiting store
    const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
    
    const rateLimit = (socketId: string, limit: number = 10, windowMs: number = 60000) => {
      const now = Date.now();
      const key = socketId;
      
      if (!rateLimitStore.has(key)) {
        rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
        return true;
      }
      
      const current = rateLimitStore.get(key)!;
      
      if (now > current.resetTime) {
        current.count = 1;
        current.resetTime = now + windowMs;
        return true;
      }
      
      if (current.count >= limit) {
        return false;
      }
      
      current.count++;
      return true;
    };

    io.on('connection', async (socket) => {
      console.log('User connected:', socket.id);

      // Connection metadata
      const connectionData = {
        socketId: socket.id,
        connectedAt: new Date(),
        lastActivity: new Date(),
        rooms: new Set<string>(),
        rateLimitCount: 0
      };

      // Auto-reconnection handling
      socket.on('reconnect', (data) => {
        console.log(`User ${data.userId} reconnected`);
        connectionData.lastActivity = new Date();
      });

      // Join room with persistence
      socket.on('join-room', async (roomId: string) => {
        try {
          await connectDB();
          
          socket.join(roomId);
          connectionData.rooms.add(roomId);
          
          console.log(`User ${socket.id} joined room ${roomId}`);
          
          // Get recent message history
          const recentMessages = await ChatMessageModel
            .find({ roomId })
            .sort({ timestamp: -1 })
            .limit(50)
            .lean();
          
          // Send message history to user
          socket.emit('message-history', {
            roomId,
            messages: recentMessages.reverse()
          });
          
          // Notify others in the room
          socket.to(roomId).emit('user-joined', {
            userId: socket.id,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error joining room:', error);
          socket.emit('error', { message: 'Failed to join room' });
        }
      });

      // Leave room
      socket.on('leave-room', (roomId: string) => {
        socket.leave(roomId);
        connectionData.rooms.delete(roomId);
        
        console.log(`User ${socket.id} left room ${roomId}`);
        
        // Notify others in the room
        socket.to(roomId).emit('user-left', {
          userId: socket.id,
          timestamp: new Date().toISOString()
        });
      });

      // Send message with persistence and rate limiting
      socket.on('send-message', async (data) => {
        try {
          // Rate limiting
          if (!rateLimit(socket.id, 30, 60000)) {
            socket.emit('rate-limit-exceeded', {
              message: 'Too many messages. Please slow down.'
            });
            return;
          }

          const { roomId, content, senderId, senderName, messageType = 'text' } = data;
          
          if (!roomId || !content || !senderId || !senderName) {
            socket.emit('error', { message: 'Missing required fields' });
            return;
          }

          // Sanitize content
          const sanitizedContent = content.trim().substring(0, 1000);
          
          if (sanitizedContent.length === 0) {
            return;
          }

          await connectDB();
          
          // Create message document
          const message = new ChatMessageModel({
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            roomId,
            senderId,
            senderName,
            content: sanitizedContent,
            timestamp: new Date(),
            reactions: [],
            edited: false
          });
          
          const savedMessage = await message.save();
          
          // Broadcast message to all users in the room
          io.to(roomId).emit('new-message', {
            id: savedMessage.id,
            roomId,
            senderId,
            senderName,
            content: sanitizedContent,
            timestamp: savedMessage.timestamp,
            reactions: [],
            edited: false
          });
          
          connectionData.lastActivity = new Date();
        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Message reactions
      socket.on('message-reaction', async (data) => {
        try {
          const { messageId, emoji, userId, userName } = data;
          
          await connectDB();
          
          const message = await ChatMessageModel.findOne({ id: messageId });
          if (!message) {
            socket.emit('error', { message: 'Message not found' });
            return;
          }
          
          // Check if user already reacted with this emoji
          const existingReaction = message.reactions.find(
            r => r.userId === userId && r.emoji === emoji
          );
          
          if (existingReaction) {
            // Remove reaction
            message.reactions = message.reactions.filter(
              r => !(r.userId === userId && r.emoji === emoji)
            );
          } else {
            // Add reaction
            message.reactions.push({
              emoji,
              userId,
              userName,
              timestamp: new Date()
            });
          }
          
          await message.save();
          
          // Broadcast reaction update
          io.to(message.roomId).emit('message-reaction-update', {
            messageId,
            reactions: message.reactions
          });
        } catch (error) {
          console.error('Error handling message reaction:', error);
          socket.emit('error', { message: 'Failed to update reaction' });
        }
      });

      // Typing indicators with rate limiting
      socket.on('typing-start', (data) => {
        if (!rateLimit(socket.id, 60, 60000)) return;
        
        const { roomId, userId, userName } = data;
        socket.to(roomId).emit('user-typing', {
          userId,
          userName,
          isTyping: true,
          timestamp: new Date().toISOString()
        });
      });

      socket.on('typing-stop', (data) => {
        const { roomId, userId, userName } = data;
        socket.to(roomId).emit('user-typing', {
          userId,
          userName,
          isTyping: false,
          timestamp: new Date().toISOString()
        });
      });

      // User presence
      socket.on('user-online', (data) => {
        const { userId, userName } = data;
        socket.broadcast.emit('user-presence', {
          userId,
          userName,
          status: 'online',
          timestamp: new Date().toISOString()
        });
      });

      socket.on('user-offline', (data) => {
        const { userId, userName } = data;
        socket.broadcast.emit('user-presence', {
          userId,
          userName,
          status: 'offline',
          timestamp: new Date().toISOString()
        });
      });

      // Project updates
      socket.on('project-update', (data) => {
        const { projectId, update } = data;
        
        // Broadcast to all users following this project
        io.emit('project-updated', {
          projectId,
          update,
          timestamp: new Date().toISOString()
        });
      });

      // Donation notifications
      socket.on('donation-received', (data) => {
        const { projectId, donation } = data;
        
        // Broadcast to all users following this project
        io.emit('new-donation', {
          projectId,
          donation,
          timestamp: new Date().toISOString()
        });
      });

      // Message editing
      socket.on('edit-message', async (data) => {
        try {
          const { messageId, newContent, userId } = data;
          
          await connectDB();
          
          const message = await ChatMessageModel.findOne({ id: messageId });
          if (!message || message.senderId !== userId) {
            socket.emit('error', { message: 'Unauthorized or message not found' });
            return;
          }
          
          message.content = newContent.trim().substring(0, 1000);
          message.edited = true;
          message.editedAt = new Date();
          
          await message.save();
          
          // Broadcast edited message
          io.to(message.roomId).emit('message-edited', {
            messageId,
            content: message.content,
            editedAt: message.editedAt
          });
        } catch (error) {
          console.error('Error editing message:', error);
          socket.emit('error', { message: 'Failed to edit message' });
        }
      });

      // Disconnect handling
      socket.on('disconnect', (reason) => {
        console.log(`User ${socket.id} disconnected: ${reason}`);
        
        // Notify all rooms user was in
        connectionData.rooms.forEach(roomId => {
          socket.to(roomId).emit('user-left', {
            userId: socket.id,
            timestamp: new Date().toISOString()
          });
        });
        
        // Clean up connection data
        connectionData.rooms.clear();
      });

      // Error handling
      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    });

    // Cleanup rate limiting store periodically
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of rateLimitStore.entries()) {
        if (now > value.resetTime) {
          rateLimitStore.delete(key);
        }
      }
    }, 60000); // Clean every minute
  }
  res.end();
};
