import { z } from 'zod';

// Base schema without JWT fields
const baseSchema = z.object({
  // Server Configuration
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  PORT: z.string().transform(Number),
  
  // CORS Configuration
  ALLOWED_ORIGINS: z.string().optional().default('*'),
  
  // Database Configuration
  CHROMA_HOST: z.string().optional().default('localhost'),
  CHROMA_PORT: z.string().optional().default('8000').transform(Number),
  CHROMA_COLLECTION_NAME: z.string().optional().default('ai_ui_collection'),
  
  // API Keys
  OPENROUTER_API_KEY: z.string(),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().optional().default('900000').transform(Number),
  RATE_LIMIT_MAX_REQUESTS: z.string().optional().default('100').transform(Number),
  AI_RATE_LIMIT_MAX_REQUESTS: z.string().optional().default('50').transform(Number),
  TRAINING_RATE_LIMIT_MAX_REQUESTS: z.string().optional().default('20').transform(Number),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).optional().default('info'),
  LOG_FORMAT: z.enum(['json', 'simple']).optional().default('simple'),
});

// Production schema with JWT fields
const productionSchema = baseSchema.extend({
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRATION: z.string().default('30d'),
  JWT_REFRESH_EXPIRATION: z.string().default('60d'),
  EXTENSION_PUBLIC_KEY: z.string(),
});

export type EnvConfig = z.infer<typeof baseSchema> & {
  JWT_SECRET?: string;
  JWT_REFRESH_SECRET?: string;
  JWT_ACCESS_EXPIRATION?: string;
  JWT_REFRESH_EXPIRATION?: string;
  EXTENSION_PUBLIC_KEY?: string;
};

export const validateEnv = (): EnvConfig => {
  console.log('Current NODE_ENV:', process.env.NODE_ENV);
  const isDevelopment = process.env.NODE_ENV === 'development';
  console.log('Is development mode:', isDevelopment);

  try {
    if (isDevelopment) {
      // In development, only validate base schema
      return baseSchema.parse(process.env) as EnvConfig;
    } else {
      // In production/staging, validate with JWT fields
      return productionSchema.parse(process.env);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => err.path.join('.')).join(', ');
      console.error('Missing or invalid environment variables:', missingVars);
    } else {
      console.error('Error validating environment variables:', error);
    }
    process.exit(1);
  }
};