import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io('http://localhost:3001', {
        withCredentials: true, // ✅ very important
      });
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return socketRef;
};
