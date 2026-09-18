import { Request, Response } from 'express';
import { SettingsDAL } from '../../dal/settings.dal';
import { createPostSettingsController } from '../post-settings';

describe('When using createPostSettingsController', () => {
  const createResponse = () => {
    const res = {
      status: jest.fn(),
      json: jest.fn(),
    };

    res.status.mockReturnValue(res);

    return res as unknown as Response;
  };

  const validInput = {
    currency: 'USD',
    timezone: 'America/Bogota',
    maxTicketsPerOrder: 10,
    salesEnabled: true,
  };

  const savedSettings = {
    ...validInput,
    key: 'global',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('returns 201 when settings are created', async () => {
    const settingsDAL: SettingsDAL = {
      getSettings: jest.fn(),
      upsertSettings: jest.fn().mockResolvedValue({
        settings: savedSettings,
        created: true,
      }),
    };

    const controller = createPostSettingsController({ settingsDAL });
    const req = { body: validInput } as Request;
    const res = createResponse();

    await controller(req, res);

    expect(settingsDAL.upsertSettings).toHaveBeenCalledWith(validInput);
    expect(settingsDAL.upsertSettings).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(savedSettings);
  });

  it('returns 200 when settings are updated', async () => {
    const settingsDAL: SettingsDAL = {
      getSettings: jest.fn(),
      upsertSettings: jest.fn().mockResolvedValue({
        settings: savedSettings,
        created: false,
      }),
    };

    const controller = createPostSettingsController({ settingsDAL });
    const req = { body: validInput } as Request;
    const res = createResponse();

    await controller(req, res);

    expect(settingsDAL.upsertSettings).toHaveBeenCalledWith(validInput);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(savedSettings);
  });

  it('returns 400 when a required field is missing', async () => {
    const settingsDAL: SettingsDAL = {
      getSettings: jest.fn(),
      upsertSettings: jest.fn(),
    };

    const controller = createPostSettingsController({ settingsDAL });
    const req = {
      body: {
        currency: 'USD',
        timezone: 'America/Bogota',
        salesEnabled: true,
      },
    } as Request;
    const res = createResponse();

    await controller(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(settingsDAL.upsertSettings).not.toHaveBeenCalled();
  });

  it('returns 400 when an unknown field is provided', async () => {
    const settingsDAL: SettingsDAL = {
      getSettings: jest.fn(),
      upsertSettings: jest.fn(),
    };

    const controller = createPostSettingsController({ settingsDAL });
    const req = {
      body: {
        ...validInput,
        admin: true,
      },
    } as Request;
    const res = createResponse();

    await controller(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(settingsDAL.upsertSettings).not.toHaveBeenCalled();
  });

  it('returns 500 when the DAL throws an error', async () => {
    const databaseError = new Error('Database error');

    const settingsDAL: SettingsDAL = {
      getSettings: jest.fn(),
      upsertSettings: jest.fn().mockRejectedValue(databaseError),
    };

    const controller = createPostSettingsController({ settingsDAL });
    const req = { body: validInput } as Request;
    const res = createResponse();

    await controller(req, res);

    expect(settingsDAL.upsertSettings).toHaveBeenCalledWith(validInput);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Unable to save settings',
    });
  });
});
