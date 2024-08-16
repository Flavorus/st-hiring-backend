import { Request, Response, Router } from 'express';
import { Settings } from '../models/model';

export const createSettingsController = () => {
    const router = Router();

    router.get('/:clientId', async (req: Request, res: Response) => {
        const { clientId } = req.params;
        let settings = await Settings.findOne({ clientId });

        if (!settings) {
            settings = await Settings.create({ clientId });
        }

        res.json(settings);
    });

    router.put('/:clientId', async (req: Request, res: Response) => {
        const { clientId } = req.params;
        const updatedSettings = req.body;


        const settings = await Settings.findOneAndUpdate({ clientId }, updatedSettings, { new: true });
        res.json(settings);
    });

    return router;
};