import { Inject, Injectable, LoggerService, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';
import { RedisService } from './redis.interface';

@Injectable()
export class RedisServiceImpl implements RedisService, OnModuleDestroy {
    constructor(
        @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
        private readonly logger: LoggerService,
    ) {}

    getClient(): Redis {
        return this.redisClient;
    }

    async get(key: string): Promise<string | null> {
        return this.redisClient.get(key);
    }

    async set(key: string, value: string, ttl?: number): Promise<void> {
        if (ttl) {
            await this.redisClient.set(key, value, 'EX', ttl);
        } else {
            await this.redisClient.set(key, value);
        }
    }

    async del(key: string): Promise<void> {
        await this.redisClient.del(key);
    }

    async keys(pattern: string): Promise<string[]> {
        return this.redisClient.keys(pattern);
    }

    async quit(): Promise<void> {
        await this.redisClient.quit();
    }

    async onModuleDestroy() {
        try {
            await this.quit();
            this.logger.log('Redis connection closed');
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.stack : 'Unknown error';
            this.logger.error('Error closing Redis connection', errorMessage);
        }
    }
}
