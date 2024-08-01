import 'reflect-metadata';
import express from 'express';
import { knex } from 'knex';
const cors = require('cors');
import dbConfig  from './knexfile';
import { createEventDAL } from './events/dal/events.dal';
import { createTicketDAL } from './events/dal/tickets.dal';
import { createGetEventsController } from './events/controllers/get-events';
import { initializeRoutes, settingsRouter } from "./mobile-settings/routes";
import { connectToDatabase } from './mobile-settings/database/mongodb';

// initialize Knex
const Knex = knex(dbConfig.development);

// Initialize DALs
const eventDAL = createEventDAL(Knex);
const TicketDAL = createTicketDAL(Knex);

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: 'GET,PUT,POST',
  credentials: true,
}));

app.use(express.json()); // Para solicitudes con cuerpo JSON
app.use(express.urlencoded({ extended: true })); // Para solicitudes con cuerpo URL-encoded

app.use('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/events', createGetEventsController({ eventsDAL: eventDAL, ticketsDAL: TicketDAL }));


app.use('/settings', settingsRouter);

app.use('/', (_req, res) => {
  res.json({ message: 'Hello API' });
});

const startServer = async () => {
  try {
    await connectToDatabase();
    await initializeRoutes();
    app.listen(3000, () => {
      console.log(`Server is running`);
    });
  } catch (error) {
    console.error('Failed to start the server', error);
    process.exit(1);
  }
};

startServer();

