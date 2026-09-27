export interface Settings {
  supportEmail: string;
  companyName: string;
  maxTicketsPerEvent: number;
}

export const DEFAULT_SETTINGS: Settings = {
  supportEmail: "support@seetickets.com",
  companyName: "SeeTickets",
  maxTicketsPerEvent: 10000,
};
