import { z } from 'zod';

export const TrainingDataSchema = z.object({
  id: z.string().optional(),
  text: z.string(),
  embedding: z.array(z.number()),
  metadata: z.object({
    category: z.string(),
    timestamp: z.number(),
    source: z.string().optional(),
    tags: z.array(z.string()).optional()
  })
});

export type TrainingData = z.infer<typeof TrainingDataSchema>;

export const QuerySchema = z.object({
  category: z.string().optional(),
  startDate: z.number().optional(),
  endDate: z.number().optional(),
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0)
});

export type Query = z.infer<typeof QuerySchema>; 