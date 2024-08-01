import { SettingsSchema } from "../schemas/SettingsSchema";

export const defaultSetttings : SettingsSchema = {
  clientId: 1,
  deliveryMethods: [
    {
      name: 'Print Now',
      enum: 'PRINT_NOW',
      order: 1,
      isDefault: true,
      selected: true,
    },
    {
      name: 'Print@Home',
      enum: 'PRINT_AT_HOME',
      order: 2,
      isDefault: false,
      selected: true,
    },
  ],
  fulfillmentFormat: {
    rfid: false,
    print: false,
  },
  printer: {
    id: null,
  },
  printingFormat: {
    formatA: true,
    formatB: false,
  },
  scanning: {
    scanManually: true,
    scanWhenComplete: false,
  },
  paymentMethods: {
    cash: true,
    creditCard: false,
    comp: false,
  },
  ticketDisplay: {
    leftInAllotment: true,
    soldOut: true,
  },
  customerInfo: {
    active: false,
    basicInfo: false,
    addressInfo: false,
  },
};
