import express, { Express } from 'express';
import cors from 'cors';
import { setupSwagger } from './docs/swagger';
import { registerRoutes, RouteDependencies } from './routes';

export const createApp = (dependencies: RouteDependencies): Express => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  setupSwagger(app);
  registerRoutes(app, dependencies);

  return app;
};
