import { Router } from 'express';

export const rootRoutes = Router();

rootRoutes.get('/', (_req, res) => {
  res.json({ message: 'Hello API' });
});
