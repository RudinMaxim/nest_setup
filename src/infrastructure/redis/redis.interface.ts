// src/infrastructure/redis/redis.interface.ts
export interface RedisConfig {
    host: string;
    port: number;
    password?: string;
    ttl?: number;
    db?: number;
}

export interface RedisService {
    getClient(): any;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    keys(pattern: string): Promise<string[]>;
    quit(): Promise<void>;
}
