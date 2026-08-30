import { Request, Response } from 'express';
import { SettingsDAL } from '../dal/settings.dal';
import { SettingsInput } from '../entity/settings';

const validateSettingsPayload = (
  payload: unknown,
): { valid: true; value: SettingsInput } | { valid: false; message: string } => {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, message: 'Body must be a JSON object' };
  }

  const candidate = payload as Partial<SettingsInput>;

  if (typeof candidate.salesEnabled !== 'boolean') {
    return { valid: false, message: 'salesEnabled must be a boolean' };
  }

  if (typeof candidate.defaultCurrency !== 'string' || candidate.defaultCurrency.trim() === '') {
    return { valid: false, message: 'defaultCurrency must be a non-empty string' };
  }

  if (typeof candidate.supportEmail !== 'string' || !candidate.supportEmail.includes('@')) {
    return { valid: false, message: 'supportEmail must be a valid email string' };
  }

  if (
    typeof candidate.ticketHoldMinutes !== 'number'
    || !Number.isInteger(candidate.ticketHoldMinutes)
    || candidate.ticketHoldMinutes < 1
  ) {
    return { valid: false, message: 'ticketHoldMinutes must be an integer greater than 0' };
  }

  return {
    valid: true,
    value: {
      salesEnabled: candidate.salesEnabled,
      defaultCurrency: candidate.defaultCurrency.trim().toUpperCase(),
      supportEmail: candidate.supportEmail.trim(),
      ticketHoldMinutes: candidate.ticketHoldMinutes,
    },
  };
};

export const createPostSettingsController = ({
  settingsDAL,
}: {
  settingsDAL: SettingsDAL;
}) => async (req: Request, res: Response) => {
  const validationResult = validateSettingsPayload(req.body);

  if (validationResult.valid === false) {
    res.status(400).json({ message: validationResult.message });
    return;
  }

  const settings = await settingsDAL.upsertSettings(validationResult.value);
  res.json(settings);
};