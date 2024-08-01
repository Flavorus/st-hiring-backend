import 'reflect-metadata';
import { SettingsService } from '../services/SettingsService';
import { ISettingsRespository } from '../interfaces/ISettingsRespository';
import { SettingsDto } from '../dtos/SettingsDto';
import { SettingsSchema } from '../schemas/SettingsSchema';
import { defaultSetttings } from "../utils/DefaultSettings";

const mockSettingsRepository: jest.Mocked<ISettingsRespository> = {
  create: jest.fn(),
  findAll: jest.fn(),
  findByClientId: jest.fn(),
  update: jest.fn(),
};

const settingsService = new SettingsService(mockSettingsRepository);

describe('SettingsService', () => {
  const settingsDto: SettingsDto = defaultSetttings;
  const settingsSchema: SettingsSchema = defaultSetttings;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createSettings should call repository create method and return settings', async () => {
    mockSettingsRepository.create.mockResolvedValue(settingsSchema);

    const result = await settingsService.createSettings(settingsDto);

    expect(mockSettingsRepository.create).toHaveBeenCalledWith(settingsDto);
    expect(result).toEqual(settingsSchema);
  });

  test('getAll should call repository findAll method and return settings', async () => {
    mockSettingsRepository.findAll.mockResolvedValue([settingsSchema]);

    const result = await settingsService.getAll();

    expect(mockSettingsRepository.findAll).toHaveBeenCalled();
    expect(result).toEqual([settingsSchema]);
  });

  test('getSettingsByClientId should call repository findByClientId method and return settings', async () => {
    const clientId = 1;
    mockSettingsRepository.findByClientId.mockResolvedValue(settingsSchema);

    const result = await settingsService.getSettingsByClientId(clientId);

    expect(mockSettingsRepository.findByClientId).toHaveBeenCalledWith(clientId);
    expect(result).toEqual(settingsSchema);
  });

  test('update should call repository update method and return settings', async () => {
    const clientId = 1;
    mockSettingsRepository.update.mockResolvedValue(settingsSchema);

    const result = await settingsService.update(clientId, settingsDto);

    expect(mockSettingsRepository.update).toHaveBeenCalledWith(clientId, { ...settingsDto, _id: undefined });
    expect(result).toEqual(settingsSchema);
  });
});