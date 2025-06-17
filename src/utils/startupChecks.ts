import { validateEnv } from '../config/env';
import { ChromaDB } from '../db/chroma';
import * as fs from 'fs';

export async function performStartupChecks() {
  try {
    console.log('Starting application checks...');

    // Validate environment variables
    console.log('Validating environment variables...');
    const env = validateEnv();
    console.log('Environment validation passed');

    // Check database connection
    console.log('Checking database connection...');
    const db = ChromaDB.getInstance();
    await db.initialize();
    console.log('Database connection successful');

    // Check required directories
    console.log('Checking required directories...');
    const requiredDirs = ['logs', 'data'];
    for (const dir of requiredDirs) {
      try {
        await fs.promises.access(dir);
      } catch {
        await fs.promises.mkdir(dir);
        console.log(`Created directory: ${dir}`);
      }
    }

    // Check system resources
    console.log('Checking system resources...');
    const memoryUsage = process.memoryUsage();
    if (memoryUsage.heapUsed > 1024 * 1024 * 1024) { // 1GB
      console.warn('High memory usage detected');
    }

    console.log('All startup checks passed successfully');
    return true;
  } catch (error) {
    console.error('Startup checks failed:', error);
    process.exit(1);
  }
} 