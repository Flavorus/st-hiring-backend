import { IsBoolean } from 'class-validator';

export class CustomerInfoDto {

    @IsBoolean()
    active: boolean;

    @IsBoolean()
    basicInfo: boolean;
    
    @IsBoolean()
    addressInfo: boolean;
}