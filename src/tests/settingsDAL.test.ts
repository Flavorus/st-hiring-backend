import { createSettingsDAL } from '../dal/settings.dal';

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
    it('creates or updates a setting', async () => {
      const input = {
        supportEmail: 'new@test.com',
        companyName: 'NewCo',
        maxTicketsPerEvent: 500,
      };

      const result = await settingsDAL.upsertSettings(input as any);

      expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'settings' },
        { $set: expect.objectContaining({ supportEmail: input.supportEmail, companyName: input.companyName }) },
        { upsert: true, returnDocument: 'after' }
      );
      expect(result).toEqual(expect.objectContaining({ supportEmail: input.supportEmail }));
    });
   
  });
});
