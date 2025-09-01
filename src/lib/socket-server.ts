import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import { dbManager } from './database';

interface UserData {
  gameId: string;
  userId: string;
  username: string;
  isAdmin?: boolean;
}

class SocketManager {
  private io: SocketIOServer | null = null;
  private httpServer: ReturnType<typeof createServer> | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;

  initialize(port: number = 3001) {
    if (this.io) return this.io;

    try {
      // Create HTTP server
      this.httpServer = createServer();
      
      // Create Socket.io server
      this.io = new SocketIOServer(this.httpServer, {
        cors: {
          origin: ["http://localhost:3000", "http://localhost:3004"],
          methods: ["GET", "POST"],
          credentials: true
        },
        transports: ['websocket', 'polling']
      });

      this.setupEventHandlers();
      this.startServer(port);
      this.startCleanupInterval();

      return this.io;
    } catch (error) {
      console.error('Failed to initialize Socket.io server:', error);
      return null;
    }
  }

  private setupEventHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Handle user joining a game
      socket.on('join-game', async (data: UserData) => {
        try {
          const { gameId, userId, username, isAdmin = false } = data;
          
          // Store user data on socket for cleanup
          (socket as unknown as { userData: UserData }).userData = data;
          
          // Join the game room
          await socket.join(`game-${gameId}`);
          
          // Update user heartbeat in database
          dbManager.updateUserHeartbeat(userId, gameId, username, isAdmin);
          
          // Get current active users
          const activeUsers = dbManager.getActiveUsers(gameId);
          
          // Notify others in the game about new user
          socket.to(`game-${gameId}`).emit('user-joined', {
            user: { id: userId, username, isAdmin },
            activeUsers: activeUsers.length
          });

          // Send confirmation with current active users
          socket.emit('join-confirmed', { 
            gameId, 
            userId,
            activeUsers: activeUsers.length
          });

          console.log(`User ${username} joined game ${gameId}`);
        } catch (error) {
          console.error('Error handling join-game:', error);
          socket.emit('error', { message: 'Failed to join game' });
        }
      });

      // Handle user leaving a game
      socket.on('leave-game', async (data: { gameId: string; userId: string }) => {
        try {
          const { gameId, userId } = data;
          
          // Leave the game room
          await socket.leave(`game-${gameId}`);
          
          // Remove from database
          dbManager.removeUser(userId, gameId);
          
          // Get updated active users count
          const activeUsers = dbManager.getActiveUsers(gameId);
          
          // Notify others in the game
          socket.to(`game-${gameId}`).emit('user-left', { 
            userId,
            activeUsers: activeUsers.length
          });

          console.log(`User ${userId} left game ${gameId}`);
        } catch (error) {
          console.error('Error handling leave-game:', error);
        }
      });

      // Handle heartbeat
      socket.on('heartbeat', async (data: UserData) => {
        try {
          const { gameId, userId, username, isAdmin = false } = data;
          
          // Update heartbeat in database
          dbManager.updateUserHeartbeat(userId, gameId, username, isAdmin);
          
          // Send acknowledgment
          socket.emit('heartbeat-ack', { 
            timestamp: Date.now(),
            gameId,
            userId
          });
        } catch (error) {
          console.error('Error handling heartbeat:', error);
        }
      });

      // Handle game state changes
      socket.on('game-updated', (data: { gameId: string }) => {
        // Broadcast to all users in the game except sender
        socket.to(`game-${data.gameId}`).emit('game-state-changed', {
          gameId: data.gameId,
          timestamp: Date.now()
        });
      });

      // Handle disconnect
      socket.on('disconnect', async (reason) => {
        console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
        
        const userData = (socket as unknown as { userData?: UserData }).userData;
        if (userData) {
          try {
            // Remove user from database
            dbManager.removeUser(userData.userId, userData.gameId);
            
            // Get updated active users count
            const activeUsers = dbManager.getActiveUsers(userData.gameId);
            
            // Notify others in the game
            socket.to(`game-${userData.gameId}`).emit('user-left', { 
              userId: userData.userId,
              activeUsers: activeUsers.length
            });

            console.log(`User ${userData.username} disconnected from game ${userData.gameId}`);
          } catch (error) {
            console.error('Error handling disconnect cleanup:', error);
          }
        }
      });

      // Handle connection errors
      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    });
  }

  private startServer(port: number) {
    if (!this.httpServer) return;

    this.httpServer.listen(port, () => {
      console.log(`🚀 Socket.io server running on port ${port}`);
    }).on('error', (error: Error) => {
      if (error.code === 'EADDRINUSE') {
        console.log(`Port ${port} already in use - Socket.io server may already be running`);
      } else {
        console.error('Socket.io server error:', error);
      }
    });
  }

  private startCleanupInterval() {
    // Cleanup inactive users every 30 seconds
    this.cleanupInterval = setInterval(() => {
      try {
        const cleaned = dbManager.cleanupInactiveUsers();
        if (cleaned > 0) {
          console.log(`🧹 Cleaned up ${cleaned} inactive users`);
        }
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    }, 30000);
  }

  getIO() {
    return this.io;
  }

  shutdown() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    if (this.io) {
      this.io.close();
    }
    
    if (this.httpServer) {
      this.httpServer.close();
    }
  }
}

// Create singleton instance
const socketManager = new SocketManager();

// Initialize server when module is loaded (server-side only)
if (typeof window === 'undefined') {
  socketManager.initialize();
}

export { socketManager };