import { Request, Response } from 'express';
import { SettingsDto } from '../dtos/SettingsDto';
import { ISettingsService } from '../interfaces/ISettingsService';
import { inject, injectable } from 'inversify';

@injectable()
export class SettingsController {
  constructor(@inject('ISettingsService') private settingsService: ISettingsService) {}

  public async createSettings(req: Request, res: Response): Promise<void> {
    const settingDto: SettingsDto = req.body;
    try {
      const settings = await this.settingsService.createSettings(settingDto);
      res.status(201).json(settings);
    } catch (error) {
      console.error('Failed to create setting', error);
      res.status(500).send('Internal Server Error');
    }
  }

  public async getAll(_req: Request, res: Response) {
    try {
      const settings = await this.settingsService.getAll();
      res.status(200).json(settings);
    } catch (error) {
      if (error.message === 'Settings not found') {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  }

  public async getSettingsByClientId(req: Request, res: Response) {
    const clientId = Number(req.params.clientId);
    try {
      const settings = await this.settingsService.getSettingsByClientId(clientId);
      res.status(200).json(settings);
    } catch (error) {
      if (error.message === `Settings not found for ${clientId}`) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  }

  public async updateSettings(req: Request, res: Response) {
    try {
      const clientId = req.body.clientId;
      const newSettings = await this.settingsService.update(clientId, req.body);
      res.status(200).json(newSettings);
    } catch (error) {
      if (error.message === 'User not found') {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  }
}
