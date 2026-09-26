import { Express } from 'express';
import { EventDAL } from '../dal/events.dal';
import { TicketsDAL } from '../dal/tickets.dal';
import { SettingsDAL } from '../dal/settings.dal';
import { createGetEventsController } from '../controllers/get-events';
import { settingsController } from '../controllers/settings';
import { validateSettings } from '../middleware/validateSettings';
import { asyncHandler } from '../middleware/asyncHandler'

export const setupRoutes = (
  app: Express,
  { eventDAL, ticketDAL, settingsDAL }: { eventDAL: EventDAL; ticketDAL: TicketsDAL; settingsDAL: SettingsDAL }
) => {
  const settings = settingsController({ settingsDAL });

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/', (_req, res) => {
    res.json({ message: 'Hello API' });
  });

  app.use('/events', asyncHandler(createGetEventsController({ eventsDAL: eventDAL, ticketsDAL: ticketDAL })));
  app.get('/settings', asyncHandler(settings.getSettings));
  app.post('/settings', validateSettings, asyncHandler(settings.postSettings));

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });
};
