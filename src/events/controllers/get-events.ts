import { EventDAL } from "../dal/events.dal";
import { Request, Response } from "express";
import { TicketsDAL } from "../dal/tickets.dal";

export const createGetEventsController = ({
  eventsDAL,
  ticketsDAL,
}: {
  eventsDAL: EventDAL;
  ticketsDAL: TicketsDAL
}) => async (_req: Request, res: Response) => {
  const events = await eventsDAL.getEvents(50);
  //add the available tickets to the response for each event
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const tickets = await ticketsDAL.getTicketsByEvent(event.id);
    events[i].availableTickets = tickets.filter(ticket => ticket.status === 'available');
  }
  res.setHeader('Cache-Control', 'no-store');
  res.json(events);
};
