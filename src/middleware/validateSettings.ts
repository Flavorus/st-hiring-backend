import { Request, Response, NextFunction } from 'express';

const KNOWN_FIELDS = new Set([
  'supportEmail',
  'companyName',
  'maxTicketsPerEvent',
]);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateSettings = (req: Request, res: Response, next: NextFunction): void => {
  const body = req.body;

  if (body == null || typeof body !== 'object' || Array.isArray(body)) {
    res.status(400).json({ error: 'Request body must be an object' });
    return;
  }

  if (Object.keys(body).length === 0) {
    res.status(400).json({ error: 'At least one settings field is required' });
    return;
  }

  for (const key of Object.keys(body)) {
    if (!KNOWN_FIELDS.has(key)) {
      res.status(400).json({ error: `Unknown field: ${key}` });
      return;
    }
  }

  if ('supportEmail' in body) {
    if (typeof body.supportEmail !== 'string' || !EMAIL_REGEX.test(body.supportEmail)) {
      res.status(400).json({ error: 'supportEmail must be a valid email address' });
      return;
    }
  }

  if ('companyName' in body) {
    if (typeof body.companyName !== 'string') {
      res.status(400).json({ error: 'companyName must be a string' });
      return;
    }
  }

  if ('maxTicketsPerEvent' in body) {
    const val = body.maxTicketsPerEvent;
    if (!Number.isInteger(val) || val <= 0) {
      res.status(400).json({ error: 'maxTicketsPerEvent must be a positive integer' });
      return;
    }
  }

  next();
};
