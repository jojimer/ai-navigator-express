import express, { Express } from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import healthRoutes from './routes/health';
import trainingRoutes from './routes/training';
import aiRoutes from './routes/ai';
import extensionRoutes from './routes/extension';
import authRoutes from './routes/auth';
import { errorHandler } from './middleware/errorHandler';
import { corsOptions, securityHeaders } from './middleware/security';
import { apiLimiter, aiEndpointLimiter, trainingDataLimiter } from './middleware/rateLimiter';
import { requestLogger } from './middleware/requestLogger';
import { swaggerSpec } from './config/swagger';
import { ChromaDB } from './db/chroma';
import { WebSocketService } from './services/websocketService';
import { performStartupChecks } from './utils/startupChecks';

// Load environment variables
dotenv.config();

async function startServer() {
  try {
    // Perform startup checks
    await performStartupChecks();

    const app: Express = express();
    const httpServer = createServer(app);
    const port = process.env.PORT || 3000;

    // Initialize WebSocket
    WebSocketService.getInstance(httpServer);

    // Initialize ChromaDB
    const db = ChromaDB.getInstance();
    await db.initialize();

    // Security middleware
    app.use(securityHeaders);
    app.use(corsOptions);
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Request logging
    app.use(requestLogger);

    // Rate limiting
    app.use(apiLimiter);
    app.use('/api/ai', aiEndpointLimiter);
    app.use('/api/training', trainingDataLimiter);

    // API Documentation
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Routes
    app.use('/health', healthRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/training', trainingRoutes);
    app.use('/api/ai', aiRoutes);
    app.use('/api/extension', extensionRoutes);

    // Error handling
    app.use(errorHandler);

    // Start server
    httpServer.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`API Documentation available at http://localhost:${port}/api-docs`);
      console.log(`Health check available at http://localhost:${port}/health`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 