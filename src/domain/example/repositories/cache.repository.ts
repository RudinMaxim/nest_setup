import { Injectable } from '@nestjs/common';
import { RedisService } from '../../../infrastructure/redis/redis.interface';

@Injectable()
export class CacheRepository {
    private readonly PREFIX = 'example:';

    constructor(private readonly redis: RedisService) {}

    async get(id: number): Promise<string | null> {
        const key = `${this.PREFIX}${id}`;
        return this.redis.get(key);
    }

    async set(id: number, data: string, ttl = 3600): Promise<void> {
        await this.redis.set(`${this.PREFIX}${id}`, data, ttl);
    }

    async del(id: number): Promise<void> {
        await this.redis.del(`${this.PREFIX}${id}`);
    }

    async flushPattern(pattern: string): Promise<void> {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) await Promise.all(keys.map((key) => this.redis.del(key)));
    }
}
