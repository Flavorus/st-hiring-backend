import { Express } from 'express';
import { EventDAL } from '../dal/events.dal';
import { TicketsDAL } from '../dal/tickets.dal';
import { SettingsService } from '../services/settings.service';
import { createEventsRoutes } from './events.routes';
import { healthRoutes } from './health.routes';
import { rootRoutes } from './root.routes';
import { createSettingsRoutes } from './settings.routes';

export interface RouteDependencies {
  eventsDAL: EventDAL;
  ticketsDAL: TicketsDAL;
  settingsService: SettingsService;
}

export const registerRoutes = (app: Express, dependencies: RouteDependencies): void => {
  app.use('/health', healthRoutes);
  app.use('/events', createEventsRoutes(dependencies));
  app.use('/settings', createSettingsRoutes({ settingsService: dependencies.settingsService }));
  app.use('/', rootRoutes);
};
