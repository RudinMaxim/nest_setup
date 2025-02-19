import { Inject, Injectable, LoggerService, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';
import { IRedisService } from './redis.interface';

@Injectable()
export class RedisServiceImpl implements IRedisService, OnModuleDestroy {
    constructor(
        @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
        private readonly logger: LoggerService,
    ) {}

    /**
     * Returns the Redis client instance
     * @returns {Promise<any>} Redis client instance
     */
    getClient(): Redis {
        return this.redisClient;
    }

    /**
     * Retrieves a value by key from Redis
     * @param {string} key - The key to retrieve
     * @returns {Promise<string | null>} The value associated with the key, or null if not found
     */
    async get(key: string): Promise<string | null> {
        return this.redisClient.get(key);
    }

    /**
     * Sets a value in Redis with an optional TTL
     * @param {string} key - The key to set
     * @param {string} value - The value to store
     * @param {number} [ttl] - Time to live in seconds
     * @returns {Promise<void>}
     */
    async set(key: string, value: string, ttl?: number): Promise<void> {
        if (ttl) {
            await this.redisClient.set(key, value, 'EX', ttl);
        } else {
            await this.redisClient.set(key, value);
        }
    }

    /**
     * Deletes a key from Redis
     * @param {string} key - The key to delete
     * @returns {Promise<void>}
     */
    async del(key: string): Promise<void> {
        await this.redisClient.del(key);
    }

    /**
     * Retrieves all keys matching a pattern
     * @param {string} pattern - Pattern to match keys against
     * @returns {Promise<string[]>} Array of matching keys
     */
    async keys(pattern: string): Promise<string[]> {
        return this.redisClient.keys(pattern);
    }

    /**
     * Closes the Redis connection
     * @returns {Promise<void>}
     */
    async quit(): Promise<void> {
        await this.redisClient.quit();
    }

    /**
     * Retrieves multiple values by keys
     * @param {string[]} keys - Array of keys to retrieve
     * @returns {Promise<(string | null)[]>} Array of values in the same order as keys
     */
    async mget(keys: string[]): Promise<(string | null)[]> {
        return this.redisClient.mget(keys);
    }

    /**
     * Sets multiple key-value pairs atomically
     * @param {Record<string, string>} keyValuePairs - Object containing key-value pairs
     * @returns {Promise<void>}
     */
    async mset(keyValuePairs: Record<string, string>): Promise<void> {
        const pairs = Object.entries(keyValuePairs).flat();
        await this.redisClient.mset(pairs);
    }

    /**
     * Increments the number stored at key by one
     * @param {string} key - The key to increment
     * @returns {Promise<number>} The value after increment
     */
    async incr(key: string): Promise<number> {
        return this.redisClient.incr(key);
    }

    /**
     * Decrements the number stored at key by one
     * @param {string} key - The key to decrement
     * @returns {Promise<number>} The value after decrement
     */
    async decr(key: string): Promise<number> {
        return this.redisClient.decr(key);
    }

    /**
     * Sets a timeout on key
     * @param {string} key - The key to set timeout on
     * @param {number} seconds - Number of seconds until expiration
     * @returns {Promise<boolean>} True if timeout was set, false otherwise
     */
    async expire(key: string, seconds: number): Promise<boolean> {
        const result = await this.redisClient.expire(key, seconds);
        return result === 1;
    }

    /**
     * Gets the remaining time to live of a key
     * @param {string} key - The key to check
     * @returns {Promise<number>} TTL in seconds, -2 if key doesn't exist, -1 if no timeout
     */
    async ttl(key: string): Promise<number> {
        return this.redisClient.ttl(key);
    }

    /**
     * Checks if a key exists
     * @param {string} key - The key to check
     * @returns {Promise<boolean>} True if key exists, false otherwise
     */
    async exists(key: string): Promise<boolean> {
        const result = await this.redisClient.exists(key);
        return result === 1;
    }

    /**
     * Incrementally iterates over keys matching a pattern
     * @param {string} pattern - Pattern to match keys against
     * @param {number} [count=10] - Number of keys to return per iteration
     * @returns {Promise<{cursor: string; keys: string[]}>} Cursor for next iteration and matching keys
     */
    async scan(pattern: string, count: number = 10): Promise<{ cursor: string; keys: string[] }> {
        const [cursor, keys] = await this.redisClient.scan(0, 'MATCH', pattern, 'COUNT', count);
        return { cursor, keys };
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
