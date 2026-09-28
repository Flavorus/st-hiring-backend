import { DEFAULT_SETTINGS } from '../entity/settings';
import { settingsController } from '../controllers/settings';
import { eventsController } from '../controllers/get-events';
import express from 'express';
import request from 'supertest';
import { setupRoutes } from '../routes';

function setupApp(getSettingsResult: any, upsertResult: any, dalError: Error | null = null) {
  const mockSettingsDAL = {
    getSettings: dalError ? jest.fn().mockRejectedValue(dalError) : jest.fn().mockResolvedValue(getSettingsResult),
    upsertSettings: dalError ? jest.fn().mockRejectedValue(dalError) : jest.fn().mockResolvedValue(upsertResult),
  };
  const mockEventDAL = { getEvents: jest.fn().mockResolvedValue({ events: [], total: 0 }) };
  const settings = settingsController({ settingsDAL: mockSettingsDAL as any });
  const events = eventsController({ eventsDAL: mockEventDAL as any });

  const app = express();
  app.use(express.json());
  setupRoutes(app, {
    eventsController: events,
    settingsController: settings,
  });
  return app;
}

describe('SettingsController', () => {
  const mockSettingsDAL = {
    getSettings: jest.fn(),
    upsertSettings: jest.fn(),
  };

  let controller: ReturnType<typeof settingsController>;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = settingsController({ settingsDAL: mockSettingsDAL as any });
  });

  describe('GET /settings', () => {
    it('returns 200 with settings when document exists', async () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      mockSettingsDAL.getSettings.mockResolvedValue({
        supportEmail: 'test@example.com',
        companyName: 'TestCo',
      });

      await controller.getSettings({} as any, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        supportEmail: 'test@example.com',
        companyName: 'TestCo',
      });
    });

    it('returns 200 with empty object when no document exists', async () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      mockSettingsDAL.getSettings.mockResolvedValue({});

      await controller.getSettings({} as any, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({});
    });
 
  });

  describe('POST /settings', () => {
    it('returns 201 with settings as-is when creating new document', async () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      mockSettingsDAL.getSettings.mockResolvedValue({});
      mockSettingsDAL.upsertSettings.mockResolvedValue({
        supportEmail: 'new@test.com',
        companyName: 'NewCo',
        maxTicketsPerEvent: 10000,
      });

      const req = {
        body: {
          supportEmail: 'new@test.com',
          companyName: 'NewCo',
          maxTicketsPerEvent: 10000,
        },
      };

      await controller.postSettings(req as any, mockRes);

      expect(mockSettingsDAL.upsertSettings).toHaveBeenCalledWith(
        expect.objectContaining({ supportEmail: 'new@test.com', companyName: 'NewCo' })
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('returns 200 with merged fields when updating existing document', async () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      mockSettingsDAL.getSettings.mockResolvedValue({
        supportEmail: 'old@test.com',
        companyName: 'OldCo',
      });
      mockSettingsDAL.upsertSettings.mockResolvedValue({
        supportEmail: 'new@test.com',
        companyName: 'OldCo',
      });

      const req = {
        body: {
          supportEmail: 'new@test.com',
        },
      };

      await controller.postSettings(req as any, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('merges defaults + body when creating new document', async () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      mockSettingsDAL.getSettings.mockResolvedValue({});

      const req = {
        body: {
          supportEmail: 'custom@email.com',
        },
      };

      await controller.postSettings(req as any, mockRes);

      expect(mockSettingsDAL.upsertSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          supportEmail: 'custom@email.com',
          companyName: DEFAULT_SETTINGS.companyName,
          maxTicketsPerEvent: DEFAULT_SETTINGS.maxTicketsPerEvent,
        })
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('merges existing + body when updating document', async () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      mockSettingsDAL.getSettings.mockResolvedValue({
        supportEmail: 'old@test.com',
        companyName: 'OldCo',
      });
      mockSettingsDAL.upsertSettings.mockResolvedValue({
        supportEmail: 'new@test.com',
        companyName: 'OldCo',
      });

      const req = {
        body: {
          supportEmail: 'new@test.com',
        },
      };

      await controller.postSettings(req as any, mockRes);

      expect(mockSettingsDAL.upsertSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          supportEmail: 'new@test.com',
          companyName: 'OldCo',
        })
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
    
  });
});

describe('SettingsController integration', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('GET /settings', () => {
    it('returns 200 with settings on success', async () => {
      const app = setupApp(
        { supportEmail: 'test@example.com', companyName: 'TestCo' },
        { supportEmail: 'test@example.com', companyName: 'TestCo' },
      );

      const res = await request(app).get('/settings');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ supportEmail: 'test@example.com', companyName: 'TestCo' });
    });

    it('returns 500 when DAL throws on GET', async () => {
      const dbError = new Error('Connection refused');
      const app = setupApp({}, {}, dbError);

      const res = await request(app).get('/settings');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Internal server error' });
      expect(consoleSpy).toHaveBeenCalledWith(dbError);
    });
  });

  describe('POST /settings', () => {
    it('returns 201 when creating new settings on success', async () => {
      const app = setupApp(
        {},
        { supportEmail: 'new@test.com', companyName: 'NewCo', maxTicketsPerEvent: 10000 },
      );

      const res = await request(app)
        .post('/settings')
        .send({ supportEmail: 'new@test.com', companyName: 'NewCo', maxTicketsPerEvent: 10000 });

      expect(res.status).toBe(201);
    });

    it('returns 200 when updating existing settings on success', async () => {
      const app = setupApp(
        { supportEmail: 'old@test.com', companyName: 'OldCo' },
        { supportEmail: 'new@test.com', companyName: 'OldCo' },
      );

      const res = await request(app)
        .post('/settings')
        .send({ supportEmail: 'new@test.com' });

      expect(res.status).toBe(200);
    });

    it('returns 500 when DAL throws on POST', async () => {
      const dbError = new Error('Connection refused');
      const app = setupApp({}, {}, dbError);

      const res = await request(app)
        .post('/settings')
        .send({ supportEmail: 'test@test.com' });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Internal server error' });
      expect(consoleSpy).toHaveBeenCalledWith(dbError);
    });
  });
});
