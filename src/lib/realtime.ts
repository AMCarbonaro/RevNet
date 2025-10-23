import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { connectDB } from './mongodb';
import { UserModel, ProjectModel, DonationModel } from './models';

export interface RealtimeEvent {
  id: string;
  type: string;
  userId: string;
  data: any;
  timestamp: Date;
  metadata?: any;
}

export interface UserPresence {
  userId: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: Date;
  currentPage?: string;
  activity?: string;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: Date;
  roomId: string;
}

export interface LiveUpdate {
  type: 'project_created' | 'project_funded' | 'donation_received' | 'user_joined' | 'user_left';
  data: any;
  timestamp: Date;
  userId?: string;
}

class RealtimeService {
  private io: SocketIOServer;
  private redisClient: any;
  private redisSubscriber: any;
  private connectedUsers: Map<string, UserPresence> = new Map();
  private typingUsers: Map<string, TypingIndicator> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.initializeRedis();
    this.setupEventHandlers();
  }

  private async initializeRedis() {
    try {
      this.redisClient = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });
      this.redisSubscriber = this.redisClient.duplicate();

      await Promise.all([
        this.redisClient.connect(),
        this.redisSubscriber.connect()
      ]);

      this.io.adapter(createAdapter(this.redisClient, this.redisSubscriber));
      console.log('✅ Redis adapter connected for Socket.IO scaling');
    } catch (error) {
      console.error('❌ Redis connection failed:', error);
    }
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`👤 User connected: ${socket.id}`);

      // Authentication middleware
      socket.use((packet, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication required'));
        }
        // In production, verify JWT token here
        next();
      });

      // User joins with presence
      socket.on('user:join', async (data) => {
        const { userId, userName, currentPage } = data;
        
        const presence: UserPresence = {
          userId,
          status: 'online',
          lastSeen: new Date(),
          currentPage,
          activity: 'browsing'
        };

        this.connectedUsers.set(userId, presence);
        
        // Join user to their personal room
        socket.join(`user:${userId}`);
        
        // Join user to general presence room
        socket.join('presence:global');
        
        // Broadcast user presence
        socket.to('presence:global').emit('user:presence', presence);
        
        // Send current online users to the new user
        socket.emit('users:online', Array.from(this.connectedUsers.values()));
        
        console.log(`👤 ${userName} joined (${userId})`);
      });

      // User leaves
      socket.on('disconnect', () => {
        // Find user by socket ID (in production, maintain socket-to-user mapping)
        for (const [userId, presence] of this.connectedUsers.entries()) {
          if (presence.status === 'online') {
            presence.status = 'offline';
            presence.lastSeen = new Date();
            
            socket.to('presence:global').emit('user:presence', presence);
            this.connectedUsers.set(userId, presence);
            break;
          }
        }
        
        console.log(`👤 User disconnected: ${socket.id}`);
      });

      // Typing indicators
      socket.on('typing:start', (data) => {
        const { userId, userName, roomId } = data;
        
        const typing: TypingIndicator = {
          userId,
          userName,
          isTyping: true,
          timestamp: new Date(),
          roomId
        };

        this.typingUsers.set(`${roomId}:${userId}`, typing);
        
        socket.to(roomId).emit('typing:indicator', typing);
        
        // Auto-clear typing indicator after 3 seconds
        setTimeout(() => {
          typing.isTyping = false;
          this.typingUsers.set(`${roomId}:${userId}`, typing);
          socket.to(roomId).emit('typing:indicator', typing);
        }, 3000);
      });

      socket.on('typing:stop', (data) => {
        const { userId, roomId } = data;
        
        const typing = this.typingUsers.get(`${roomId}:${userId}`);
        if (typing) {
          typing.isTyping = false;
          this.typingUsers.set(`${roomId}:${userId}`, typing);
          socket.to(roomId).emit('typing:indicator', typing);
        }
      });

      // Project updates
      socket.on('project:join', (projectId) => {
        socket.join(`project:${projectId}`);
        console.log(`📁 User joined project: ${projectId}`);
      });

      socket.on('project:leave', (projectId) => {
        socket.leave(`project:${projectId}`);
        console.log(`📁 User left project: ${projectId}`);
      });

      // Live donations
      socket.on('donation:live', async (data) => {
        const { projectId, amount, donorName, isAnonymous } = data;
        
        const liveUpdate: LiveUpdate = {
          type: 'donation_received',
          data: {
            projectId,
            amount,
            donorName: isAnonymous ? 'Anonymous Supporter' : donorName,
            isAnonymous,
            timestamp: new Date()
          },
          timestamp: new Date()
        };

        // Broadcast to project room
        this.io.to(`project:${projectId}`).emit('live:update', liveUpdate);
        
        // Broadcast to global feed (for public donations)
        if (!isAnonymous) {
          this.io.to('presence:global').emit('live:update', liveUpdate);
        }

        console.log(`💰 Live donation: $${amount} to project ${projectId}`);
      });

      // Activity tracking
      socket.on('activity:track', (data) => {
        const { userId, activity, metadata } = data;
        
        const presence = this.connectedUsers.get(userId);
        if (presence) {
          presence.activity = activity;
          presence.lastSeen = new Date();
          this.connectedUsers.set(userId, presence);
          
          // Broadcast activity to followers/friends
          socket.to(`followers:${userId}`).emit('user:activity', {
            userId,
            activity,
            metadata,
            timestamp: new Date()
          });
        }
      });

      // Real-time notifications
      socket.on('notification:subscribe', (data) => {
        const { userId, types } = data;
        
        // Join notification rooms based on types
        types.forEach((type: string) => {
          socket.join(`notifications:${type}:${userId}`);
        });
      });

      // Error handling
      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    });
  }

  // Public methods for broadcasting events
  public async broadcastProjectUpdate(projectId: string, update: any) {
    const liveUpdate: LiveUpdate = {
      type: 'project_created',
      data: update,
      timestamp: new Date()
    };

    this.io.to(`project:${projectId}`).emit('project:update', liveUpdate);
    this.io.to('presence:global').emit('live:update', liveUpdate);
  }

  public async broadcastDonation(projectId: string, donation: any) {
    const liveUpdate: LiveUpdate = {
      type: 'donation_received',
      data: donation,
      timestamp: new Date()
    };

    this.io.to(`project:${projectId}`).emit('donation:received', liveUpdate);
    
    if (!donation.isAnonymous) {
      this.io.to('presence:global').emit('live:update', liveUpdate);
    }
  }

  public async broadcastUserJoin(userId: string, userData: any) {
    const liveUpdate: LiveUpdate = {
      type: 'user_joined',
      data: userData,
      timestamp: new Date(),
      userId
    };

    this.io.to('presence:global').emit('live:update', liveUpdate);
  }

  public async sendNotification(userId: string, notification: any) {
    this.io.to(`user:${userId}`).emit('notification:new', notification);
  }

  public async sendNotificationToRoom(roomId: string, notification: any) {
    this.io.to(roomId).emit('notification:new', notification);
  }

  public getOnlineUsers(): UserPresence[] {
    return Array.from(this.connectedUsers.values()).filter(
      user => user.status === 'online'
    );
  }

  public getTypingUsers(roomId: string): TypingIndicator[] {
    return Array.from(this.typingUsers.values())
      .filter(typing => typing.roomId === roomId && typing.isTyping);
  }

  public async getRealtimeStats() {
    await connectDB();
    
    const totalUsers = await UserModel.countDocuments();
    const activeProjects = await ProjectModel.countDocuments({ status: 'active' });
    const totalDonations = await DonationModel.countDocuments();
    const recentDonations = await DonationModel.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name image');

    return {
      onlineUsers: this.connectedUsers.size,
      totalUsers,
      activeProjects,
      totalDonations,
      recentActivity: recentDonations,
      typingUsers: this.typingUsers.size
    };
  }

  public getIO() {
    return this.io;
  }
}

let realtimeService: RealtimeService;

export const initializeRealtime = (server: HTTPServer) => {
  realtimeService = new RealtimeService(server);
  return realtimeService;
};

export const getRealtimeService = () => {
  if (!realtimeService) {
    throw new Error('Realtime service not initialized');
  }
  return realtimeService;
};

export default RealtimeService;
