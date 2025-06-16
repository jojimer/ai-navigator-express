import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI UI Backend API',
      version: '1.0.0',
      description: 'API documentation for the AI UI Backend',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        extensionId: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Extension-ID',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
        extensionId: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options); 