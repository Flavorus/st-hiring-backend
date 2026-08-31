import 'dotenv/config';

export const appConfig = {
  port: Number(process.env.PORT ?? 3000),
  mongoUri: process.env.MONGO_URI ?? 'mongodb://root:example@localhost:27017',
  mongoDatabaseName: process.env.MONGO_DB_NAME ?? 'seetickets',
} as const;
