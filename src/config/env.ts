import { z } from 'zod';

const envSchema = z.object({
  // Server Configuration
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  PORT: z.string().transform(Number),
  
  // Security Configuration
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRATION: z.string(),
  JWT_REFRESH_EXPIRATION: z.string(),
  EXTENSION_PUBLIC_KEY: z.string(),
  
  // CORS Configuration
  ALLOWED_ORIGINS: z.string(),
  
  // Database Configuration
  CHROMA_HOST: z.string(),
  CHROMA_PORT: z.string().transform(Number),
  CHROMA_COLLECTION_NAME: z.string(),
  
  // API Keys
  OPENROUTER_API_KEY: z.string(),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).optional(),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).optional(),
  AI_RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).optional(),
  TRAINING_RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).optional(),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).optional(),
  LOG_FORMAT: z.enum(['json', 'simple']).optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

export const validateEnv = (): EnvConfig => {
  try {
    return envSchema.parse(process.env);
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