import { Express } from 'express';
import express from 'express';
import healthRoutes from '../../routes/health';
import { createTestRequest } from '../helpers/testHelper';

describe('Health Routes', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use('/health', healthRoutes);
  });

  describe('GET /health', () => {
    it('should return 200 and health status', async () => {
      const response = await createTestRequest(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        message: 'Server is healthy',
        timestamp: expect.any(String)
      });
    });
  });
}); 