import { Router } from 'express';
import { createGetEventsController } from '../controllers/get-events';
import { EventDAL } from '../dal/events.dal';
import { TicketsDAL } from '../dal/tickets.dal';

export interface EventsRouteDependencies {
  eventsDAL: EventDAL;
  ticketsDAL: TicketsDAL;
}

export const createEventsRoutes = ({
  eventsDAL,
  ticketsDAL,
}: EventsRouteDependencies): Router => {
  const router = Router();

  router.get('/', createGetEventsController({ eventsDAL, ticketsDAL }));

  return router;
};
