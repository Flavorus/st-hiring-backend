import {
  createSettingsService,
  SettingsValidationError,
} from '../settings.service';
import { Settings } from '../../entity/settings';

describe('createSettingsService', () => {
  const existingSettings: Settings = {
    salesEnabled: true,
    defaultCurrency: 'USD',
    supportEmail: 'support@example.com',
    ticketHoldMinutes: 15,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  it('returns wasCreated=true when creating settings for first time', async () => {
    const settingsDAL = {
      getSettings: jest
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(existingSettings),
      upsertSettings: jest.fn().mockResolvedValue(existingSettings),
    };

    const service = createSettingsService({ settingsDAL });

    const result = await service.upsertCurrentSettings({
      salesEnabled: true,
      defaultCurrency: 'usd',
      supportEmail: 'support@example.com',
      ticketHoldMinutes: 15,
    });

    expect(result.wasCreated).toBe(true);
    expect(settingsDAL.upsertSettings).toHaveBeenCalledWith({
      salesEnabled: true,
      defaultCurrency: 'USD',
      supportEmail: 'support@example.com',
      ticketHoldMinutes: 15,
    });
  });

  it('returns wasCreated=false when updating existing settings', async () => {
    const settingsDAL = {
      getSettings: jest.fn().mockResolvedValue(existingSettings),
      upsertSettings: jest.fn().mockResolvedValue(existingSettings),
    };

    const service = createSettingsService({ settingsDAL });

    const result = await service.upsertCurrentSettings({
      salesEnabled: true,
      defaultCurrency: 'usd',
      supportEmail: 'support@example.com',
      ticketHoldMinutes: 15,
    });

    expect(result.wasCreated).toBe(false);
  });

  it('throws SettingsValidationError for invalid payload', async () => {
    const settingsDAL = {
      getSettings: jest.fn(),
      upsertSettings: jest.fn(),
    };

    const service = createSettingsService({ settingsDAL });

    await expect(
      service.upsertCurrentSettings({
        salesEnabled: true,
        defaultCurrency: '',
        supportEmail: 'support@example.com',
        ticketHoldMinutes: 15,
      }),
    ).rejects.toBeInstanceOf(SettingsValidationError);

    expect(settingsDAL.upsertSettings).not.toHaveBeenCalled();
  });
});