import { createPostSettingsController } from './post-settings';
import {
  SettingsService,
  SettingsValidationError,
} from '../services/settings.service';

interface MockResponse {
  status: jest.MockedFunction<(code: number) => MockResponse>;
  json: jest.MockedFunction<(body: unknown) => MockResponse>;
}

const createMockResponse = (): MockResponse => {
  const response = {
    status: jest.fn(),
    json: jest.fn(),
  } as unknown as MockResponse;

  response.status.mockReturnValue(response);
  response.json.mockReturnValue(response);

  return response;
};

describe('createPostSettingsController', () => {
  const validPayload = {
    salesEnabled: true,
    defaultCurrency: 'usd',
    supportEmail: 'support@example.com',
    ticketHoldMinutes: 20,
  };

  it('returns 400 when payload is invalid', async () => {
    const settingsService: SettingsService = {
      getCurrentSettings: jest.fn(),
      upsertCurrentSettings: jest
        .fn()
        .mockRejectedValue(new SettingsValidationError('supportEmail must be a valid email string')),
    };

    const controller = createPostSettingsController({ settingsService });
    const response = createMockResponse();

    await controller({ body: { ...validPayload, supportEmail: 'invalid' } } as never, response as never);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({ message: 'supportEmail must be a valid email string' });
  });

  it('returns 201 when settings are created', async () => {
    const upserted = {
      salesEnabled: true,
      defaultCurrency: 'USD',
      supportEmail: 'support@example.com',
      ticketHoldMinutes: 20,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const settingsService: SettingsService = {
      getCurrentSettings: jest.fn(),
      upsertCurrentSettings: jest.fn().mockResolvedValue({
        settings: upserted,
        wasCreated: true,
      }),
    };

    const controller = createPostSettingsController({ settingsService });
    const response = createMockResponse();

    await controller({ body: validPayload } as never, response as never);

    expect(settingsService.upsertCurrentSettings).toHaveBeenCalledWith(validPayload);
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith(upserted);
  });

  it('returns 200 when settings are updated', async () => {
    const upserted = {
      salesEnabled: true,
      defaultCurrency: 'USD',
      supportEmail: 'support@example.com',
      ticketHoldMinutes: 20,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const settingsService: SettingsService = {
      getCurrentSettings: jest.fn(),
      upsertCurrentSettings: jest.fn().mockResolvedValue({
        settings: upserted,
        wasCreated: false,
      }),
    };

    const controller = createPostSettingsController({ settingsService });
    const response = createMockResponse();

    await controller({ body: validPayload } as never, response as never);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(upserted);
  });

  it('returns 500 when service fails unexpectedly', async () => {
    const settingsService: SettingsService = {
      getCurrentSettings: jest.fn(),
      upsertCurrentSettings: jest.fn().mockRejectedValue(new Error('Mongo unavailable')),
    };

    const controller = createPostSettingsController({ settingsService });
    const response = createMockResponse();

    await controller({ body: validPayload } as never, response as never);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});