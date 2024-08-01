import { IsNumber, IsOptional } from 'class-validator';

export class PrinterDto {
    @IsNumber()
    @IsOptional()
    id: number | null;
}