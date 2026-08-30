import { SettingsDAL } from "../dal/settings.dal";
import { Request, Response } from "express";

export const createGetSettingsController = ({
  settingsDAL,
}: {
  settingsDAL: SettingsDAL;
}) => async (_req: Request, res: Response) => {
  try {
    const settings = await settingsDAL.getSettings();
    if (!settings) {
      res.status(404).json({ error: "Settings not found" });
      return;
    }
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
