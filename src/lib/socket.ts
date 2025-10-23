import { Server as NetServer } from 'http';
import { NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';

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

export const SocketHandler = (req: any, res: NextApiResponseServerIO) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const io = new ServerIO(res.socket.server);
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Join room
      socket.on('join-room', (roomId: string) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
        
        // Notify others in the room
        socket.to(roomId).emit('user-joined', {
          userId: socket.id,
          timestamp: new Date().toISOString()
        });
      });

      // Leave room
      socket.on('leave-room', (roomId: string) => {
        socket.leave(roomId);
        console.log(`User ${socket.id} left room ${roomId}`);
        
        // Notify others in the room
        socket.to(roomId).emit('user-left', {
          userId: socket.id,
          timestamp: new Date().toISOString()
        });
      });

      // Send message
      socket.on('send-message', (data) => {
        const { roomId, content, senderId, senderName } = data;
        
        // Broadcast message to all users in the room
        io.to(roomId).emit('new-message', {
          id: `msg_${Date.now()}`,
          roomId,
          senderId,
          senderName,
          content,
          timestamp: new Date().toISOString()
        });
      });

      // Typing indicators
      socket.on('typing-start', (data) => {
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

      // Disconnect
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });
  }
  res.end();
};
