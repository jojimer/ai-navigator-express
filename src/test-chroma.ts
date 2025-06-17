import { ChromaClient } from 'chromadb';
import { DefaultEmbeddingFunction } from 'chromadb-default-embed';

async function testChroma() {
  try {
    console.log('Initializing ChromaDB test...');
    const client = new ChromaClient({
      path: 'http://127.0.0.1:8000',  // Using explicit IPv4 address
      fetchOptions: {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    });

    // Initialize the embedding function
    const embeddingFunction = new DefaultEmbeddingFunction();

    // Test basic connection
    console.log('Testing ChromaDB connection...');
    await client.heartbeat();
    console.log('✅ Connection successful!');

    // Test collection creation
    console.log('\nTesting collection creation...');
    const collection = await client.getOrCreateCollection({
      name: 'test_collection',
      metadata: {
        description: 'Test collection'
      },
      embeddingFunction: embeddingFunction
    });
    console.log('✅ Collection created successfully!');

    // Test adding a document
    console.log('\nTesting document addition...');
    await collection.add({
      ids: ['test1'],
      documents: ['This is a test document'],
      metadatas: [{ category: 'test', timestamp: Date.now() }]
    });
    console.log('✅ Document added successfully!');

    // Test querying
    console.log('\nTesting query...');
    const results = await collection.query({
      queryTexts: ['test'],
      nResults: 1
    });
    console.log('✅ Query successful!');
    console.log('Query results:', results);

    console.log('\n🎉 All ChromaDB tests passed successfully!');
  } catch (error) {
    console.error('\n❌ Error during ChromaDB test:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
}

// Run the test
testChroma(); 