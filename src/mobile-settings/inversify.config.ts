import 'reflect-metadata';
import { Container } from 'inversify';
import { ISettingsService } from './interfaces/ISettingsService';
import { SettingsService } from './services/SettingsService';
import { ISettingsRespository } from './interfaces/ISettingsRespository';
import { SettingsRepository } from './repositories/SettingsRepository';
import { SettingsController } from './controllers/SettingsController';
import { Db } from 'mongodb';
import { connectToDatabase } from './database/mongodb';

const container = new Container();

container.bind<Db>('Db').toDynamicValue(async () => {
    const db = await connectToDatabase();
    return db;
}).inSingletonScope();

container.bind<ISettingsService>('ISettingsService').to(SettingsService);
container.bind<ISettingsRespository>('ISettingsRepository').to(SettingsRepository);

container.bind<SettingsController>(SettingsController).toSelf();


export { container };