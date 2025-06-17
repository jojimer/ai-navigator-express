import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { TrainingController } from '../controllers/trainingController';

const router = Router();
const controller = new TrainingController();

// Rate limiting configuration
const trainingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: 'Too many training requests, please try again later.'
});

// Store training data
router.post('/record', trainingLimiter, controller.record);

// List training records with optional filters
router.get('/api/training/list', trainingLimiter, controller.list);

// Update training record
router.put('/update/:id', trainingLimiter, controller.update);

// Delete training record
router.delete('/delete/:id', trainingLimiter, controller.delete);

// Process data using OpenRouter
router.post('/process', trainingLimiter, controller.process);

export default router; 