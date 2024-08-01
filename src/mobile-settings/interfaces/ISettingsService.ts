import { SettingsDto } from '../dtos/SettingsDto';
import { SettingsSchema } from '../schemas/SettingsSchema';

export interface ISettingsService {
  createSettings(settingsDto: SettingsDto): Promise<SettingsSchema>;
  getAll() : Promise<SettingsSchema[]>;
  getSettingsByClientId(clientId : number): Promise<SettingsSchema>;
  update(clientId: number, settingDto: SettingsDto) : Promise<SettingsSchema>;
}