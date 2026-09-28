import { EventDAL } from "../dal/events.dal";
import { Request, Response } from "express";

const parseToInteger = (value: string | undefined, defaultVal: number): number => {
  if (value === undefined || value === '') return defaultVal;
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultVal : Math.max(0, num);
};

export const eventsController = ({eventsDAL}: {eventsDAL: EventDAL}) => ({
  async getEvents(req: Request, res: Response)  {
    let limit = parseToInteger(req.query?.limit as string, 50);
    const offset = parseToInteger(req.query?.offset as string, 0);

    if (limit > 100) limit = 100;
    if (limit < 0) limit = 0;

    const result = await eventsDAL.getEvents(limit, offset);
    res.json(result);
  }

});

export type EventsController = ReturnType<typeof eventsController>;
