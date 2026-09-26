export interface Settings {
  supportEmail: string;
  companyName: string;
  enableNotifications: boolean;
  maxTicketsPerOrder: number;
  maxTicketsPerEvent: number;
  defaultTicketPrice: number;
  enableWaitlist: boolean;
  enableReviews: boolean;
  enableRefunds: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  supportEmail: "support@seetickets.com",
  companyName: "SeeTickets",
  enableNotifications: true,
  maxTicketsPerOrder: 10,
  maxTicketsPerEvent: 10000,
  defaultTicketPrice: 50,
  enableWaitlist: true,
  enableReviews: false,
  enableRefunds: true,
};
