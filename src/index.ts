import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { knex } from 'knex';
import { MongoClient } from 'mongodb';
import dbConfig from './knexfile';
import { createEventDAL } from './dal/events.dal';
import { createTicketDAL } from './dal/tickets.dal';
import { createGetEventsController } from './controllers/get-events';
import { createGetSettingsController } from './controllers/get-settings';
import { createPostSettingsController } from './controllers/post-settings';
import { createSettingsDAL } from './dal/settings.dal';

const Knex = knex(dbConfig.development);

const eventDAL = createEventDAL(Knex);
const TicketDAL = createTicketDAL(Knex);

const app = express();

app.use(cors());
app.use(express.json());

app.use('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/events', createGetEventsController({ eventsDAL: eventDAL, ticketsDAL: TicketDAL }));

const start = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is required');
  }

  const mongoClient = new MongoClient(mongoUri);
  await mongoClient.connect();
  const db = mongoClient.db('seetickets');

  const settingsDAL = createSettingsDAL(db);
  const getSettingsController = createGetSettingsController({ settingsDAL });
  const postSettingsController = createPostSettingsController({ settingsDAL });
  app.get('/settings', getSettingsController);
  app.post('/settings', postSettingsController);

  app.use('/', (_req, res) => {
    res.json({ message: 'Hello API' });
  });

  app.listen(3000, () => {
    console.log('Server Started');
  });

  return { mongoClient, db };
};

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
