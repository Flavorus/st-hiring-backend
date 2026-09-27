import { DEFAULT_SETTINGS } from '../entity/settings';
import { settingsController } from '../controllers/settings';

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
