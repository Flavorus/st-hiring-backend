import { createSettingsDAL } from '../dal/settings.dal';
import { DEFAULT_SETTINGS } from '../entity/settings';
import { validateSettings } from '../middleware/validateSettings';
import { settingsController } from '../controllers/settings';

const mockCollection = {
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
};

const mockDb = {
  collection: jest.fn(() => mockCollection),
};

describe('SettingsDAL', () => {
  let settingsDAL: ReturnType<typeof createSettingsDAL>;

  beforeEach(() => {
    jest.clearAllMocks();
    settingsDAL = createSettingsDAL(mockDb as any);
  });

  describe('getSettings', () => {
    it('returns settings from DB when document exists', async () => {
      mockCollection.findOne.mockResolvedValue({
        _id: 'settings',
        supportEmail: 'test@test.com',
        companyName: 'TestCo',
      });

      const result = await settingsDAL.getSettings();

      expect(result).toEqual({
        supportEmail: 'test@test.com',
        companyName: 'TestCo',
      });
    });

    it('returns empty object when no document exists', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const result = await settingsDAL.getSettings();

      expect(result).toEqual({});
    });
  });

  describe('upsertSettings', () => {
    it('creates new document when none exists', async () => {
      const input = {
        supportEmail: 'new@test.com',
        companyName: 'NewCo',
        enableNotifications: true,
        maxTicketsPerOrder: 5,
        maxTicketsPerEvent: 500,
        defaultTicketPrice: 25,
        enableWaitlist: true,
        enableReviews: false,
        enableRefunds: true,
      };

      mockCollection.findOneAndUpdate.mockResolvedValue({
        _id: 'settings',
        ...input,
      });

      const result = await settingsDAL.upsertSettings(input as any);

      expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'settings' },
        { $set: expect.objectContaining({ supportEmail: 'new@test.com', companyName: 'NewCo' }) },
        { upsert: true, returnDocument: 'after' }
      );
      expect(result).toEqual(expect.objectContaining({ supportEmail: 'new@test.com' }));
    });

    it('updates existing document with partial data', async () => {
      const partialUpdate = {
        supportEmail: 'updated@test.com',
        maxTicketsPerOrder: 20,
      };

      mockCollection.findOneAndUpdate.mockResolvedValue({
        _id: 'settings',
        ...partialUpdate,
      });

      const result = await settingsDAL.upsertSettings(partialUpdate as any);

      expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'settings' },
        { $set: expect.objectContaining({ supportEmail: 'updated@test.com', maxTicketsPerOrder: 20 }) },
        { upsert: true, returnDocument: 'after' }
      );
      expect(result.supportEmail).toBe('updated@test.com');
      expect(result.maxTicketsPerOrder).toBe(20);
    });
  });
});

describe('validateSettings middleware', () => {
  function mockReq(body: unknown) {
    return { body } as any;
  }

  function mockRes() {
    return {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;
  }

  function mockNext() {
    return jest.fn() as any;
  }

  it('returns 400 for null body', () => {
    const req = mockReq(null);
    const res = mockRes();
    const next = mockNext();

    validateSettings(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
  });

  it('returns 400 for empty object body', () => {
    const req = mockReq({});
    const res = mockRes();
    const next = mockNext();

    validateSettings(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
  });

  it('returns 400 for unknown fields', () => {
    const req = mockReq({ unknownField: 'value' });
    const res = mockRes();
    const next = mockNext();

    validateSettings(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('Unknown field') }));
  });

  it('returns 400 for invalid email format', () => {
    const req = mockReq({ supportEmail: 'not-an-email' });
    const res = mockRes();
    const next = mockNext();

    validateSettings(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 for negative numbers in numeric fields', () => {
    const req = mockReq({ maxTicketsPerOrder: -1 });
    const res = mockRes();
    const next = mockNext();

    validateSettings(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 for out-of-range values', () => {
    const req = mockReq({ maxTicketsPerOrder: 2000 });
    const res = mockRes();
    const next = mockNext();

    validateSettings(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when enableNotifications is not a boolean', () => {
    const req = mockReq({ enableNotifications: 'yes' });
    const res = mockRes();
    const next = mockNext();

    validateSettings(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('calls next() for valid input', () => {
    const req = mockReq({ supportEmail: 'test@example.com', companyName: 'TestCo' });
    const res = mockRes();
    const next = mockNext();

    validateSettings(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('allows partial body with missing fields', () => {
    const req = mockReq({ supportEmail: 'test@example.com' });
    const res = mockRes();
    const next = mockNext();

    validateSettings(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});

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

    it('returns 500 when DAL throws', async () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      mockSettingsDAL.getSettings.mockRejectedValue(new Error('DB error'));

      await controller.getSettings({} as any, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
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
        enableNotifications: true,
        maxTicketsPerOrder: 10,
        maxTicketsPerEvent: 10000,
        defaultTicketPrice: 50,
        enableWaitlist: true,
        enableReviews: false,
        enableRefunds: true,
      });

      const req = {
        body: {
          supportEmail: 'new@test.com',
          companyName: 'NewCo',
          enableNotifications: true,
          maxTicketsPerOrder: 10,
          maxTicketsPerEvent: 10000,
          defaultTicketPrice: 50,
          enableWaitlist: true,
          enableReviews: false,
          enableRefunds: true,
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
          enableNotifications: DEFAULT_SETTINGS.enableNotifications,
          maxTicketsPerOrder: DEFAULT_SETTINGS.maxTicketsPerOrder,
          enableRefunds: DEFAULT_SETTINGS.enableRefunds,
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
        enableNotifications: true,
      });
      mockSettingsDAL.upsertSettings.mockResolvedValue({
        supportEmail: 'new@test.com',
        companyName: 'OldCo',
        enableNotifications: true,
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
          enableNotifications: true,
        })
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('returns 500 when DAL throws', async () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      mockSettingsDAL.getSettings.mockResolvedValue({});
      mockSettingsDAL.upsertSettings.mockRejectedValue(new Error('DB error'));

      const req = {
        body: { supportEmail: 'test@example.com' },
      };

      await controller.postSettings(req as any, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});
