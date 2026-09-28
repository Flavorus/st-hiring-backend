import 'dotenv/config';

import { knex } from 'knex';
import dbConfig from './knexfile';
import { mongoClient } from './mongodb';
import { connectMongo } from './mongodb';
import { createEventDAL } from './dal/events.dal';
import { createSettingsDAL } from './dal/settings.dal';
import { setupRoutes } from './routes';
import { eventsController } from './controllers/get-events';
import { settingsController } from './controllers/settings';

export async function setupServer(app) {
  const Knex = knex(dbConfig.development);

  await connectMongo();
  const mongoDb = mongoClient.db();

  const eventDAL = createEventDAL(Knex);
  const settingsDAL = createSettingsDAL(mongoDb);

  const settings = settingsController({ settingsDAL });
  const events = eventsController({eventsDAL: eventDAL})

  setupRoutes(app, { eventsController: events, settingsController: settings });

  app.listen(3000, () => {
    console.log('Server Started');
  });
}
