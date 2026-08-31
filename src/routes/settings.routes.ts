import { Router } from 'express';
import { createGetSettingsController } from '../controllers/get-settings';
import { createPostSettingsController } from '../controllers/post-settings';
import { SettingsService } from '../services/settings.service';

export interface SettingsRouteDependencies {
  settingsService: SettingsService;
}

export const createSettingsRoutes = ({ settingsService }: SettingsRouteDependencies): Router => {
  const router = Router();

  router.get('/', createGetSettingsController({ settingsService }));
  router.post('/', createPostSettingsController({ settingsService }));

  return router;
};
