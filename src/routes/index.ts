import { Express } from 'express';
import { validateSettings } from '../middleware/validateSettings';
import { asyncHandler } from '../middleware/asyncHandler';
import { type EventsController } from '../controllers/get-events';
import { type SettingsController } from '../controllers/settings';

export const setupRoutes = (
  app: Express,
  { eventsController, settingsController }: { eventsController: EventsController; settingsController: SettingsController }
) => {

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/', (_req, res) => {
    res.json({ message: 'Hello API' });
  });

  app.get('/events', asyncHandler(eventsController.getEvents));
  app.get('/settings', asyncHandler(settingsController.getSettings));
  app.post('/settings', validateSettings, asyncHandler(settingsController.postSettings));
  // todo implement ticket routes
  app.get('/tickets/:eventId', ()=>{} ); 
  // global error handler to avoid adding try/catch in every controller method
  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });
};
