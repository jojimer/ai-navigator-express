import { Router } from 'express';
import { ChromaDB } from '../db/chroma';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const db = ChromaDB.getInstance();
    await db.healthCheck();
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'connected',
      environment: process.env.NODE_ENV
    };

    res.json(healthData);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Detailed health check with more metrics
router.get('/detailed', async (req, res) => {
  try {
    const db = ChromaDB.getInstance();
    await db.healthCheck();
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      database: 'connected',
      environment: process.env.NODE_ENV,
      nodeVersion: process.version,
      platform: process.platform,
      pid: process.pid
    };

    res.json(healthData);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export default router; 