import { ChromaClient, Collection } from 'chromadb';
import { AppError } from '../middleware/errorHandler';

class ChromaDB {
  private static instance: ChromaDB;
  private client: ChromaClient;
  private collection: Collection | null = null;

  private constructor() {
    this.client = new ChromaClient({
      path: process.env.CHROMA_URL || 'http://localhost:8000'
    });
  }

  public static getInstance(): ChromaDB {
    if (!ChromaDB.instance) {
      ChromaDB.instance = new ChromaDB();
    }
    return ChromaDB.instance;
  }

  public async initialize(): Promise<void> {
    try {
      // Create or get the collection
      this.collection = await this.client.getOrCreateCollection({
        name: 'training_data',
        metadata: {
          description: 'Collection for storing training data'
        }
      });

      // Create indexes for efficient querying
      await this.collection.createIndex({
        field: 'metadata.category',
        type: 'text'
      });

      await this.collection.createIndex({
        field: 'metadata.timestamp',
        type: 'numeric'
      });
    } catch (error) {
      throw new AppError('Failed to initialize ChromaDB', 500);
    }
  }

  public getCollection(): Collection {
    if (!this.collection) {
      throw new AppError('ChromaDB collection not initialized', 500);
    }
    return this.collection;
  }
}

export default ChromaDB; 