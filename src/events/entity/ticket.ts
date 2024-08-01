export interface Ticket {
  id: string;
  eventId: string;
  type: string;
  status: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
};
