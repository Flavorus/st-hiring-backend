
export interface SettingsInput {
  currency: string;
  timezone: string;
  maxTicketsPerOrder: number;
  salesEnabled: boolean;
}

export interface Settings extends SettingsInput {
  key: string;
  createdAt: Date;
  updatedAt: Date;
}