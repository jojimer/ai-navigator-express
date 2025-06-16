import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { AppError } from './errorHandler';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  handler: (req: Request, res: Response) => {
    throw new AppError('Too many requests from this IP, please try again later', 429);
  }
});

// Stricter limiter for AI endpoints
export const aiEndpointLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each IP to 50 requests per windowMs
  message: 'Too many AI requests from this IP, please try again later',
  handler: (req: Request, res: Response) => {
    throw new AppError('Too many AI requests from this IP, please try again later', 429);
  }
});

// Training data endpoint limiter
export const trainingDataLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 requests per windowMs
  message: 'Too many training data requests from this IP, please try again later',
  handler: (req: Request, res: Response) => {
    throw new AppError('Too many training data requests from this IP, please try again later', 429);
  }
}); 