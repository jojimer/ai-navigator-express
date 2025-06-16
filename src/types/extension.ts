import { z } from 'zod';

export const ActionSchema = z.object({
  type: z.enum(['click', 'input', 'navigation', 'scroll', 'hover']),
  target: z.object({
    tagName: z.string(),
    id: z.string().optional(),
    className: z.string().optional(),
    text: z.string().optional(),
    url: z.string().optional()
  }),
  timestamp: z.number(),
  metadata: z.object({
    pageUrl: z.string().url(),
    sessionId: z.string(),
    userId: z.string().optional(),
    browserInfo: z.object({
      userAgent: z.string(),
      platform: z.string(),
      language: z.string()
    }).optional()
  })
});

export const FeedbackSchema = z.object({
  actionId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  metadata: z.object({
    sessionId: z.string(),
    userId: z.string().optional(),
    timestamp: z.number()
  })
});

export const ExtensionStatusSchema = z.object({
  version: z.string(),
  isActive: z.boolean(),
  lastSync: z.number(),
  features: z.array(z.string()),
  settings: z.object({
    recordingEnabled: z.boolean(),
    feedbackEnabled: z.boolean(),
    syncInterval: z.number()
  })
});

export type Action = z.infer<typeof ActionSchema>;
export type Feedback = z.infer<typeof FeedbackSchema>;
export type ExtensionStatus = z.infer<typeof ExtensionStatusSchema>;

// WebSocket event types
export type WebSocketEvent = {
  type: 'action' | 'feedback' | 'status' | 'sync';
  data: Action | Feedback | ExtensionStatus;
  timestamp: number;
}; 