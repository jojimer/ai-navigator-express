import { Express } from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';

export const generateTestToken = (extensionId: string = 'test-extension-id'): string => {
  return jwt.sign(
    {
      id: 'test-id',
      extensionId,
      role: 'extension'
    },
    process.env.JWT_SECRET || 'test-secret-key',
    { expiresIn: '1h' }
  );
};

export const createTestRequest = (app: Express) => {
  return request(app);
};

export const createAuthenticatedRequest = (app: Express, extensionId?: string) => {
  const token = generateTestToken(extensionId);
  return request(app)
    .set('Authorization', `Bearer ${token}`)
    .set('X-Extension-ID', extensionId || 'test-extension-id');
};

export const expectErrorResponse = (response: request.Response, statusCode: number, message: string) => {
  expect(response.status).toBe(statusCode);
  expect(response.body).toHaveProperty('status', 'error');
  expect(response.body).toHaveProperty('message', message);
};

export const expectSuccessResponse = (response: request.Response, statusCode: number) => {
  expect(response.status).toBe(statusCode);
  expect(response.body).toHaveProperty('status', 'success');
}; 