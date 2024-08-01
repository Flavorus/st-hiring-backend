import { SettingsSchema } from '../schemas/SettingsSchema';

export interface ISettingsRespository {
  create(setting: SettingsSchema): Promise<SettingsSchema>;
  findAll(): Promise<SettingsSchema[]>;
  findByClientId(clientId: number): Promise<SettingsSchema>;
  update(clientId: number, settings);
}
