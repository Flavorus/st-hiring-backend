import { IsArray, IsNumber, ValidateNested } from "class-validator";
import { CustomerInfoDto } from "./CustomerInfoDto";
import { DeliveryMethodDto } from "./DeliveryMethodsDto"
import { FulfillmentFormatDto } from "./FulfillmentFormatDto";
import { PaymentMethodsDto } from "./PaymentMethodsDtos";
import { PrinterDto } from "./PrinterDto";
import { PrintingFormatDto } from "./PrintingFormatDto";
import { ScanningDto } from "./ScanningDto";
import { TicketDisplayDto } from "./TicketDisplayDto";
import { Type } from "class-transformer";

export class SettingsDto {

    @IsNumber()
    clientId: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DeliveryMethodDto)
    deliveryMethods: DeliveryMethodDto[];
    
    @ValidateNested({ each: true })
    @Type(() => FulfillmentFormatDto)
    fulfillmentFormat: FulfillmentFormatDto;

    @ValidateNested({ each: true })
    @Type(() => PrinterDto)
    printer: PrinterDto;

    @ValidateNested({ each: true })
    @Type(() => PrintingFormatDto)
    printingFormat: PrintingFormatDto;

    @ValidateNested({ each: true })
    @Type(() => ScanningDto)
    scanning: ScanningDto;

    @ValidateNested({ each: true })
    @Type(() => PaymentMethodsDto)
    paymentMethods: PaymentMethodsDto;

    @ValidateNested({ each: true })
    @Type(() => TicketDisplayDto)
    ticketDisplay: TicketDisplayDto;

    @ValidateNested({ each: true })
    @Type(() => CustomerInfoDto)
    customerInfo: CustomerInfoDto;
}
