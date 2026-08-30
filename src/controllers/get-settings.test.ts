import { Request, Response } from 'express';
import { SettingsDAL } from '../dal/settings.dal';
import { createGetSettingsController } from './get-settings';

const settings = {
  siteName: 'See Tickets',
  contactEmail: 'test@example.com',
  maintenanceMode: false,
};

describe('createGetSettingsController', () => {
  const getSettings = jest.fn();
  const settingsDAL = { getSettings } as unknown as SettingsDAL;
  const req = {} as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;
  const controller = createGetSettingsController({ settingsDAL });

  beforeEach(() => {
    getSettings.mockReset();
    (res.status as jest.Mock).mockClear();
    (res.json as jest.Mock).mockClear();
  });

  it('returns settings as JSON when they exist', async () => {
    getSettings.mockResolvedValue(settings);

    await controller(req, res);

    expect(getSettings).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(settings);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 404 when settings do not exist', async () => {
    getSettings.mockResolvedValue(null);

    await controller(req, res);

    expect(getSettings).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Settings not found' });
    expect(res.status).not.toHaveBeenCalledWith(500);
  });

  it('returns 500 without exposing the DAL error', async () => {
    const error = new Error('Mongo failure');
    getSettings.mockRejectedValue(error);
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    await controller(req, res);

    expect(getSettings).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    expect(res.json).not.toHaveBeenCalledWith(expect.objectContaining({
      message: 'Mongo failure',
    }));
    expect(JSON.stringify((res.json as jest.Mock).mock.calls[0][0])).not.toContain('Mongo failure');
    expect(JSON.stringify((res.json as jest.Mock).mock.calls[0][0])).not.toContain('stack');
    expect(consoleError).toHaveBeenCalledWith(error);

    consoleError.mockRestore();
  });
});
