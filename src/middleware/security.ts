import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';

// CORS configuration
export const corsOptions = cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Extension-ID'],
  credentials: true,
  maxAge: 86400, // 24 hours
});

// Security headers middleware
export const securityHeaders = [
  helmet(),
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.openrouter.ai'],
    },
  }),
  helmet.hsts({
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  }),
  helmet.noSniff(),
  helmet.frameguard({ action: 'deny' }),
  helmet.xssFilter(),
]; 