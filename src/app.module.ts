import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from './shared/logger/logger.module';
import { TelegramClientModule } from './infrastructure/telegram-client/telegram-client.module';
import configuration from './shared/config/configuration';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
            envFilePath: '.env',
        }),
        LoggerModule,
        TelegramClientModule,
        TelegramModule,
    ],
})
export class AppModule {}
