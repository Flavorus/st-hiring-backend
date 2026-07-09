import 'dotenv/config';
import type { Knex } from "knex";

const dbConfig: { [key: string]: Knex.Config } = {
  development: {
    client: "postgresql",
    connection: {
      host: process.env.DB_HOST ?? "localhost",
      ssl: false,
      port: Number(process.env.DB_PORT ?? 5432),
      user: process.env.DB_USER ?? "root",
      password: process.env.DB_PASSWORD ?? "example",
      database: process.env.DB_NAME ?? "seetickets",
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations",
      directory: "./database/migrations",
    },
    seeds: {
      directory: "./database/seeds",
    },
  },
};

module.exports = dbConfig;

export default dbConfig;
