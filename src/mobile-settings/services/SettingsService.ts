import { inject, injectable } from 'inversify';
import { SettingsDto } from '../dtos/SettingsDto';
import { ISettingsService } from '../interfaces/ISettingsService';
import { ISettingsRespository } from '../interfaces/ISettingsRespository';
import { SettingsSchema } from '../schemas/SettingsSchema';

@injectable()
export class SettingsService implements ISettingsService {
  constructor(@inject('ISettingsRepository') private settingsRepository: ISettingsRespository) {}

  async createSettings(settingDto: SettingsDto): Promise<SettingsSchema> {
    const settings = {
      ...settingDto
    } as SettingsSchema;

    return await this.settingsRepository.create(settings);
  }

  async getAll() : Promise<SettingsSchema[]> { 
    return await this.settingsRepository.findAll();
  }

  async getSettingsByClientId(clientId : number) : Promise<SettingsSchema> {
    return await this.settingsRepository.findByClientId(clientId);
  }

  async update(clientId: number, settingDto: SettingsDto) : Promise<SettingsSchema> {
    const settings = {
      ...settingDto,
    } as SettingsSchema;

    if (settings.hasOwnProperty('_id')) {
      delete settings['_id'];
    }
    return await this.settingsRepository.update(clientId, settings);
  }
}
