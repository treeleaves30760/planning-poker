import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
  gameId: string;
  userId: string;
  username: string;
  isAdmin?: boolean;
  onUserJoined?: (data: { user: { id: string; username: string; isAdmin: boolean }; activeUsers: number }) => void;
  onUserLeft?: (data: { userId: string; activeUsers: number }) => void;
  onGameStateChanged?: () => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useSocket(options: UseSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState(0);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const maxReconnectAttempts = 5;
  const heartbeatInterval = 15000; // 15 seconds

  // Initialize socket connection
  const connect = useCallback(() => {
    if (!options.userId || !options.gameId || !options.username) {
      return;
    }

    // Don't create multiple connections
    if (socketRef.current?.connected) {
      return;
    }

    try {
      // Create socket connection
      const socket = io(`http://${window.location.hostname}:3001`, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: false,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: maxReconnectAttempts
      });

      socketRef.current = socket;

      // Connection event handlers
      socket.on('connect', () => {
        console.log('Socket.io connected:', socket.id);
        setIsConnected(true);
        setConnectionError(null);
        setReconnectAttempts(0);

        // Join the game room
        socket.emit('join-game', {
          gameId: options.gameId,
          userId: options.userId,
          username: options.username,
          isAdmin: options.isAdmin || false
        });

        // Store user data for disconnect cleanup
        socket.emit('store-user-data', {
          gameId: options.gameId,
          userId: options.userId,
          username: options.username
        });

        // Start heartbeat
        startHeartbeat(socket);

        options.onConnect?.();
      });

      socket.on('disconnect', (reason) => {
        console.log('Socket.io disconnected:', reason);
        setIsConnected(false);
        stopHeartbeat();
        options.onDisconnect?.();

        // Auto-reconnect for certain disconnect reasons
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, try to reconnect
          scheduleReconnect();
        }
      });

      socket.on('connect_error', (error) => {
        console.error('Socket.io connection error:', error);
        setConnectionError(error.message);
        setIsConnected(false);
        scheduleReconnect();
      });

      // Game event handlers
      socket.on('join-confirmed', (data: { gameId: string; userId: string; activeUsers: number }) => {
        console.log('Join confirmed for game:', data.gameId);
        setActiveUsers(data.activeUsers);
      });

      socket.on('user-joined', (data: { user: { id: string; username: string; isAdmin: boolean }; activeUsers: number }) => {
        setActiveUsers(data.activeUsers);
        options.onUserJoined?.(data);
      });

      socket.on('user-left', (data: { userId: string; activeUsers: number }) => {
        setActiveUsers(data.activeUsers);
        options.onUserLeft?.(data);
      });

      socket.on('game-state-changed', () => {
        options.onGameStateChanged?.();
      });

      socket.on('heartbeat-ack', (data: { timestamp: number; gameId: string; userId: string }) => {
        // Heartbeat acknowledged
      });

      socket.on('error', (error: { message: string }) => {
        console.error('Socket error:', error);
        setConnectionError(error.message);
      });

    } catch (error) {
      console.error('Failed to create socket connection:', error);
      setConnectionError('Failed to connect');
    }
  }, [options.gameId, options.userId, options.username, options.isAdmin, options.onConnect, options.onDisconnect, options.onUserJoined, options.onUserLeft, options.onGameStateChanged]);

  const startHeartbeat = (socket: Socket) => {
    heartbeatIntervalRef.current = setInterval(() => {
      if (socket.connected) {
        socket.emit('heartbeat', {
          gameId: options.gameId,
          userId: options.userId,
          username: options.username,
          isAdmin: options.isAdmin || false
        });
      }
    }, heartbeatInterval);
  };

  const stopHeartbeat = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  };

  const scheduleReconnect = () => {
    if (reconnectAttempts < maxReconnectAttempts) {
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log(`Attempting to reconnect... (${reconnectAttempts + 1}/${maxReconnectAttempts})`);
        setReconnectAttempts(prev => prev + 1);
        connect();
      }, delay);
    }
  };

  // Disconnect and cleanup
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      // Leave the game room
      socketRef.current.emit('leave-game', {
        gameId: options.gameId,
        userId: options.userId
      });

      // Disconnect socket
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    stopHeartbeat();

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setIsConnected(false);
    setReconnectAttempts(0);
  }, [options.gameId, options.userId]);

  // Emit game update event
  const notifyGameUpdate = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('game-updated', {
        gameId: options.gameId
      });
    }
  }, [options.gameId]);

  // Initialize connection
  useEffect(() => {
    connect();

    // Cleanup on unmount or dependency change
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Handle page visibility and beforeunload
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isConnected) {
        connect();
      }
    };

    const handleBeforeUnload = () => {
      disconnect();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [connect, disconnect, isConnected]);

  return {
    isConnected,
    activeUsers,
    connectionError,
    reconnectAttempts,
    disconnect,
    notifyGameUpdate
  };
}