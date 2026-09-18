import { z } from 'zod';

export const settingsUpsertSchema = z.strictObject({
  currency: z.string().trim().min(1),
  timezone: z.string().trim().min(1),
  maxTicketsPerOrder: z.number().int().positive(),
  salesEnabled: z.boolean(),
});
