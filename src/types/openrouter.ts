import { z } from 'zod';

export const OpenRouterConfigSchema = z.object({
  apiKey: z.string(),
  baseUrl: z.string().url().default('https://openrouter.ai/api/v1'),
  model: z.string().default('deepseek/deepseek-coder-33b-instruct'),
  maxTokens: z.number().min(1).max(4096).default(1024),
  temperature: z.number().min(0).max(2).default(0.7),
  topP: z.number().min(0).max(1).default(1),
  frequencyPenalty: z.number().min(-2).max(2).default(0),
  presencePenalty: z.number().min(-2).max(2).default(0)
});

export type OpenRouterConfig = z.infer<typeof OpenRouterConfigSchema>;

export const ChatMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string()
});

export const ChatCompletionRequestSchema = z.object({
  messages: z.array(ChatMessageSchema),
  model: z.string().optional(),
  maxTokens: z.number().optional(),
  temperature: z.number().optional(),
  topP: z.number().optional(),
  frequencyPenalty: z.number().optional(),
  presencePenalty: z.number().optional()
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatCompletionRequest = z.infer<typeof ChatCompletionRequestSchema>;

export const ChatCompletionResponseSchema = z.object({
  id: z.string(),
  model: z.string(),
  created: z.number(),
  choices: z.array(z.object({
    index: z.number(),
    message: ChatMessageSchema,
    finishReason: z.string().nullable()
  })),
  usage: z.object({
    promptTokens: z.number(),
    completionTokens: z.number(),
    totalTokens: z.number()
  })
});

export type ChatCompletionResponse = z.infer<typeof ChatCompletionResponseSchema>;

export const EmbeddingRequestSchema = z.object({
  input: z.union([z.string(), z.array(z.string())]),
  model: z.string().optional()
});

export const EmbeddingResponseSchema = z.object({
  data: z.array(z.object({
    object: z.literal('embedding'),
    embedding: z.array(z.number()),
    index: z.number()
  })),
  model: z.string(),
  usage: z.object({
    promptTokens: z.number(),
    totalTokens: z.number()
  })
});

export type EmbeddingRequest = z.infer<typeof EmbeddingRequestSchema>;
export type EmbeddingResponse = z.infer<typeof EmbeddingResponseSchema>; 