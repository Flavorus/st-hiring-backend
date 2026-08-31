import { SettingsDAL } from '../dal/settings.dal';
import { Settings, SettingsInput } from '../entity/settings';

export class SettingsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SettingsValidationError';
  }
}

export interface UpsertSettingsResult {
  settings: Settings;
  wasCreated: boolean;
}

export interface SettingsService {
  getCurrentSettings(): Promise<Settings | null>;
  upsertCurrentSettings(payload: unknown): Promise<UpsertSettingsResult>;
}

const normalizeSettingsPayload = (payload: unknown): SettingsInput => {
  if (!payload || typeof payload !== 'object') {
    throw new SettingsValidationError('Body must be a JSON object');
  }

  const candidate = payload as Partial<SettingsInput>;

  if (typeof candidate.salesEnabled !== 'boolean') {
    throw new SettingsValidationError('salesEnabled must be a boolean');
  }

  if (typeof candidate.defaultCurrency !== 'string' || candidate.defaultCurrency.trim() === '') {
    throw new SettingsValidationError('defaultCurrency must be a non-empty string');
  }

  if (typeof candidate.supportEmail !== 'string' || !candidate.supportEmail.includes('@')) {
    throw new SettingsValidationError('supportEmail must be a valid email string');
  }

  if (
    typeof candidate.ticketHoldMinutes !== 'number'
    || !Number.isInteger(candidate.ticketHoldMinutes)
    || candidate.ticketHoldMinutes < 1
  ) {
    throw new SettingsValidationError('ticketHoldMinutes must be an integer greater than 0');
  }

  return {
    salesEnabled: candidate.salesEnabled,
    defaultCurrency: candidate.defaultCurrency.trim().toUpperCase(),
    supportEmail: candidate.supportEmail.trim(),
    ticketHoldMinutes: candidate.ticketHoldMinutes,
  };
};

export const createSettingsService = ({ settingsDAL }: { settingsDAL: SettingsDAL }): SettingsService => {
  return {
    async getCurrentSettings(): Promise<Settings | null> {
      return settingsDAL.getSettings();
    },

    async upsertCurrentSettings(payload: unknown): Promise<UpsertSettingsResult> {
      const normalizedPayload = normalizeSettingsPayload(payload);
      const currentSettings = await settingsDAL.getSettings();
      const settings = await settingsDAL.upsertSettings(normalizedPayload);

      return {
        settings,
        wasCreated: currentSettings === null,
      };
    },
  };
};