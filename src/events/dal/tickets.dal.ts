import { Knex } from 'knex';
import { Ticket } from '../entity/ticket';

export interface TicketsDAL {
  getTicketsByEvent(eventId: number): Promise<Ticket[]>;
}

export const createTicketDAL = (knex: Knex): TicketsDAL => {
  return {
    async getTicketsByEvent(eventId): Promise<Ticket[]> {
      return await knex<Ticket>('tickets').select('*').where('event_id', eventId);
    },
  };
}
