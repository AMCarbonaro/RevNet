'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user) return;

    const socketInstance = io(process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_SOCKET_URL || ''
      : 'http://localhost:3000'
    );

    socketInstance.on('connect', () => {
      console.log('Connected to socket server');
      setIsConnected(true);
      
      // Send user online status
      socketInstance.emit('user-online', {
        userId: session.user.id,
        userName: session.user.name
      });
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setIsConnected(false);
      
      // Send user offline status
      socketInstance.emit('user-offline', {
        userId: session.user.id,
        userName: session.user.name
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [session]);

  return { socket, isConnected };
};
