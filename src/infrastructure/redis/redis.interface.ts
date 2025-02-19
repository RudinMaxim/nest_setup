export type RedisConfig = {
    host: string;
    port: number;
    password?: string;
    ttl?: number;
    db?: number;
};

export interface IRedisService {
    getClient(): any;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    keys(pattern: string): Promise<string[]>;
    quit(): Promise<void>;
    mget(keys: string[]): Promise<(string | null)[]>;
    mset(keyValuePairs: Record<string, string>): Promise<void>;
    incr(key: string): Promise<number>;
    decr(key: string): Promise<number>;
    expire(key: string, seconds: number): Promise<boolean>;
    ttl(key: string): Promise<number>;
    exists(key: string): Promise<boolean>;
    scan(pattern: string, count: number): Promise<{ cursor: string; keys: string[] }>;
}
