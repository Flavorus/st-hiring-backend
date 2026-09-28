import { Knex } from 'knex';
import { Event } from '../entity/event';

export interface EventDAL {
  getEvents(limit: number, offset: number): Promise<{ events: Event[]; total: number }>;
}

export const createEventDAL = (knex: Knex): EventDAL => {
  return {
    async getEvents(limit, offset): Promise<{ events: Event[]; total: number }> {
     const totalEvents = await knex('events as e')
      .leftJoin('tickets as t', 't.event_id', 'e.id')
      .where('t.status', 'available')
      .countDistinct('e.id as total')
      .first();

      const totalEventsCount = totalEvents?.total || 0;
      const total = parseInt(String(totalEventsCount), 10);

      const events = await knex<Event>('events as e')
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
        .offset(offset)
        .limit(limit);

      return { events, total };
    },
  };
}
