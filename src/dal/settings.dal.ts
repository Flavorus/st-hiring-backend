import { Collection } from "mongodb";
import { Settings, SettingsInput } from "../entity/settings";

export interface UpsertSettingsResult {
  settings: Settings;
  created: boolean;
}

export interface SettingsDAL {
  getSettings(): Promise<Settings | null>;
  upsertSettings(settings: SettingsInput): Promise<UpsertSettingsResult>;
}

export const createSettingsDAL = (
  collection: Collection<Settings>,
): SettingsDAL => ({
  async getSettings(): Promise<Settings | null> {
    return collection.findOne({ key: 'global' });
  },

  async upsertSettings(input: SettingsInput): Promise<UpsertSettingsResult> {
    const now = new Date();

    const settingsRes = await collection.findOneAndUpdate(
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

    const savedSettings = settingsRes.value;


    if (!savedSettings) {
      throw new Error('Unable to save settings');
    }

    return {
       settings: savedSettings,
       created: settingsRes.lastErrorObject?.updatedExisting === false,
    };
  },
});