import { createGetSettingsController } from './get-settings';

describe('createGetSettingsController', () => {
  it('responds with 404 when settings are not found', async () => {
    const settingsDAL = {
      getSettings: jest.fn().mockResolvedValue(null),
    } as any;

    const controller = createGetSettingsController({ settingsDAL });

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await controller({} as any, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Settings not found' });
  });

  it('responds with settings when found', async () => {
    const settings = {
      salesEnabled: true,
      defaultCurrency: 'USD',
      supportEmail: 'support@example.com',
      ticketHoldMinutes: 15,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const settingsDAL = {
      getSettings: jest.fn().mockResolvedValue(settings),
    } as any;

    const controller = createGetSettingsController({ settingsDAL });

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await controller({} as any, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(settings);
  });
});