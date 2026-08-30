import { Db } from 'mongodb';
import { createSettingsDAL, SettingsDAL } from './settings.dal';

const settings = {
  siteName: 'GTS Assessment',
  contactEmail: 'test@example.com',
  maintenanceMode: true,
};

describe('createSettingsDAL', () => {
  const findOne = jest.fn();
  const findOneAndUpdate = jest.fn();
  const collection = jest.fn();
  const mockDb = { collection } as unknown as Db;
  let dal: SettingsDAL;

  beforeEach(() => {
    findOne.mockReset();
    findOneAndUpdate.mockReset();
    collection.mockReset();
    collection.mockReturnValue({ findOne, findOneAndUpdate });
    dal = createSettingsDAL(mockDb);
  });

  describe('getSettings', () => {
    it('returns settings without _id when the document exists', async () => {
      findOne.mockResolvedValue({
        _id: 'current',
        siteName: 'See Tickets',
        contactEmail: 'test@example.com',
        maintenanceMode: false,
      });

      const result = await dal.getSettings();

      expect(collection).toHaveBeenCalledWith('settings');
      expect(findOne).toHaveBeenCalledWith({ _id: 'current' });
      expect(result).toEqual({
        siteName: 'See Tickets',
        contactEmail: 'test@example.com',
        maintenanceMode: false,
      });
      expect(result).not.toHaveProperty('_id');
    });

    it('returns null when the document does not exist', async () => {
      findOne.mockResolvedValue(null);

      const result = await dal.getSettings();

      expect(findOne).toHaveBeenCalledWith({ _id: 'current' });
      expect(result).toBeNull();
    });

    it('rejects when MongoDB fails', async () => {
      const error = new Error('Mongo failure');
      findOne.mockRejectedValue(error);

      await expect(dal.getSettings()).rejects.toBe(error);
    });
  });

  describe('saveSettings', () => {
    it('upserts the singleton and returns settings without _id', async () => {
      findOneAndUpdate.mockResolvedValue({
        _id: 'current',
        siteName: 'GTS Assessment',
        contactEmail: 'test@example.com',
        maintenanceMode: true,
      });

      const result = await dal.saveSettings(settings);

      expect(findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'current' },
        {
          $set: {
            siteName: 'GTS Assessment',
            contactEmail: 'test@example.com',
            maintenanceMode: true,
          },
        },
        { upsert: true, returnDocument: 'after' },
      );
      expect(result).toEqual(settings);
      expect(result).not.toHaveProperty('_id');
    });

    it('rejects when MongoDB fails', async () => {
      const error = new Error('Mongo failure');
      findOneAndUpdate.mockRejectedValue(error);

      await expect(dal.saveSettings(settings)).rejects.toBe(error);
    });

    it('throws when findOneAndUpdate returns a falsy result', async () => {
      findOneAndUpdate.mockResolvedValue(null);

      await expect(dal.saveSettings(settings)).rejects.toThrow('Failed to save settings');
    });
  });
});
