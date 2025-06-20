import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';

// CORS configuration
export const corsOptions = cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'chrome-extension://66524fcd-e700-4a96-86c9-b12bce692153', // Your extension ID
      'chrome-extension://*' // Allow any Chrome extension in development
    ];
    
    // Add any additional origins from environment
    if (process.env.ALLOWED_ORIGINS) {
      allowedOrigins.push(...process.env.ALLOWED_ORIGINS.split(','));
    }
    
    if (allowedOrigins.includes(origin) || allowedOrigins.some(allowed => allowed.includes('*'))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Extension-ID', 'X-Timestamp', 'X-Signature'],
  credentials: true,
  maxAge: 86400, // 24 hours
});

// Security headers middleware
export const securityHeaders = [
  helmet(),
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'",
        // Allow unsafe-eval in development mode for Chrome extensions
        ...(process.env.NODE_ENV === 'development' ? ["'unsafe-eval'"] : [])
      ],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: [
        "'self'", 
        'https://api.openrouter.ai',
        'http://localhost:*',
        'http://127.0.0.1:*',
        'chrome-extension://*'
      ],
      // Allow Chrome extension to access the backend
      frameSrc: ["'self'", 'chrome-extension://*'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      upgradeInsecureRequests: [],
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