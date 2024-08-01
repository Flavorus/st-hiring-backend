import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class DeliveryMethodDto {

    @IsString()
    name: string;

    @IsString()
    enum: string;

    @IsNumber()
    order: number;

    @IsBoolean()
    isDefault: boolean;

    @IsBoolean()
    selected: boolean;
}