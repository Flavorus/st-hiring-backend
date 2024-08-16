import express from 'express';
import { knex } from 'knex';
import dbConfig  from './knexfile';
import { createEventDAL } from './dal/events.dal';
import { createTicketDAL } from './dal/tickets.dal';
import { createGetEventsController } from './controllers/get-events';
import mongoose from 'mongoose'; 
import { createSettingsController } from './controllers/controller';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(`mongodb://localhost:27017/${process.env.DB_NAME}`)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// initialize Knex
const Knex = knex(dbConfig.development);

// Initialize DALs
const eventDAL = createEventDAL(Knex);
const TicketDAL = createTicketDAL(Knex);


const app = express();

app.use('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/events', createGetEventsController({ eventsDAL: eventDAL, ticketsDAL: TicketDAL }));

app.use('/', (_req, res) => {
  res.json({ message: 'Hello API' });
});

app.listen(3000, () => {
  console.log('Server Started')
});

app.use('/settings', createSettingsController());
