import { EventDAL } from "../dal/events.dal";
import { Request, Response } from "express";

export const eventsController = ({eventsDAL}: {eventsDAL: EventDAL}) => ({
  async getEvents(_req: Request, res: Response)  {
    const events = await eventsDAL.getEvents(50);
    res.json(events);
  }

}) ;
