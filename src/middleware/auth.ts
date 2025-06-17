import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        extensionId: string;
        role: string;
        type: 'access' | 'refresh';
      };
    }
  }
}

interface TokenPayload {
  id: string;
  extensionId: string;
  role: string;
  type: 'access' | 'refresh';
}

// Development mode mock user
const devUser = {
  id: 'dev-user-id',
  extensionId: 'dev-extension-id',
  role: 'extension',
  type: 'access' as const
};

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  // Bypass authentication in development mode
  if (process.env.NODE_ENV === 'development') {
    req.user = devUser;
    return next();
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as TokenPayload;

    if (decoded.type !== 'access') {
      throw new AppError('Invalid token type', 401);
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401));
    } else {
      next(error);
    }
  }
};

export const generateTokens = (extensionId: string): { accessToken: string; refreshToken: string } => {
  // Return mock tokens in development mode
  if (process.env.NODE_ENV === 'development') {
    return {
      accessToken: 'dev-access-token',
      refreshToken: 'dev-refresh-token'
    };
  }

  const payload: TokenPayload = {
    id: crypto.randomUUID(),
    extensionId,
    role: 'extension',
    type: 'access'
  };

  const refreshPayload: TokenPayload = {
    ...payload,
    type: 'refresh'
  };

  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET || 'your-secret-key',
    {
      expiresIn: '30d'
    }
  );

  const refreshToken = jwt.sign(
    refreshPayload,
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    {
      expiresIn: '60d'
    }
  );

  return { accessToken, refreshToken };
};

export const refreshAccessToken = (refreshToken: string): string => {
  // Return mock token in development mode
  if (process.env.NODE_ENV === 'development') {
    return 'dev-new-access-token';
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'
    ) as TokenPayload;

    if (decoded.type !== 'refresh') {
      throw new AppError('Invalid token type', 401);
    }

    return jwt.sign(
      {
        id: decoded.id,
        extensionId: decoded.extensionId,
        role: decoded.role,
        type: 'access'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      {
        expiresIn: '30d'
      }
    );
  } catch (error) {
    throw new AppError('Invalid refresh token', 401);
  }
};

export const verifyExtensionId = (req: Request, res: Response, next: NextFunction) => {
  // Bypass extension ID verification in development mode
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  const extensionId = req.headers['x-extension-id'];
  if (!extensionId || extensionId !== process.env.EXTENSION_ID) {
    throw new AppError('Invalid extension ID', 401);
  }
  next();
}; 