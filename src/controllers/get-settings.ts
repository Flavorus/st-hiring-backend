import { Request, Response } from 'express';
import { SettingsService } from '../services/settings.service';

export const createGetSettingsController = ({
  settingsService,
}: {
  settingsService: SettingsService;
}) => async (_req: Request, res: Response) => {
  try {
    const settings = await settingsService.getCurrentSettings();

    if (!settings) {
      res.status(404).json({ message: 'Settings not found' });
      return;
    }

    res.json(settings);
  } catch (_error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};