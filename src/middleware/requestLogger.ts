import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const logFile = path.join(logsDir, 'requests.log');

function writeLog(logData: any) {
  const logEntry = JSON.stringify(logData) + '\n';
  fs.appendFileSync(logFile, logEntry);
}

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const requestId = randomUUID();

  // Add request ID to response headers
  res.setHeader('X-Request-ID', requestId);

  // Log request start
  const requestLog = {
    requestId,
    type: 'request_start',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    headers: {
      'x-extension-id': req.headers['x-extension-id'],
      'content-type': req.headers['content-type']
    },
    body: req.body
  };

  console.log(requestLog);
  writeLog(requestLog);

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const responseLog = {
      requestId,
      type: 'request_end',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      responseHeaders: res.getHeaders()
    };

    console.log(responseLog);
    writeLog(responseLog);
  });

  next();
}; 