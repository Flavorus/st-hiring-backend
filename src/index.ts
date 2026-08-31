import { startServer } from './server';

startServer().catch((error) => {
  console.error('Unable to start server', error);
  process.exit(1);
});
