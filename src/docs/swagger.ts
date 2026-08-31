import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'ST Hiring Backend API',
    version: '1.0.0',
    description: 'API documentation for health, events, and settings endpoints.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
    },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        responses: {
          '200': {
            description: 'API is healthy',
          },
        },
      },
    },
    '/events': {
      get: {
        summary: 'List events with available tickets',
        responses: {
          '200': {
            description: 'Events list',
          },
        },
      },
    },
    '/settings': {
      get: {
        summary: 'Get current settings',
        responses: {
          '200': {
            description: 'Current settings document',
          },
          '404': {
            description: 'Settings not found',
          },
        },
      },
      post: {
        summary: 'Create or update settings',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: [
                  'salesEnabled',
                  'defaultCurrency',
                  'supportEmail',
                  'ticketHoldMinutes',
                ],
                properties: {
                  salesEnabled: { type: 'boolean' },
                  defaultCurrency: { type: 'string', example: 'USD' },
                  supportEmail: { type: 'string', example: 'support@example.com' },
                  ticketHoldMinutes: { type: 'integer', minimum: 1, example: 15 },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Settings updated',
          },
          '201': {
            description: 'Settings created',
          },
          '400': {
            description: 'Validation error',
          },
        },
      },
    },
  },
};

export const setupSwagger = (app: Express): void => {
  app.use('/docs', ...swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.get('/docs.json', (_req, res) => {
    res.json(openApiDocument);
  });
};
