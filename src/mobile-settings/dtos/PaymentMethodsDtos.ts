import { IsBoolean } from 'class-validator';

export class PaymentMethodsDto {
    @IsBoolean()
    cash: boolean;

    @IsBoolean()
    creditCard: boolean;

    @IsBoolean()
    comp: boolean;
}