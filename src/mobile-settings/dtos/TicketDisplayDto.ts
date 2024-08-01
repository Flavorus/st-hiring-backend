import { IsBoolean } from 'class-validator';

export class TicketDisplayDto {
    @IsBoolean()
    leftInAllotment: boolean;

    @IsBoolean()
    soldOut: boolean;
}