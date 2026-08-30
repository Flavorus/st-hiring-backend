import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { knex } from 'knex';
import { MongoClient } from 'mongodb';
import dbConfig from './knexfile';
import { createEventDAL } from './dal/events.dal';
import { createTicketDAL } from './dal/tickets.dal';
import { createGetEventsController } from './controllers/get-events';
import { createSettingsDAL, SettingsDocument } from './dal/settings.dal';
import { createGetSettingsController } from './controllers/get-settings';
import { createPostSettingsController } from './controllers/post-settings';

const knexClient = knex(dbConfig.development);
const mongoClient = new MongoClient(process.env.MONGO_URI ?? 'mongodb://root:example@localhost:27017');
const mongoDatabaseName = process.env.MONGO_DB_NAME ?? 'seetickets';

const eventDAL = createEventDAL(knexClient);
const ticketDAL = createTicketDAL(knexClient);

const app = express();

app.use(cors());
app.use(express.json());

app.use('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/events', createGetEventsController({ eventsDAL: eventDAL, ticketsDAL: ticketDAL }));

const startServer = async () => {
  await mongoClient.connect();
  const settingsCollection = mongoClient
    .db(mongoDatabaseName)
    .collection<SettingsDocument>('settings');

  const settingsDAL = createSettingsDAL(settingsCollection);

  app.get('/settings', createGetSettingsController({ settingsDAL }));
  app.post('/settings', createPostSettingsController({ settingsDAL }));

  app.use('/', (_req, res) => {
    res.json({ message: 'Hello API' });
  });

  const server = app.listen(3000, () => {
    console.log('Server Started');
  });

  const shutdown = async () => {
    await mongoClient.close();
    await knexClient.destroy();
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

startServer().catch((error) => {
  console.error('Unable to start server', error);
  process.exit(1);
});
