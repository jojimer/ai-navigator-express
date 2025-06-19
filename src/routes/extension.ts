import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { ExtensionController } from '../controllers/extensionController';
import { verifyToken } from '../middleware/auth';

const router = Router();
const controller = new ExtensionController();

// Rate limiting configuration
const extensionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: 'Too many extension requests, please try again later.'
});

// Record extension action
router.post('/action', verifyToken, extensionLimiter, controller.recordAction);

// Get extension status
router.get('/status', verifyToken, extensionLimiter, controller.getStatus);

// Submit feedback
router.post('/feedback', verifyToken, extensionLimiter, controller.submitFeedback);

export default router; 