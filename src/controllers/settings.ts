import { Request, Response } from 'express';
import { SettingsDAL } from '../dal/settings.dal';
import { Settings, DEFAULT_SETTINGS } from '../entity/settings';

export const settingsController = ({ settingsDAL }: { settingsDAL: SettingsDAL }) => ({
  async getSettings(_req: Request, res: Response) {
    const settings = await settingsDAL.getSettings();
    if (Object.keys(settings).length === 0) {
      return res.status(200).json({});
    }
    return res.json(settings);
  },

  async postSettings(req: Request, res: Response) {
    const current = await settingsDAL.getSettings();
    const isCreating = Object.keys(current).length === 0;

    const merged = isCreating
      ? { ...DEFAULT_SETTINGS, ...req.body }
      : { ...current, ...req.body };

    const result = await settingsDAL.upsertSettings(merged as Settings);
    return res.status(isCreating ? 201 : 200).json(result);
   
  },
});
