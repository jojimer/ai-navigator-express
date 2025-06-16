import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { ExtensionController } from '../controllers/extensionController';

const router = Router();
const controller = new ExtensionController();

// Rate limiting configuration
const extensionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: 'Too many extension requests, please try again later.'
});

// Record extension action
router.post('/action', extensionLimiter, controller.recordAction);

// Get extension status
router.get('/status', extensionLimiter, controller.getStatus);

// Submit feedback
router.post('/feedback', extensionLimiter, controller.submitFeedback);

export default router; 