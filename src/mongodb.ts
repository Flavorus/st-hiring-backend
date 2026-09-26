import 'dotenv/config';
import { MongoClient, MongoServerError } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI is not defined in environment variables');
  process.exit(1);
}

export const mongoClient = new MongoClient(MONGO_URI);

export async function connectMongo() {
  try {
    await mongoClient.connect();
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    if (error instanceof MongoServerError) {
      console.error('Database error:', error.message);
    }
  }
}
