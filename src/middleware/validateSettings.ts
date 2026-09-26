import { Request, Response, NextFunction } from 'express';

const KNOWN_FIELDS = new Set([
  'supportEmail',
  'companyName',
  'enableNotifications',
  'maxTicketsPerOrder',
  'maxTicketsPerEvent',
  'defaultTicketPrice',
  'enableWaitlist',
  'enableReviews',
  'enableRefunds',
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

  if ('enableNotifications' in body || 'enableWaitlist' in body || 'enableReviews' in body || 'enableRefunds' in body) {
    if ('enableNotifications' in body && typeof body.enableNotifications !== 'boolean') {
      res.status(400).json({ error: 'enableNotifications must be a boolean' });
      return;
    }
    if ('enableWaitlist' in body && typeof body.enableWaitlist !== 'boolean') {
      res.status(400).json({ error: 'enableWaitlist must be a boolean' });
      return;
    }
    if ('enableReviews' in body && typeof body.enableReviews !== 'boolean') {
      res.status(400).json({ error: 'enableReviews must be a boolean' });
      return;
    }
    if ('enableRefunds' in body && typeof body.enableRefunds !== 'boolean') {
      res.status(400).json({ error: 'enableRefunds must be a boolean' });
      return;
    }
  }

  if ('maxTicketsPerOrder' in body) {
    const val = body.maxTicketsPerOrder;
    if (!Number.isInteger(val) || val < 1 || val > 1000) {
      res.status(400).json({ error: 'maxTicketsPerOrder must be an integer between 1 and 1000' });
      return;
    }
  }

  if ('maxTicketsPerEvent' in body) {
    const val = body.maxTicketsPerEvent;
    if (!Number.isInteger(val) || val < 1 || val > 1000000) {
      res.status(400).json({ error: 'maxTicketsPerEvent must be an integer between 1 and 1000000' });
      return;
    }
  }

  if ('defaultTicketPrice' in body) {
    const val = body.defaultTicketPrice;
    if (!Number.isInteger(val) || val < 0 || val > 100000) {
      res.status(400).json({ error: 'defaultTicketPrice must be an integer between 0 and 100000' });
      return;
    }
  }

  next();
};
