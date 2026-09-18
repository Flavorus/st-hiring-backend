import { z } from 'zod';
import { Request, Response } from 'express';
import { SettingsDAL } from '../dal/settings.dal';
import { settingsUpsertSchema } from '../validators/settings.validator';

export const createPostSettingsController =
  ({ settingsDAL }: { settingsDAL: SettingsDAL }) =>
    async (req: Request, res: Response): Promise<void> => {
      const validation = settingsUpsertSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          message: 'Invalid settings',
          errors: z.flattenError(validation.error),
        });
        return;
      }

      try {
        const result = await settingsDAL.upsertSettings(validation.data);

        res
          .status(result.created ? 201 : 200)
          .json(result.settings);
      } catch (error) {
        console.error('Failed to save settings:', error);
        res.status(500).json({
          message: 'Unable to save settings',
        });
      }
    };