import { Ticket } from "./ticket";

export interface Event {
  id: number;
  name: string;
  date: Date;
  location: string;
  description: string;
  availableTickets: Ticket[];
  createdAt: Date;
  updatedAt: Date;
};
