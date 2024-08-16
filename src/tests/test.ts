import request from 'supertest';
import express from 'express';
import { createSettingsController } from '../controllers/controller';
import { Settings } from '../models/model';

const app = express();
app.use(express.json());
app.use('/settings', createSettingsController());

jest.mock('../models/model');

describe('Settings Controller', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create settings if not found', async () => {
        (Settings.findOne as jest.Mock).mockResolvedValue(null);
        (Settings.create as jest.Mock).mockResolvedValue({ clientId: '123' });

        const response = await request(app).get('/settings/123');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ clientId: '123' });
    });

    it('should return existing settings', async () => {
        (Settings.findOne as jest.Mock).mockResolvedValue({ clientId: '123' });

        const response = await request(app).get('/settings/123');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ clientId: '123' });
    });

    it('should update settings', async () => {
        const updatedSettings = { someSetting: 'newValue' };
        (Settings.findOneAndUpdate as jest.Mock).mockResolvedValue({ clientId: '123', ...updatedSettings });

        const response = await request(app).put('/settings/123').send(updatedSettings);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ clientId: '123', ...updatedSettings });
    });
});