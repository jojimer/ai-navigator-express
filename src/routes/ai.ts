import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AIController } from '../controllers/aiController';
import { verifyToken } from '../middleware/auth';

const router = Router();
const controller = new AIController();

// Rate limiting configuration
const textGenerationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many text generation requests, please try again later.'
});

const embeddingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message: 'Too many embedding requests, please try again later.'
});

const analysisLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // 15 requests per minute
  message: 'Too many text analysis requests, please try again later.'
});

// Text generation endpoint
router.post('/generate', verifyToken, textGenerationLimiter, controller.generateText);

// Embedding generation endpoint
router.post('/embed', verifyToken, embeddingLimiter, controller.generateEmbedding);

// Text analysis endpoint
router.post('/analyze', verifyToken, analysisLimiter, controller.analyzeText);

export default router; 