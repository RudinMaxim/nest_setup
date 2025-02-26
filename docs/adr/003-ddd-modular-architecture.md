# ADR-003: Применение Domain-Driven Design (DDD)

**Дата:** 2025-02-26  
**Статус:** Принято

## Контекст

Требовалось:

1. Чёткое разделение бизнес-логики и инфраструктуры.
2. Возможность изолированного тестирования доменов.

## Решение

Структура проекта по DDD-принципам:

```text
└───example
    │   example.module.ts
    │
    ├───controllers
    │       example.controller.ts
    │       index.ts
    │
    ├───dto
    │       create-example.dto.ts
    │       example.dto.ts
    │       index.ts
    │       update-example.dto.ts
    │
    ├───entities
    │       example.entity.ts
    │       index.ts
    │
    ├───repositories
    │       cache.repository.ts
    │       database.repository.ts
    │       index.ts
    │
    ├───services
    │       example.service.ts
    │       index.ts
    │
    └───__test__
```

**Ключевые элементы:**

1. **Агрегаты**: Границы транзакций (например, `UserAggregate`).
2. **Репозитории**: Абстракции для доступа к данным.
3. **События домена**: Реакция на изменения (например, отправка email).
