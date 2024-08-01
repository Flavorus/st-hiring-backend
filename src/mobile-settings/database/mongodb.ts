import { Db, MongoClient } from 'mongodb';

const url = 'mongodb://root:example@localhost:27017/';
const dbName = 'settings';

let db: MongoClient;

export const connectToDatabase = async (): Promise<Db> => {
  if (!db) {
    try {
      const client = new MongoClient(url);
      await client.connect();
      db = client;
      console.log(`Connected to database ${dbName}`);
    } catch (error) {
      console.error('Failed to connect to the database', error);
      throw error;
    }
  }
  return db.db(dbName);
};