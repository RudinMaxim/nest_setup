import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from './shared/logger/logger.module';
import { TerminusModule } from '@nestjs/terminus';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { ExampleModule } from './domain/example/example.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => [
                {
                    ttl: config.get('RATE_LIMIT_TTL', 60000),
                    limit: config.get('RATE_LIMIT_MAX', 100),
                },
            ],
        }),
        TerminusModule,
        LoggerModule,
        PrismaModule,
        RedisModule,
        ExampleModule, // ! TODO: Удалите эту строку после создания вашего первого модуля
    ],
    exports: [RedisModule, PrismaModule],
})
export class AppModule {}
