import { createGetSettingsController } from '../get-settings';
import { SettingsService } from '../../services/settings.service';

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

describe('createGetSettingsController', () => {
  it('responds with 404 when settings are not found', async () => {
    const settingsService: SettingsService = {
      getCurrentSettings: jest.fn().mockResolvedValue(null),
      upsertCurrentSettings: jest.fn(),
    };

    const controller = createGetSettingsController({ settingsService });
    const response = createMockResponse();

    await controller({} as never, response as never);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({ message: 'Settings not found' });
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

    const settingsService: SettingsService = {
      getCurrentSettings: jest.fn().mockResolvedValue(settings),
      upsertCurrentSettings: jest.fn(),
    };

    const controller = createGetSettingsController({ settingsService });
    const response = createMockResponse();

    await controller({} as never, response as never);

    expect(response.status).not.toHaveBeenCalled();
    expect(response.json).toHaveBeenCalledWith(settings);
  });

  it('responds with 500 when service throws unexpected error', async () => {
    const settingsService: SettingsService = {
      getCurrentSettings: jest.fn().mockRejectedValue(new Error('Mongo failed')),
      upsertCurrentSettings: jest.fn(),
    };

    const controller = createGetSettingsController({ settingsService });
    const response = createMockResponse();

    await controller({} as never, response as never);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});