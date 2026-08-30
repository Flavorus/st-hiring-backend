import { SettingsDAL } from "../dal/settings.dal";
import { Settings } from "../entity/settings";
import { Request, Response } from "express";

const isSettingsBody = (body: unknown): body is Settings => {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return false;
  }
  const { siteName, contactEmail, maintenanceMode } = body as Record<string, unknown>;
  return (
    typeof siteName === "string" &&
    typeof contactEmail === "string" &&
    typeof maintenanceMode === "boolean"
  );
};

export const createPostSettingsController = ({
  settingsDAL,
}: {
  settingsDAL: SettingsDAL;
}) => async (req: Request, res: Response) => {
  try {
    if (!isSettingsBody(req.body)) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }

    const settings: Settings = {
      siteName: req.body.siteName,
      contactEmail: req.body.contactEmail,
      maintenanceMode: req.body.maintenanceMode,
    };

    const saved = await settingsDAL.saveSettings(settings);
    res.status(200).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
