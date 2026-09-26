import { Db } from 'mongodb';
import { Settings } from '../entity/settings';

const SETTINGS_ID = 'settings' as any;

export interface SettingsDAL {
  getSettings(): Promise<Settings | {}>;
  upsertSettings(data: Settings): Promise<Settings>;
}

export const createSettingsDAL = (mongoDb: Db): SettingsDAL => {
  const collectionName = 'appSettings';

  return {
    async getSettings(): Promise<Settings | {}> {
      const doc = await mongoDb.collection(collectionName).findOne({ _id: SETTINGS_ID });
      if (!doc) {
        return {};
      }
      const { _id, ...settings } = doc;
      return settings as Settings;
    },

    async upsertSettings(data: Settings): Promise<Settings> {
      const result = await mongoDb.collection(collectionName).findOneAndUpdate(
        { _id: SETTINGS_ID },
        { $set: data },
        { upsert: true, returnDocument: 'after' }
      );
      if(!result){
        return data
      }
      const { _id, ...settings } = result;
      return settings as Settings;
    },
  };
};
