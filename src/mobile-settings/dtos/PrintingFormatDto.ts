import { IsBoolean } from 'class-validator';

export class PrintingFormatDto {
    @IsBoolean()
    formatA: boolean;

    @IsBoolean()
    formatB: boolean;
}