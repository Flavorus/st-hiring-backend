import { Collection } from 'mongodb';
import { Settings, SettingsInput } from '../entity/settings';

export interface SettingsDocument extends Settings {
  _id: 'global';
}

export interface SettingsDAL {
  getSettings(): Promise<Settings | null>;
  upsertSettings(input: SettingsInput): Promise<Settings>;
}

export const createSettingsDAL = (
  settingsCollection: Collection<SettingsDocument>,
): SettingsDAL => {
  return {
    async getSettings(): Promise<Settings | null> {
      const settings = await settingsCollection.findOne(
        { _id: 'global' },
        { projection: { _id: 0 } },
      );

      return settings;
    },

    async upsertSettings(input: SettingsInput): Promise<Settings> {
      const now = new Date();

      const settings = await settingsCollection.findOneAndUpdate(
        { _id: 'global' },
        {
          $set: {
            salesEnabled: input.salesEnabled,
            defaultCurrency: input.defaultCurrency,
            supportEmail: input.supportEmail,
            ticketHoldMinutes: input.ticketHoldMinutes,
            updatedAt: now,
          },
          $setOnInsert: {
            createdAt: now,
          },
        },
        {
          upsert: true,
          returnDocument: 'after',
          projection: { _id: 0 },
        },
      );

      if (!settings) {
        throw new Error('Failed to upsert settings document');
      }

      return settings;
    },
  };
};