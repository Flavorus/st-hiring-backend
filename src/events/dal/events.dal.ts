import { Knex } from 'knex';
import { Event } from '../entity/event';

export interface EventDAL {
  getEvents(limit: number): Promise<Event[]>;
}

export const createEventDAL = (knex: Knex): EventDAL => {
  return {
    async getEvents(limit): Promise<Event[]> {
      return await knex<Event>('events').select('*').limit(limit);
    },
  };
}
