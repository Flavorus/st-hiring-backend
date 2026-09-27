import { Knex } from 'knex';
import { Event } from '../entity/event';

export interface EventDAL {
  getEvents(limit: number): Promise<Event[]>;
}

export const createEventDAL = (knex: Knex): EventDAL => {
  return {
    async getEvents(limit): Promise<Event[]> {
      return await knex<Event>('events as e')
      .select(
        'e.id',
        'e.name',
        'e.description',
        'e.location',
        'e.date',
        knex.raw('COUNT(t.id) as "availableTickets"'),
       'e.created_at as createdAt',
       'e.updated_at as updatedAt'
      )
      .leftJoin('tickets as t', 't.event_id', 'e.id')
      .where('t.status', 'available')
      .groupBy('e.id')
      .orderBy('e.date', 'desc')
      .limit(limit);
    },
  };
}
