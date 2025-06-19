import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { verifySignature } from '../utils/keyPair';

export const verifyExtensionSignature = (req: Request, res: Response, next: NextFunction) => {
  // Bypass extension signature verification in development mode
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  try {
    const extensionId = req.headers['x-extension-id'];
    const timestamp = req.headers['x-timestamp'];
    const signature = req.headers['x-signature'];
    const publicKey = process.env.EXTENSION_PUBLIC_KEY;

    if (!extensionId || !timestamp || !signature || !publicKey) {
      throw new AppError('Missing required headers', 401);
    }

    // Verify timestamp is within 5 minutes
    const requestTime = parseInt(timestamp as string);
    const currentTime = Date.now();
    if (Math.abs(currentTime - requestTime) > 5 * 60 * 1000) {
      throw new AppError('Request expired', 401);
    }

    // Create the data string that was signed
    const dataToVerify = `${extensionId}:${timestamp}:${JSON.stringify(req.body)}`;

    // Verify the signature
    const isValid = verifySignature(dataToVerify, signature as string, publicKey);
    if (!isValid) {
      throw new AppError('Invalid signature', 401);
    }

    next();
  } catch (error) {
    next(error);
  }
}; 