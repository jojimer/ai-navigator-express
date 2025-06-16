import { OpenRouterClient } from '../clients/openrouter';
import { AppError } from '../middleware/errorHandler';
import {
  ChatMessage,
  ChatCompletionRequest,
  EmbeddingRequest
} from '../types/openrouter';

export class AIService {
  private client: OpenRouterClient;

  constructor() {
    this.client = new OpenRouterClient({});
  }

  async generateText(
    prompt: string,
    systemPrompt?: string,
    options?: Partial<ChatCompletionRequest>
  ): Promise<string> {
    try {
      const messages: ChatMessage[] = [];
      
      if (systemPrompt) {
        messages.push({
          role: 'system',
          content: systemPrompt
        });
      }

      messages.push({
        role: 'user',
        content: prompt
      });

      const response = await this.client.createChatCompletion({
        messages,
        ...options
      });

      return response.choices[0].message.content;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to generate text', 500);
    }
  }

  async generateEmbedding(
    text: string | string[],
    options?: Partial<EmbeddingRequest>
  ): Promise<number[][]> {
    try {
      const response = await this.client.createEmbedding({
        input: text,
        ...options
      });

      return response.data.map(item => item.embedding);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to generate embedding', 500);
    }
  }

  async analyzeText(
    text: string,
    analysisType: 'sentiment' | 'summary' | 'keywords',
    options?: Partial<ChatCompletionRequest>
  ): Promise<string> {
    const prompts = {
      sentiment: 'Analyze the sentiment of the following text:',
      summary: 'Provide a concise summary of the following text:',
      keywords: 'Extract key points and keywords from the following text:'
    };

    const systemPrompt = 'You are an AI assistant specialized in text analysis. Provide clear and concise responses.';

    return this.generateText(
      `${prompts[analysisType]}\n\n${text}`,
      systemPrompt,
      options
    );
  }
} 