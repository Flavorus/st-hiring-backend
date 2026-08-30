import { Db } from 'mongodb';
import { Settings } from '../entity/settings';

const SETTINGS_ID = 'current';

type SettingsDocument = Settings & { _id: string };

const toSettings = (doc: SettingsDocument): Settings => ({
  siteName: doc.siteName,
  contactEmail: doc.contactEmail,
  maintenanceMode: doc.maintenanceMode,
});

export interface SettingsDAL {
  getSettings(): Promise<Settings | null>;
  saveSettings(settings: Settings): Promise<Settings>;
}

export const createSettingsDAL = (db: Db): SettingsDAL => {
  const collection = db.collection<SettingsDocument>('settings');

  return {
    async getSettings(): Promise<Settings | null> {
      const doc = await collection.findOne({ _id: SETTINGS_ID });
      return doc ? toSettings(doc) : null;
    },

    async saveSettings(settings: Settings): Promise<Settings> {
      const doc = await collection.findOneAndUpdate(
        { _id: SETTINGS_ID },
        {
          $set: {
            siteName: settings.siteName,
            contactEmail: settings.contactEmail,
            maintenanceMode: settings.maintenanceMode,
          },
        },
        { upsert: true, returnDocument: 'after' },
      );

      if (!doc) {
        throw new Error('Failed to save settings');
      }

      return toSettings(doc);
    },
  };
};
