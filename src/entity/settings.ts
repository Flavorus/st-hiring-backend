export interface Settings {
  salesEnabled: boolean;
  defaultCurrency: string;
  supportEmail: string;
  ticketHoldMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SettingsInput {
  salesEnabled: boolean;
  defaultCurrency: string;
  supportEmail: string;
  ticketHoldMinutes: number;
}