import { Server } from 'http';
import { knex } from 'knex';
import { MongoClient } from 'mongodb';
import dbConfig from './knexfile';
import { appConfig } from './config/app.config';
import { createApp } from './app';
import { createEventDAL } from './dal/events.dal';
import { createSettingsDAL, SettingsDocument } from './dal/settings.dal';
import { createTicketDAL } from './dal/tickets.dal';
import { createSettingsService } from './services/settings.service';

interface ServerResources {
  mongoClient: MongoClient;
  knexClient: ReturnType<typeof knex>;
  server: Server;
}

const buildServerResources = async (): Promise<ServerResources> => {
  const knexClient = knex(dbConfig.development);
  const mongoClient = new MongoClient(appConfig.mongoUri);

  await mongoClient.connect();

  const settingsCollection = mongoClient
    .db(appConfig.mongoDatabaseName)
    .collection<SettingsDocument>('settings');

  const app = createApp({
    eventsDAL: createEventDAL(knexClient),
    ticketsDAL: createTicketDAL(knexClient),
    settingsService: createSettingsService({ settingsDAL: createSettingsDAL(settingsCollection) }),
  });

  const server = app.listen(appConfig.port, () => {
    console.log(`Server started on port ${appConfig.port}`);
    console.log(`Swagger docs available at http://localhost:${appConfig.port}/docs`);
  });

  return { mongoClient, knexClient, server };
};

const registerGracefulShutdown = ({ mongoClient, knexClient, server }: ServerResources): void => {
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

export const startServer = async (): Promise<void> => {
  const resources = await buildServerResources();
  registerGracefulShutdown(resources);
};
