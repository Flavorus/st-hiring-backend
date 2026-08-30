import { Request, Response } from 'express';
import { SettingsDAL } from '../dal/settings.dal';
import { createPostSettingsController } from './post-settings';

const settings = {
  siteName: 'GTS Assessment',
  contactEmail: 'test@example.com',
  maintenanceMode: true,
};

describe('createPostSettingsController', () => {
  const saveSettings = jest.fn();
  const settingsDAL = { saveSettings } as unknown as SettingsDAL;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;
  const controller = createPostSettingsController({ settingsDAL });

  const reqWith = (body: unknown) => ({ body } as Request);

  beforeEach(() => {
    saveSettings.mockReset();
    (res.status as jest.Mock).mockClear();
    (res.json as jest.Mock).mockClear();
  });

  it('saves settings and returns 200 JSON without _id', async () => {
    saveSettings.mockResolvedValue(settings);

    await controller(reqWith(settings), res);

    expect(saveSettings).toHaveBeenCalledTimes(1);
    expect(saveSettings).toHaveBeenCalledWith({
      siteName: 'GTS Assessment',
      contactEmail: 'test@example.com',
      maintenanceMode: true,
    });
    expect(saveSettings.mock.calls[0][0]).not.toHaveProperty('_id');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(settings);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect((res.json as jest.Mock).mock.calls[0][0]).not.toHaveProperty('_id');
  });

  it('returns 400 when the body is invalid and does not save', async () => {
    await controller(reqWith({ siteName: 123 }), res);

    expect(saveSettings).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid request' });
    expect(res.status).not.toHaveBeenCalledWith(500);
  });

  it('returns 400 when required fields are missing and does not save', async () => {
    await controller(reqWith({ siteName: 'GTS Assessment' }), res);

    expect(saveSettings).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid request' });
  });

  it('returns 400 when maintenanceMode is a string and does not save', async () => {
    await controller(reqWith({
      siteName: 'GTS Assessment',
      contactEmail: 'test@example.com',
      maintenanceMode: 'true',
    }), res);

    expect(saveSettings).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid request' });
  });

  it('returns 400 when the body is an array and does not save', async () => {
    await controller(reqWith([settings]), res);

    expect(saveSettings).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid request' });
  });

  it('returns 500 without exposing the DAL error', async () => {
    const error = new Error('Mongo failure');
    saveSettings.mockRejectedValue(error);
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    await controller(reqWith(settings), res);

    expect(saveSettings).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    expect(res.json).not.toHaveBeenCalledWith(error);
    expect(res.json).not.toHaveBeenCalledWith(expect.objectContaining({
      message: 'Mongo failure',
    }));
    expect(JSON.stringify((res.json as jest.Mock).mock.calls[0][0])).not.toContain('Mongo failure');
    expect(JSON.stringify((res.json as jest.Mock).mock.calls[0][0])).not.toContain('stack');
    expect(consoleError).toHaveBeenCalledWith(error);

    consoleError.mockRestore();
  });

  it('saves settings when maintenanceMode is false', async () => {
    const body = {
      siteName: 'See Tickets',
      contactEmail: 'test@example.com',
      maintenanceMode: false,
    };
    saveSettings.mockResolvedValue(body);

    await controller(reqWith(body), res);

    expect(saveSettings).toHaveBeenCalledTimes(1);
    expect(saveSettings).toHaveBeenCalledWith({
      siteName: 'See Tickets',
      contactEmail: 'test@example.com',
      maintenanceMode: false,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(body);
  });
});
