import { Request, Response, NextFunction } from 'express';
import { TrainingService } from '../services/trainingService';
import { AIService } from '../services/aiService';
import { z } from 'zod';
import { AppError } from '../middleware/errorHandler';

const TrainingDataSchema = z.object({
  text: z.string(),
  category: z.string(),
  metadata: z.object({
    source: z.string().optional(),
    tags: z.array(z.string()).optional(),
    timestamp: z.number().optional()
  }).optional()
});

const ProcessDataSchema = z.object({
  text: z.string(),
  operation: z.enum(['analyze', 'embed', 'generate']),
  options: z.object({
    temperature: z.number().optional(),
    maxTokens: z.number().optional(),
    model: z.string().optional()
  }).optional()
});

export class TrainingController {
  private trainingService: TrainingService;
  private aiService: AIService;

  constructor() {
    this.trainingService = new TrainingService();
    this.aiService = new AIService();
  }

  record = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = TrainingDataSchema.parse(req.body);
      
      // Generate embedding for the text
      const embedding = await this.aiService.generateEmbedding(data.text);
      
      // Store the training data with embedding
      const result = await this.trainingService.create({
        text: data.text,
        embedding: embedding[0],
        metadata: {
          category: data.category,
          timestamp: data.metadata?.timestamp || Date.now(),
          source: data.metadata?.source,
          tags: data.metadata?.tags
        }
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = {
        category: req.query.category as string | undefined,
        startDate: req.query.startDate ? Number(req.query.startDate) : undefined,
        endDate: req.query.endDate ? Number(req.query.endDate) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        offset: req.query.offset ? Number(req.query.offset) : 0
      };

      const results = await this.trainingService.query(query);
      res.json(results);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = TrainingDataSchema.parse(req.body);

      // If text is updated, generate new embedding
      let embedding;
      if (data.text) {
        const embeddings = await this.aiService.generateEmbedding(data.text);
        embedding = embeddings[0];
      }

      const result = await this.trainingService.update(id, {
        text: data.text,
        embedding,
        metadata: {
          category: data.category,
          timestamp: data.metadata?.timestamp || Date.now(),
          source: data.metadata?.source,
          tags: data.metadata?.tags
        }
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.trainingService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  process = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { text, operation, options } = ProcessDataSchema.parse(req.body);
      let result;

      switch (operation) {
        case 'analyze':
          result = await this.aiService.analyzeText(text, 'summary', options);
          break;
        case 'embed':
          const embeddings = await this.aiService.generateEmbedding(text, options);
          result = embeddings[0];
          break;
        case 'generate':
          result = await this.aiService.generateText(text, undefined, options);
          break;
        default:
          throw new AppError('Invalid operation', 400);
      }

      res.json({ result });
    } catch (error) {
      next(error);
    }
  };
} 