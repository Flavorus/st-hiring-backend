import { Request, Response } from 'express';
import { SettingsDAL } from "../dal/settings.dal";

export const createGetSettingsController =
    ({ settingsDAL }: { settingsDAL: SettingsDAL }) =>
        async (_req: Request, res: Response) => {
            try {
                const settings = await settingsDAL.getSettings();
                if (!settings) { 
                    res.status(404).json({ message: 'Settings not found' });
                    return;
                }
                res.status(200).json(settings);
            } catch (error) {
                console.error('Failed to retrieve settings:', error);

                res.status(500).json({
                    message: 'Unable to retrieve settings',
                });
            }
        };