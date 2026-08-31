import { Request, Response } from 'express';
import {
  SettingsService,
  SettingsValidationError,
} from '../services/settings.service';

export const createPostSettingsController = ({
  settingsService,
}: {
  settingsService: SettingsService;
}) => async (req: Request, res: Response) => {
  try {
    const result = await settingsService.upsertCurrentSettings(req.body);

    res.status(result.wasCreated ? 201 : 200).json(result.settings);
  } catch (error) {
    if (error instanceof SettingsValidationError) {
      res.status(400).json({ message: error.message });
      return;
    }

    res.status(500).json({ message: 'Internal server error' });
  }
};