import { IsBoolean } from 'class-validator';

export class FulfillmentFormatDto {
    @IsBoolean()
    rfid: boolean;

    @IsBoolean()
    print: boolean;
}