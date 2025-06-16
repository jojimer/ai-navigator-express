import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { WebSocketService } from '../services/websocketService';
import { Action, ActionSchema, Feedback, FeedbackSchema, ExtensionStatus, ExtensionStatusSchema } from '../types/extension';
import { AppError } from '../middleware/errorHandler';

export class ExtensionController {
  private wsService: WebSocketService;

  constructor() {
    this.wsService = WebSocketService.getInstance();
  }

  recordAction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const action = ActionSchema.parse(req.body);
      const actionId = uuidv4();

      // Broadcast action to all connected clients
      this.wsService.broadcastEvent('action', {
        type: 'action',
        data: { ...action, id: actionId },
        timestamp: Date.now()
      });

      // Send to specific session if sessionId is provided
      if (action.metadata.sessionId) {
        this.wsService.sendToSession(action.metadata.sessionId, 'action', {
          type: 'action',
          data: { ...action, id: actionId },
          timestamp: Date.now()
        });
      }

      res.status(201).json({ id: actionId, ...action });
    } catch (error) {
      next(error);
    }
  };

  getStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status: ExtensionStatus = {
        version: process.env.EXTENSION_VERSION || '1.0.0',
        isActive: true,
        lastSync: Date.now(),
        features: ['action_recording', 'feedback', 'real_time_sync'],
        settings: {
          recordingEnabled: true,
          feedbackEnabled: true,
          syncInterval: 5000
        }
      };

      res.json(status);
    } catch (error) {
      next(error);
    }
  };

  submitFeedback = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const feedback = FeedbackSchema.parse(req.body);

      // Broadcast feedback to all connected clients
      this.wsService.broadcastEvent('feedback', {
        type: 'feedback',
        data: feedback,
        timestamp: Date.now()
      });

      // Send to specific session if sessionId is provided
      if (feedback.metadata.sessionId) {
        this.wsService.sendToSession(feedback.metadata.sessionId, 'feedback', {
          type: 'feedback',
          data: feedback,
          timestamp: Date.now()
        });
      }

      res.status(201).json(feedback);
    } catch (error) {
      next(error);
    }
  };
} 