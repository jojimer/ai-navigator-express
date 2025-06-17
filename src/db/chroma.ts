import { ChromaClient, Collection } from 'chromadb';
import { AppError } from '../middleware/errorHandler';

class ChromaDB {
  private static instance: ChromaDB;
  private client: ChromaClient;
  private collection: Collection | null = null;

  private constructor() {
    const chromaUrl = process.env.CHROMA_URL || 'http://127.0.0.1:8000';
    console.log(`Initializing ChromaDB client with URL: ${chromaUrl}`);
    
    this.client = new ChromaClient({
      path: chromaUrl,
      fetchOptions: {
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit'
      }
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
      // Test connection first
      console.log('Testing ChromaDB connection...');
      await this.client.heartbeat();
      console.log('✅ ChromaDB connection successful');

      // Create or get the collection
      const collectionName = process.env.CHROMA_COLLECTION_NAME || 'training_data';
      console.log(`Getting or creating collection: ${collectionName}`);
      
      this.collection = await this.client.getOrCreateCollection({
        name: collectionName,
        metadata: {
          description: 'Collection for storing training data'
        }
      });
      console.log('✅ ChromaDB collection initialized');
    } catch (error) {
      console.error('ChromaDB initialization error:', error);
      if (error instanceof Error) {
        throw new AppError(`Failed to initialize ChromaDB: ${error.message}`, 500);
      }
      throw new AppError('Failed to initialize ChromaDB: Unknown error', 500);
    }
  }

  public getCollection(): Collection {
    if (!this.collection) {
      throw new AppError('ChromaDB collection not initialized', 500);
    }
    return this.collection;
  }

  // Helper method to add documents
  public async addDocuments(documents: string[], metadatas: any[] = [], ids: string[] = []): Promise<void> {
    try {
      const collection = this.getCollection();
      await collection.upsert({
        ids: ids.length ? ids : documents.map((_, i) => `doc_${i}`),
        documents: documents,
        metadatas: metadatas.length ? metadatas : documents.map(() => ({ timestamp: Date.now() }))
      });
      console.log(`✅ Added ${documents.length} documents to ChromaDB`);
    } catch (error) {
      console.error('Error adding documents:', error);
      throw new AppError('Failed to add documents to ChromaDB', 500);
    }
  }

  // Helper method to query documents
  public async queryDocuments(query: string, nResults: number = 5): Promise<any> {
    try {
      const collection = this.getCollection();
      const results = await collection.query({
        queryTexts: [query],
        nResults: nResults
      });
      console.log(`✅ Query successful, found ${results.ids[0].length} results`);
      return results;
    } catch (error) {
      console.error('Error querying documents:', error);
      throw new AppError('Failed to query documents from ChromaDB', 500);
    }
  }

  // Helper method to delete documents
  public async deleteDocuments(ids: string[]): Promise<void> {
    try {
      const collection = this.getCollection();
      await collection.delete({ ids });
      console.log(`✅ Deleted ${ids.length} documents from ChromaDB`);
    } catch (error) {
      console.error('Error deleting documents:', error);
      throw new AppError('Failed to delete documents from ChromaDB', 500);
    }
  }

  // Helper method to get collection info
  public async getCollectionInfo(): Promise<any> {
    try {
      const collection = this.getCollection();
      const count = await collection.count();
      console.log(`✅ Collection contains ${count} documents`);
      return { count };
    } catch (error) {
      console.error('Error getting collection info:', error);
      throw new AppError('Failed to get collection info from ChromaDB', 500);
    }
  }
}

export default ChromaDB; 