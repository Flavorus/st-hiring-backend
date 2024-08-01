import { IsBoolean } from 'class-validator';

export class ScanningDto {
    @IsBoolean()
    scanManually: boolean;
    
    @IsBoolean()
    scanWhenComplete: boolean;
}