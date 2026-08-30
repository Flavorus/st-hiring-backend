import { createPostSettingsController } from './post-settings';

describe('createPostSettingsController', () => {
  const validPayload = {
    salesEnabled: true,
    defaultCurrency: 'usd',
    supportEmail: 'support@example.com',
    ticketHoldMinutes: 20,
  };

  it('returns 400 when payload is invalid', async () => {
    const settingsDAL = {
      upsertSettings: jest.fn(),
    } as any;

    const controller = createPostSettingsController({ settingsDAL });

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await controller({ body: { ...validPayload, supportEmail: 'invalid' } } as any, res);

    expect(settingsDAL.upsertSettings).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'supportEmail must be a valid email string' });
  });

  it('normalizes payload and returns upserted settings', async () => {
    const upserted = {
      salesEnabled: true,
      defaultCurrency: 'USD',
      supportEmail: 'support@example.com',
      ticketHoldMinutes: 20,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const settingsDAL = {
      upsertSettings: jest.fn().mockResolvedValue(upserted),
    } as any;

    const controller = createPostSettingsController({ settingsDAL });

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await controller({ body: validPayload } as any, res);

    expect(settingsDAL.upsertSettings).toHaveBeenCalledWith({
      salesEnabled: true,
      defaultCurrency: 'USD',
      supportEmail: 'support@example.com',
      ticketHoldMinutes: 20,
    });
    expect(res.json).toHaveBeenCalledWith(upserted);
  });
});