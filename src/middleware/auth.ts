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

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
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
      expiresIn: '30d'  // Extended to 30 days
    }
  );

  const refreshToken = jwt.sign(
    refreshPayload,
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    {
      expiresIn: '60d'  // Refresh token valid for 60 days
    }
  );

  return { accessToken, refreshToken };
};

export const refreshAccessToken = (refreshToken: string): string => {
  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'
    ) as TokenPayload;

    if (decoded.type !== 'refresh') {
      throw new AppError('Invalid token type', 401);
    }

    // Generate new access token
    return jwt.sign(
      {
        id: decoded.id,
        extensionId: decoded.extensionId,
        role: decoded.role,
        type: 'access'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      {
        expiresIn: '30d'  // New access token also valid for 30 days
      }
    );
  } catch (error) {
    throw new AppError('Invalid refresh token', 401);
  }
};

export const verifyExtensionId = (req: Request, res: Response, next: NextFunction) => {
  const extensionId = req.headers['x-extension-id'];
  if (!extensionId || extensionId !== process.env.EXTENSION_ID) {
    throw new AppError('Invalid extension ID', 401);
  }
  next();
}; 