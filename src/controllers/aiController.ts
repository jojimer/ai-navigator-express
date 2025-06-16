import { Request, Response, NextFunction } from 'express';
import { AIService } from '../services/aiService';
import { z } from 'zod';

const TextGenerationSchema = z.object({
  prompt: z.string(),
  systemPrompt: z.string().optional(),
  options: z.object({
    temperature: z.number().optional(),
    maxTokens: z.number().optional(),
    topP: z.number().optional()
  }).optional()
});

const EmbeddingSchema = z.object({
  text: z.union([z.string(), z.array(z.string())]),
  options: z.object({
    model: z.string().optional()
  }).optional()
});

const TextAnalysisSchema = z.object({
  text: z.string(),
  type: z.enum(['sentiment', 'summary', 'keywords']),
  options: z.object({
    temperature: z.number().optional(),
    maxTokens: z.number().optional()
  }).optional()
});

export class AIController {
  private service: AIService;

  constructor() {
    this.service = new AIService();
  }

  generateText = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { prompt, systemPrompt, options } = TextGenerationSchema.parse(req.body);
      const result = await this.service.generateText(prompt, systemPrompt, options);
      res.json({ result });
    } catch (error) {
      next(error);
    }
  };

  generateEmbedding = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { text, options } = EmbeddingSchema.parse(req.body);
      const result = await this.service.generateEmbedding(text, options);
      res.json({ result });
    } catch (error) {
      next(error);
    }
  };

  analyzeText = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { text, type, options } = TextAnalysisSchema.parse(req.body);
      const result = await this.service.analyzeText(text, type, options);
      res.json({ result });
    } catch (error) {
      next(error);
    }
  };
} 