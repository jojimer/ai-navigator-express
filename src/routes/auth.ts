import { Router } from 'express';
import { generateTokens, refreshAccessToken, verifyExtensionId } from '../middleware/auth';
import { verifyExtensionSignature } from '../middleware/extensionAuth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Generate new tokens - requires extension signature verification
router.post('/token', verifyExtensionSignature, async (req, res, next) => {
  try {
    const { extensionId } = req.body;
    if (!extensionId) {
      throw new AppError('Extension ID is required', 400);
    }

    const tokens = await generateTokens(extensionId);
    res.json(tokens);
  } catch (error) {
    next(error);
  }
});

// Refresh access token - requires extension signature verification
router.post('/refresh', verifyExtensionSignature, async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    const newAccessToken = await refreshAccessToken(refreshToken);
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    next(error);
  }
});

export default router; 