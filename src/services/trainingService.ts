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
        metadatas: [validatedData.metadata],
        documents: [validatedData.text]
      });

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

      return {
        id: result.ids[0],
        text: result.documents[0],
        embedding: result.embeddings[0],
        metadata: result.metadatas[0]
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

      const where: Record<string, any> = {};
      if (validatedQuery.category) {
        where.category = validatedQuery.category;
      }
      if (validatedQuery.startDate || validatedQuery.endDate) {
        where.timestamp = {};
        if (validatedQuery.startDate) {
          where.timestamp.$gte = validatedQuery.startDate;
        }
        if (validatedQuery.endDate) {
          where.timestamp.$lte = validatedQuery.endDate;
        }
      }

      const result = await collection.query({
        where,
        limit: validatedQuery.limit,
        offset: validatedQuery.offset
      });

      return result.ids.map((id, index) => ({
        id,
        text: result.documents[index],
        embedding: result.embeddings[index],
        metadata: result.metadatas[index]
      }));
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
        metadatas: [validatedData.metadata],
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