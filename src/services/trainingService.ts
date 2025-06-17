import ChromaDB from '../db/chroma';
import { TrainingData, TrainingDataSchema, Query, QuerySchema } from '../types/training';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

export class TrainingService {
  private db: ChromaDB;

  constructor() {
    this.db = ChromaDB.getInstance();
  }

  async create(data: TrainingData): Promise<TrainingData> {
    try {
      const validatedData = TrainingDataSchema.parse(data);
      const collection = this.db.getCollection();

      const result = await collection.add({
        ids: [validatedData.id || crypto.randomUUID()],
        embeddings: [validatedData.embedding],
        metadatas: [{
          category: validatedData.metadata.category,
          timestamp: validatedData.metadata.timestamp,
          source: validatedData.metadata.source || '',
          tags: validatedData.metadata.tags?.join(',') || ''
        }],
        documents: [validatedData.text]
      });

      if (!result.ids || !result.ids[0]) {
        throw new AppError('Failed to create training data', 500);
      }

      return {
        ...validatedData,
        id: result.ids[0]
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AppError('Invalid training data format', 400);
      }
      throw new AppError('Failed to create training data', 500);
    }
  }

  async getById(id: string): Promise<TrainingData> {
    try {
      const collection = this.db.getCollection();
      const result = await collection.get({
        ids: [id]
      });

      if (!result.ids.length) {
        throw new AppError('Training data not found', 404);
      }

      const metadata = result.metadatas[0];
      if (!metadata) throw new AppError('Invalid metadata', 500);

      return {
        id: result.ids[0],
        text: result.documents[0] || '',
        embedding: result.embeddings[0] || [],
        metadata: {
          category: metadata.category as string,
          timestamp: metadata.timestamp as number,
          source: metadata.source as string,
          tags: (metadata.tags as string)?.split(',').filter(Boolean)
        }
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to retrieve training data', 500);
    }
  }

  async query(query: Query): Promise<TrainingData[]> {
    try {
      const validatedQuery = QuerySchema.parse(query);
      const collection = this.db.getCollection();

      // First get all documents
      const result = await collection.get({
        limit: validatedQuery.limit,
        offset: validatedQuery.offset
      });

      if (!result.ids || !result.ids.length) {
        return [];
      }

      // Filter results based on query parameters
      const filteredResults = result.ids.map((id, index) => {
        const metadata = result.metadatas?.[index];
        if (!metadata) return null;

        // Apply filters
        if (validatedQuery.category && metadata.category !== validatedQuery.category) {
          return null;
        }
        const timestamp = Number(metadata.timestamp);
        if (validatedQuery.startDate && timestamp < validatedQuery.startDate) {
          return null;
        }
        if (validatedQuery.endDate && timestamp > validatedQuery.endDate) {
          return null;
        }

        return {
          id,
          text: result.documents?.[index] || '',
          embedding: result.embeddings?.[index] || [],
          metadata: {
            category: metadata.category as string,
            timestamp: timestamp,
            source: metadata.source as string,
            tags: (metadata.tags as string)?.split(',').filter(Boolean)
          }
        };
      }).filter((item): item is NonNullable<typeof item> => item !== null);

      return filteredResults;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AppError('Invalid query format', 400);
      }
      throw new AppError('Failed to query training data', 500);
    }
  }

  async update(id: string, data: Partial<TrainingData>): Promise<TrainingData> {
    try {
      const existing = await this.getById(id);
      const updatedData = { ...existing, ...data };
      const validatedData = TrainingDataSchema.parse(updatedData);
      const collection = this.db.getCollection();

      await collection.update({
        ids: [id],
        embeddings: [validatedData.embedding],
        metadatas: [{
          category: validatedData.metadata.category,
          timestamp: validatedData.metadata.timestamp,
          source: validatedData.metadata.source || '',
          tags: validatedData.metadata.tags?.join(',') || ''
        }],
        documents: [validatedData.text]
      });

      return validatedData;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AppError('Invalid training data format', 400);
      }
      throw new AppError('Failed to update training data', 500);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const collection = this.db.getCollection();
      await collection.delete({
        ids: [id]
      });
    } catch (error) {
      throw new AppError('Failed to delete training data', 500);
    }
  }
} 