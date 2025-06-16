import dotenv from 'dotenv';

// Load test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.JWT_SECRET = 'test-secret-key';
process.env.EXTENSION_ID = 'test-extension-id';
process.env.ALLOWED_ORIGINS = 'http://localhost:3000';
process.env.OPENROUTER_API_KEY = 'test-api-key';

// Load test environment variables from .env.test if it exists
dotenv.config({ path: '.env.test' });

// Global test timeout
jest.setTimeout(10000); 