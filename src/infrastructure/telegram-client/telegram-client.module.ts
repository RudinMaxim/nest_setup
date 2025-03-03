import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegramClientService } from './telegram-client.service';
import { getTelegramConfig } from './telegram-client.config';
import telegramConfig from '../../shared/config/configuration';

@Module({})
export class TelegramClientModule {
    static forRoot(): DynamicModule {
        return {
            module: TelegramClientModule,
            imports: [
                TelegrafModule.forRootAsync({
                    imports: [ConfigModule.forFeature(telegramConfig)],
                    inject: [ConfigService],
                    useFactory: (config: ConfigService) =>
                        getTelegramConfig(config.get<any>('telegramConfig')),
                }),
            ],
            providers: [TelegramClientService],
            exports: [TelegrafModule, TelegramClientService],
        };
    }
}
