import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
    clientId: { type: Number, required: true },
    deliveryMethods: [{
        name: { type: String, required: true },
        enum: { type: String, required: true },
        order: { type: Number, required: true },
        isDefault: { type: Boolean, required: true },
        selected: { type: Boolean, required: true }
    }],
    fulfillmentFormat: {
        rfid: { type: Boolean, required: true },
        print: { type: Boolean, required: true }
    },
    printer: {
        id: { type: String, default: null }
    },
    printingFormat: {
        formatA: { type: Boolean, required: true },
        formatB: { type: Boolean, required: true }
    },
    scanning: {
        scanManually: { type: Boolean, required: true },
        scanWhenComplete: { type: Boolean, required: true }
    },
    paymentMethods: {
        cash: { type: Boolean, required: true },
        creditCard: { type: Boolean, required: true },
        comp: { type: Boolean, required: true }
    },
    ticketDisplay: {
        leftInAllotment: { type: Boolean, required: true },
        soldOut: { type: Boolean, required: true }
    },
    customerInfo: {
        active: { type: Boolean, required: true },
        basicInfo: { type: Boolean, required: true },
        addressInfo: { type: Boolean, required: true }
    }
});

export const Settings = mongoose.model('Settings', settingsSchema);