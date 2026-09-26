import 'dotenv/config';

import { knex } from 'knex';
import dbConfig from './knexfile';
import { mongoClient } from './mongodb';
import { connectMongo } from './mongodb';
import { createEventDAL } from './dal/events.dal';
import { createTicketDAL } from './dal/tickets.dal';
import { createSettingsDAL } from './dal/settings.dal';
import { setupRoutes } from './routes';

export async function setupServer(app) {
  const Knex = knex(dbConfig.development);

  await connectMongo();
  const mongoDb = mongoClient.db();

  const eventDAL = createEventDAL(Knex);
  const ticketDAL = createTicketDAL(Knex);
  const settingsDAL = createSettingsDAL(mongoDb);

  setupRoutes(app, { eventDAL, ticketDAL, settingsDAL });

  app.listen(3000, () => {
    console.log('Server Started');
  });
}
