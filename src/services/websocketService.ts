import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { WebSocketEvent } from '../types/extension';

export class WebSocketService {
  private io: Server;
  private static instance: WebSocketService;

  private constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.EXTENSION_ORIGIN || '*',
        methods: ['GET', 'POST']
      }
    });

    this.setupEventHandlers();
  }

  public static getInstance(server?: HttpServer): WebSocketService {
    if (!WebSocketService.instance && server) {
      WebSocketService.instance = new WebSocketService(server);
    }
    return WebSocketService.instance;
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Handle extension events
      socket.on('extension:action', (data: WebSocketEvent) => {
        this.broadcastEvent('action', data);
      });

      socket.on('extension:feedback', (data: WebSocketEvent) => {
        this.broadcastEvent('feedback', data);
      });

      socket.on('extension:status', (data: WebSocketEvent) => {
        this.broadcastEvent('status', data);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  public broadcastEvent(type: string, data: WebSocketEvent) {
    this.io.emit(`extension:${type}`, data);
  }

  public sendToSession(sessionId: string, type: string, data: WebSocketEvent) {
    this.io.to(sessionId).emit(`extension:${type}`, data);
  }

  public joinSession(socketId: string, sessionId: string) {
    this.io.sockets.sockets.get(socketId)?.join(sessionId);
  }

  public leaveSession(socketId: string, sessionId: string) {
    this.io.sockets.sockets.get(socketId)?.leave(sessionId);
  }
} 