import { Collection } from 'mongodb';
import { createSettingsDAL, SettingsDocument } from './settings.dal';
import { SettingsInput } from '../entity/settings';

interface SettingsCollectionMock extends Pick<Collection<SettingsDocument>, 'findOne' | 'findOneAndUpdate'> {
  findOne: jest.Mock;
  findOneAndUpdate: jest.Mock;
}

describe('createSettingsDAL', () => {
  const basePayload: SettingsInput = {
    salesEnabled: true,
    defaultCurrency: 'USD',
    supportEmail: 'support@example.com',
    ticketHoldMinutes: 15,
  };

  it('returns null when settings document does not exist', async () => {
    const collection = {
      findOne: jest.fn().mockResolvedValue(null),
      findOneAndUpdate: jest.fn(),
    } as unknown as SettingsCollectionMock;

    const dal = createSettingsDAL(collection as unknown as Collection<SettingsDocument>);
    const result = await dal.getSettings();

    expect(result).toBeNull();
    expect(collection.findOne).toHaveBeenCalledWith(
      { _id: 'global' },
      { projection: { _id: 0 } },
    );
  });

  it('upserts and returns updated settings', async () => {
    const now = new Date();
    const upsertedSettings = {
      ...basePayload,
      createdAt: now,
      updatedAt: now,
    };

    const collection = {
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn().mockResolvedValue(upsertedSettings),
    } as unknown as SettingsCollectionMock;

    const dal = createSettingsDAL(collection as unknown as Collection<SettingsDocument>);
    const result = await dal.upsertSettings(basePayload);

    expect(result).toEqual(upsertedSettings);
    expect(collection.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'global' },
      expect.objectContaining({
        $set: expect.objectContaining({
          salesEnabled: basePayload.salesEnabled,
          defaultCurrency: basePayload.defaultCurrency,
          supportEmail: basePayload.supportEmail,
          ticketHoldMinutes: basePayload.ticketHoldMinutes,
        }),
        $setOnInsert: expect.objectContaining({
          createdAt: expect.any(Date),
        }),
      }),
      {
        upsert: true,
        returnDocument: 'after',
        projection: { _id: 0 },
      },
    );
  });

  it('throws when Mongo upsert returns null', async () => {
    const collection = {
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn().mockResolvedValue(null),
    } as unknown as SettingsCollectionMock;

    const dal = createSettingsDAL(collection as unknown as Collection<SettingsDocument>);

    await expect(dal.upsertSettings(basePayload)).rejects.toThrow(
      'Failed to upsert settings document',
    );
  });
});