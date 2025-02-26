# ADR-002: Использование Redis для кэширования

**Дата:** 2025-02-26  
**Статус:** Принято

## Контекст

Необходимо снизить нагрузку на БД для часто запрашиваемых данных:

- Сессии пользователей.
- Результаты тяжёлых запросов.

## Решение

Внедрение **Redis** как основного кэш-слоя.  
**Архитектура:**

```typescript
// Пример стратегии кэширования
@Injectable()
export class CacheService {
    constructor(private redis: RedisClient) {}

    async getOrSet<T>(key: string, ttl: number, fallback: () => Promise<T>) {
        const cached = await this.redis.get(key);
        if (cached) return JSON.parse(cached);

        const result = await fallback();
        await this.redis.setex(key, ttl, JSON.stringify(result));
        return result;
    }
}
```

**Альтернативы отклонены:**

- **Memcached**: Нет persistence, слабая типизация.
- **In-memory кэш**: Не подходит для кластеров.

## Последствия

- .
