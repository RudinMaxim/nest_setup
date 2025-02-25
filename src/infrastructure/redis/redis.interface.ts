import Redis from 'ioredis';

export type RedisConfig = {
    host: string;
    port: number;
    password?: string;
    ttl?: number;
    db?: number;
};

export abstract class RedisService {
    abstract getClient(): Redis;
    abstract get(key: string): Promise<string | null>;
    abstract set(key: string, value: string, ttl?: number): Promise<void>;
    abstract del(key: string): Promise<void>;
    abstract keys(pattern: string): Promise<string[]>;
    abstract quit(): Promise<void>;
    abstract mget(keys: string[]): Promise<(string | null)[]>;
    abstract mset(keyValuePairs: Record<string, string>): Promise<void>;
    abstract incr(key: string): Promise<number>;
    abstract decr(key: string): Promise<number>;
    abstract expire(key: string, seconds: number): Promise<boolean>;
    abstract ttl(key: string): Promise<number>;
    abstract exists(key: string): Promise<boolean>;
    abstract scan(pattern: string, count: number): Promise<{ cursor: string; keys: string[] }>;
}
