import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT, REDIS_CONFIG } from './redis.constants';
import { RedisConfig } from './redis.interface';
import { LoggerModule } from '../../shared/logger/logger.module';
import { RedisServiceImpl } from './redis.service';

@Global()
@Module({
    imports: [LoggerModule],
    providers: [
        {
            provide: REDIS_CONFIG,
            useFactory: (configService: ConfigService): RedisConfig => ({
                host: configService.get<string>('REDIS_HOST') ?? 'localhost',
                port: configService.get<number>('REDIS_PORT') ?? 6379,
                password: configService.get<string>('REDIS_PASSWORD'),
                db: configService.get<number>('REDIS_DB', 0),
                ttl: configService.get<number>('REDIS_TTL', 3600),
            }),
            inject: [ConfigService],
        },
        {
            provide: REDIS_CLIENT,
            useFactory: (config: RedisConfig): Redis => {
                const client = new Redis({
                    host: config.host,
                    port: config.port,
                    password: config.password,
                    db: config.db,
                });

                client.on('connect', () => {
                    Logger.log(`Connected to Redis at ${config.host}:${config.port}`);
                });

                client.on('error', (err) => {
                    Logger.error(`Redis connection error: ${err.message}`, err.stack);
                });

                return client;
            },
            inject: [REDIS_CONFIG],
        },
        {
            provide: RedisServiceImpl,
            useClass: RedisServiceImpl,
        },
    ],
    exports: [RedisServiceImpl],
})
export class RedisModule {}
