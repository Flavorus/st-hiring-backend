import { Collection } from 'mongodb';
import { Settings, SettingsInput } from '../../entity/settings';
import { createSettingsDAL } from '../settings.dal';

describe('When using createSettingsDAL', () => {
  const findOne = jest.fn();
  const findOneAndUpdate = jest.fn();
  const collection = {
    findOne,
    findOneAndUpdate,
  } as unknown as Collection<Settings>;

  const input: SettingsInput = {
    currency: 'USD',
    timezone: 'America/Bogota',
    maxTicketsPerOrder: 10,
    salesEnabled: true,
  };

  const savedSettings: Settings = {
    ...input,
    key: 'global',
    createdAt: new Date('2026-09-17T12:00:00.000Z'),
    updatedAt: new Date('2026-09-17T12:00:00.000Z'),
  };

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getSettings', () => {
    it('returns the global settings document', async () => {
      findOne.mockResolvedValue(savedSettings);
      const settingsDAL = createSettingsDAL(collection);

      const result = await settingsDAL.getSettings();

      expect(findOne).toHaveBeenCalledWith({ key: 'global' });
      expect(findOne).toHaveBeenCalledTimes(1);
      expect(result).toBe(savedSettings);
    });

    it('returns null when the settings document does not exist', async () => {
      findOne.mockResolvedValue(null);
      const settingsDAL = createSettingsDAL(collection);

      const result = await settingsDAL.getSettings();

      expect(result).toBeNull();
    });

    it('propagates database errors', async () => {
      const databaseError = new Error('Database unavailable');
      findOne.mockRejectedValue(databaseError);
      const settingsDAL = createSettingsDAL(collection);

      await expect(settingsDAL.getSettings()).rejects.toThrow(databaseError);
    });
  });

  describe('When using upsertSettings', () => {
    it('returns created true when MongoDB inserts the document', async () => {
      const now = new Date('2026-09-17T14:00:00.000Z');
      jest.useFakeTimers().setSystemTime(now);
      findOneAndUpdate.mockResolvedValue({
        value: savedSettings,
        lastErrorObject: { updatedExisting: false },
      });
      const settingsDAL = createSettingsDAL(collection);

      const result = await settingsDAL.upsertSettings(input);

      expect(findOneAndUpdate).toHaveBeenCalledWith(
        { key: 'global' },
        {
          $set: {
            ...input,
            updatedAt: now,
          },
          $setOnInsert: {
            key: 'global',
            createdAt: now,
          },
        },
        {
          upsert: true,
          returnDocument: 'after',
          includeResultMetadata: true,
        },
      );
      expect(result).toEqual({
        settings: savedSettings,
        created: true,
      });
    });

    it('returns created false when MongoDB updates the document', async () => {
      findOneAndUpdate.mockResolvedValue({
        value: savedSettings,
        lastErrorObject: { updatedExisting: true },
      });
      const settingsDAL = createSettingsDAL(collection);

      const result = await settingsDAL.upsertSettings(input);

      expect(result).toEqual({
        settings: savedSettings,
        created: false,
      });
    });

    it('throws when MongoDB does not return a saved document', async () => {
      findOneAndUpdate.mockResolvedValue({
        value: null,
        lastErrorObject: { updatedExisting: false },
      });
      const settingsDAL = createSettingsDAL(collection);

      await expect(settingsDAL.upsertSettings(input)).rejects.toThrow(
        'Unable to save settings',
      );
    });

    it('propagates database errors', async () => {
      const databaseError = new Error('Database unavailable');
      findOneAndUpdate.mockRejectedValue(databaseError);
      const settingsDAL = createSettingsDAL(collection);

      await expect(settingsDAL.upsertSettings(input)).rejects.toThrow(
        databaseError,
      );
    });
  });
});
