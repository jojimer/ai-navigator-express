import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const requestId = randomUUID();

  // Add request ID to response headers
  res.setHeader('X-Request-ID', requestId);

  // Log request start
  console.log({
    requestId,
    type: 'request_start',
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log({
      requestId,
      type: 'request_end',
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  });

  next();
}; 