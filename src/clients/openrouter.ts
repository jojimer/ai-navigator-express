import axios, { AxiosInstance } from 'axios';
import dotenv from 'dotenv';
import { AppError } from '../middleware/errorHandler';
import {
  OpenRouterConfig,
  OpenRouterConfigSchema,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatCompletionResponseSchema,
  EmbeddingRequest,
  EmbeddingResponse,
  EmbeddingResponseSchema
} from '../types/openrouter';

// Load environment variables
dotenv.config();

export class OpenRouterClient {
  private client: AxiosInstance;
  private config: OpenRouterConfig;

  constructor(config: Partial<OpenRouterConfig>) {
    // Ensure environment variables are loaded
    if (!process.env.OPENROUTER_API_KEY) {
      throw new AppError('OPENROUTER_API_KEY is not set in environment variables', 500);
    }

    this.config = OpenRouterConfigSchema.parse({
      ...config,
      apiKey: process.env.OPENROUTER_API_KEY
    });

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
        'X-Title': process.env.APP_NAME || 'AI UI Backend'
      }
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const { status, data } = error.response;
          throw new AppError(
            data.error?.message || 'OpenRouter API error',
            status
          );
        }
        throw new AppError('Failed to connect to OpenRouter API', 500);
      }
    );
  }

  async createChatCompletion(
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    try {
      const response = await this.client.post('/chat/completions', {
        ...request,
        model: request.model || this.config.model,
        max_tokens: request.maxTokens || this.config.maxTokens,
        temperature: request.temperature || this.config.temperature,
        top_p: request.topP || this.config.topP,
        frequency_penalty: request.frequencyPenalty || this.config.frequencyPenalty,
        presence_penalty: request.presencePenalty || this.config.presencePenalty
      });

      return ChatCompletionResponseSchema.parse(response.data);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to create chat completion', 500);
    }
  }

  async createEmbedding(
    request: EmbeddingRequest
  ): Promise<EmbeddingResponse> {
    try {
      const response = await this.client.post('/embeddings', {
        ...request,
        model: request.model || this.config.model
      });

      return EmbeddingResponseSchema.parse(response.data);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to create embedding', 500);
    }
  }
} 