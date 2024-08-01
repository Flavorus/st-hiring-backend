import { Router } from 'express';
import { container } from './inversify.config';
import { SettingsController } from './controllers/SettingsController';
import { SettingsDto } from './dtos/SettingsDto';
import { validateDto } from './middleware/SettingsValidationMiddleware';

const settingsRouter = Router();

const initializeRoutes = async () => {
  const settingsController = await container.getAsync<SettingsController>(SettingsController);

  settingsRouter.post('/', validateDto(SettingsDto), (req, res) => { 
    settingsController.createSettings(req, res)
  });
  settingsRouter.get('/:clientId', (req, res) => { 
    settingsController.getSettingsByClientId(req, res)
  });
  settingsRouter.get('/', (req, res) => { 
    settingsController.getAll(req, res)
  });
  settingsRouter.put('/', validateDto(SettingsDto), (req, res) => { 
    settingsController.updateSettings(req, res)
  });
};

export { settingsRouter, initializeRoutes };
