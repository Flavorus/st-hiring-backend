import express from 'express';
import request from 'supertest';
import { errorHandler } from '../middleware/errorHandler';

describe('errorHandler middleware', () => {
  let app: ReturnType<typeof express>;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    app = express();
    app.use(errorHandler);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('returns 500 status code when next(err) is called', async () => {
    app = express();
    app.use((_req, _res, next) => {
      next(new Error('test error'));
    });
    app.use(errorHandler);

    const res = await request(app).get('/');

    expect(res.status).toBe(500);
  });


  it('logs the error to console.error', async () => {
    const testError = new Error('test error');
    app = express();
    app.use((_req, _res, next) => {
      next(testError);
    });
    app.use(errorHandler);

    await request(app).get('/');

    expect(consoleSpy).toHaveBeenCalledWith(testError);
  });

  it('works with next(err) pattern', async () => {
    const testError = new Error('test error');
    app = express();
    app.use((_req, _res, next) => {
      next(testError);
    });
    app.use(errorHandler);

    const res = await request(app).get('/');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Internal server error' });
    expect(consoleSpy).toHaveBeenCalledWith(testError);
  });

});
