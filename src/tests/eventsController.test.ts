import express from 'express';
import request from 'supertest';
import { eventsController } from '../controllers/get-events';
import { setupRoutes } from '../routes';

describe('eventsController integration', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('GET /events', () => {
    it('returns 500 and logs error when DAL throws a DB error', async () => {
      const dbError = new Error('Connection refused');
      const mockEventDAL = {
        getEvents: jest.fn().mockRejectedValue(dbError),
      };

      const controller = eventsController({ eventsDAL: mockEventDAL as any });
      const settings = {
        getSettings: async () => ({}),
        postSettings: async () => ({}),
      };

      const app = express();
      setupRoutes(app, {
        eventsController: controller,
        settingsController: settings as any,
      });

      const res = await request(app).get('/events');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Internal server error' });
      expect(consoleSpy).toHaveBeenCalledWith(dbError);
      expect(mockEventDAL.getEvents).toHaveBeenCalledWith(50, 0);
    });

    it('returns 500 with query params passed through', async () => {
      const dbError = new Error('timeout');
      const mockEventDAL = {
        getEvents: jest.fn().mockRejectedValue(dbError),
      };

      const controller = eventsController({ eventsDAL: mockEventDAL as any });
      const settings = {
        getSettings: async () => ({}),
        postSettings: async () => ({}),
      };

      const app = express();
      setupRoutes(app, {
        eventsController: controller,
        settingsController: settings as any,
      });

      const res = await request(app).get('/events?limit=20&offset=10');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Internal server error' });
      expect(consoleSpy).toHaveBeenCalledWith(dbError);
      expect(mockEventDAL.getEvents).toHaveBeenCalledWith(20, 10);
    });

    it('returns 200 with events from DAL using query params', async () => {
      const mockEventDAL = {
        getEvents: jest.fn().mockResolvedValue({ events: [], total: 0 }),
      };
      const settings = {
        getSettings: async () => ({}),
        postSettings: async () => ({}),
      };

      const controller = eventsController({ eventsDAL: mockEventDAL as any });

      const app = express();
      setupRoutes(app, {
        eventsController: controller,
        settingsController: settings as any,
      });

      const res = await request(app).get('/events?limit=20&offset=10');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ events: [], total: 0 });
      expect(mockEventDAL.getEvents).toHaveBeenCalledWith(20, 10);
    });
  });
});
