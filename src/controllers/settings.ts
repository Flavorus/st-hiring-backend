import { Request, Response } from 'express';
import { SettingsDAL } from '../dal/settings.dal';
import { Settings, DEFAULT_SETTINGS } from '../entity/settings';

export const settingsController = ({ settingsDAL }: { settingsDAL: SettingsDAL }) => ({
  async getSettings(_req: Request, res: Response) {
    try {
      const settings = await settingsDAL.getSettings();
      if (Object.keys(settings).length === 0) {
        return res.status(200).json({});
      }
      return res.json(settings);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async postSettings(req: Request, res: Response) {
    try {
      const current = await settingsDAL.getSettings();
      const isCreating = Object.keys(current).length === 0;

      const merged = isCreating
        ? { ...DEFAULT_SETTINGS, ...req.body }
        : { ...current, ...req.body };

      const result = await settingsDAL.upsertSettings(merged as Settings);
      return res.status(isCreating ? 201 : 200).json(result);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
});
