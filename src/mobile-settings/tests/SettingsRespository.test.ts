
import 'reflect-metadata';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Db, MongoClient, Collection } from 'mongodb';
import { SettingsRepository } from '../repositories/SettingsRepository';
import { SettingsSchema } from '../schemas/SettingsSchema';

describe('SettingsRepository', () => {
  let mongoServer: MongoMemoryServer;
  let db: Db;
  let collection: Collection;
  let settingsRepository: SettingsRepository;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    const client = new MongoClient(uri);
    await client.connect();
    db = client.db('test');
    collection = db.collection('settings');
    settingsRepository = new SettingsRepository(db);
  });

  afterAll(async () => {
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await collection.deleteMany({});
  });

  it('should create a new setting', async () => {
    const settings: SettingsSchema = {
      clientId: 1,
      deliveryMethods: [],
      fulfillmentFormat: { rfid: false, print: false },
      printer: { id: null },
      printingFormat: { formatA: true, formatB: false },
      scanning: { scanManually: true, scanWhenComplete: false },
      paymentMethods: { cash: true, creditCard: false, comp: false },
      ticketDisplay: { leftInAllotment: true, soldOut: true },
      customerInfo: { active: false, basicInfo: false, addressInfo: false },
    };

    const result = await settingsRepository.create(settings);
    expect(result).toHaveProperty('_id');
    expect(result.clientId).toBe(settings.clientId);
  });

  it('should find all settings', async () => {
    const settings: SettingsSchema = {
      clientId: 1,
      deliveryMethods: [],
      fulfillmentFormat: { rfid: false, print: false },
      printer: { id: null },
      printingFormat: { formatA: true, formatB: false },
      scanning: { scanManually: true, scanWhenComplete: false },
      paymentMethods: { cash: true, creditCard: false, comp: false },
      ticketDisplay: { leftInAllotment: true, soldOut: true },
      customerInfo: { active: false, basicInfo: false, addressInfo: false },
    };

    await settingsRepository.create(settings);
    const allSettings = await settingsRepository.findAll();
    expect(allSettings.length).toBe(1);
  });

  it('should find by clientId or create new settings', async () => {
    const clientId = 2;
    const foundSettings = await settingsRepository.findByClientId(clientId);
    expect(foundSettings.clientId).toBe(clientId);
  });

  it('should update settings by clientId', async () => {
    const clientId = 3;
    const initialSettings: SettingsSchema = {
      clientId: clientId,
      deliveryMethods: [],
      fulfillmentFormat: { rfid: false, print: false },
      printer: { id: null },
      printingFormat: { formatA: true, formatB: false },
      scanning: { scanManually: true, scanWhenComplete: false },
      paymentMethods: { cash: true, creditCard: false, comp: false },
      ticketDisplay: { leftInAllotment: true, soldOut: true },
      customerInfo: { active: false, basicInfo: false, addressInfo: false },
    };

    await settingsRepository.create(initialSettings);
    const updatedSettings = {
      ...initialSettings,
      deliveryMethods: [{ name: 'New Method', enum: 'NEW_METHOD', order: 1, isDefault: true, selected: true }],
    };

    const result = await settingsRepository.update(clientId, updatedSettings);
    expect(result.deliveryMethods).toHaveLength(1);
    expect(result.deliveryMethods[0].name).toBe('New Method');
  });
});
