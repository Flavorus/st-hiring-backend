import { Request, Response } from 'express';
import { createGetSettingsController } from '../get-settings';
import { SettingsDAL } from '../../dal/settings.dal';

describe('When using createGetSettingsController', () => {

    const createResponse = () => {
        const res = {
            status: jest.fn(),
            json: jest.fn(),
        };

        res.status.mockReturnValue(res);

        return res as unknown as Response;
    };

    it('returns 200 with the current settings', async () => {

        const settings = {
            key: 'global',
            currency: 'USD',
            timezone: 'UTC',
            maxTicketsPerOrder: 10,
            salesEnabled: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const settingsDAL: SettingsDAL = {
            getSettings: jest.fn().mockResolvedValue(settings),
            upsertSettings: jest.fn(),
        };

        const controller = createGetSettingsController({ settingsDAL });
        const res = createResponse();

        await controller({} as Request, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(settingsDAL.getSettings).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith(settings);
    });

    it('returns 404 when settings do not exist', async () => {

        const settingsDAL: SettingsDAL = {
            getSettings: jest.fn().mockResolvedValue(null),
            upsertSettings: jest.fn(),
        };

        const controller = createGetSettingsController({ settingsDAL });
        const res = createResponse();

        await controller({} as Request, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Settings not found',
        });
    });

    it('returns 500 when the DAL throws an error', async () => {
        const settingsDAL: SettingsDAL = {
            getSettings: jest
                .fn()
                .mockRejectedValue(new Error('Database error')),
            upsertSettings: jest.fn(),
        };

        const req = {} as Request;
        const res = createResponse();

        const controller = createGetSettingsController({ settingsDAL });

        await controller(req, res);

        expect(settingsDAL.getSettings).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Unable to retrieve settings',
        });
    });
});