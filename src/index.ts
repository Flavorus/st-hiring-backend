import express from 'express';
import cors from 'cors';

import { setupServer } from './server';

const app = express();

app.use(cors());
app.use(express.json());

setupServer(app);
