import { inject, injectable } from 'inversify';
import { ISettingsRespository } from '../interfaces/ISettingsRespository';
import { SettingsSchema } from '../schemas/SettingsSchema';
import { Collection, Db } from 'mongodb';
import { defaultSetttings } from '../utils/DefaultSettings';

@injectable()
export class SettingsRepository implements ISettingsRespository {
  private collection: Collection;

  constructor(@inject('Db') private db: Db) {
    this.collection = this.db.collection('settings');
  }

  async create(settings: SettingsSchema): Promise<SettingsSchema> {
    try {
      const result = await this.collection.insertOne(settings);
      const insertedSettings = await this.collection.findOne({ _id: result.insertedId });
      return insertedSettings as SettingsSchema;
    } catch (error) {
      throw new Error(`Error when trying to create new settings`);
    }
  }

  async findAll(): Promise<SettingsSchema[]> {
    const settings = await this.collection.find().toArray() as SettingsSchema[];
    if (!settings) {
      throw new Error(`Settings not found`);
    }
    return settings;
  }

  async findByClientId(clientId: number): Promise<SettingsSchema> {
    const foundSettings = await this.collection.findOne({ clientId: clientId });
    if (!foundSettings) {
      const newSettings = {
        ...defaultSetttings,
        clientId: clientId
      }
      const newDefaultSettingsCreated = await this.create(newSettings);
      return newDefaultSettingsCreated as SettingsSchema;
    }
    return foundSettings as SettingsSchema;
  }

  async update(clientId: number, settings): Promise<SettingsSchema> {
    const result = await this.collection.findOneAndUpdate(
      { clientId: clientId },
      { $set: settings },
      {
        returnDocument: 'after',
      },
    );

    if (!result) {
      throw new Error('User not found');
    }
    return result as SettingsSchema;
  }
}
