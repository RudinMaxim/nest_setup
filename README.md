# Backend NEST.JS

## Содержание

1. [Настройка окружения](#настройка-окружения)
2. [Запуск проекта](#запуск-проекта)
3. [Миграции Prisma](#миграции-prisma)
4. [Документация API](#документация-api)
5. [Рекомендации по разработке](#рекомендации-по-разработке)
6. [Troubleshooting](#troubleshooting)
7. [Архитектурные решения (ADR)](#архитектурные-решения-adr)
8. [Деплой](docs/deployment/deployment-to-server.md)
9. [CI/CD](docs/deployment/ci-cd.md)

---

## Настройка окружения

### Требования

- Node.js v18+
- Docker 24+ и Docker Compose v2+
- PostgreSQL 15+ (для локальной разработки)

### Установка

1. Скопируйте переменные окружения:

    ```bash
    cp .env.example .env
    ```

2. Настройте ключевые параметры в `.env`:

    ```ini
    DATABASE_URL="postgresql://user:pass@db:5432/app"
    REDIS_URL="redis://redis:6379"
    JWT_SECRET="your-secret-key"
    ```

---

## Запуск проекта

### Локальная разработка

```bash
npm install
npm run generate # Генерация Prisma-клиента
npm run start:dev
```

### Docker

```bash
docker-compose -f docker-compose.local.yml up -d --build
```

### Доступные endpoints

| Сервис       | URL                                 |
| ------------ | ----------------------------------- |
| API          | http://localhost:3000/api/v1        |
| Swagger UI   | http://localhost:3000/api/v1/docs   |
| Health-check | http://localhost:3000/api/v1/health |

---

## Миграции Prisma

### Разработка

```bash
# Создать новую миграцию
npm run migrate:dev -- --name init

# Применить миграции
npm run migrate:deploy
```

### Продакшен

```bash
docker-compose exec api npm run migrate:deploy
```

> **Важно:** Все SQL-файлы миграций должны быть закоммичены в репозиторий.

---

## Документация API

### Правила оформления

1. **DTO-классы**:

    - Используйте декораторы `@ApiProperty`
    - Пример:

        ```typescript
        export class CreateUserDto {
            @ApiProperty({ example: 'user@mail.com', description: 'Email' })
            @IsEmail()
            email: string;
        }
        ```

2. **Контроллеры**: - Используйте декораторы `@ApiTags` и `@ApiOperation` - Пример:

    ````typescript
    @ApiTags('Example')
    @Controller('examples')
    export class ExampleController {
    constructor(private readonly service: ExampleService) {}

        @Post()
        @ApiOperation({ summary: 'Create new example' })
        @ApiResponse({
            status: 201,
            description: 'The example has been successfully created',
            type: Example,
        })
        async create(@Body() dto: CreateExampleDto): Promise<ApiResponseDto<Example>> {
            const result = await this.service.create(dto);
            return {
                success: true,
                message: 'Example created successfully',
                data: result,
            };
        }
    }
    ````

---

## Рекомендации по разработке

### Стиль кода

- Линтинг: `npm run lint`
- Форматирование: `npm run format`
- Конфиги: [ESLint](eslint.config.mjs), [Prettier](.prettierrc)

### Тестирование

```bash
# Unit-тесты
npm run test

# e2e-тесты
npm run test:e2e

# Покрытие кода
npm run test:cov
```

### Code Review

- Чек-лист:
    - [ ] Соответствие SOLID и DI
    - [ ] Тесты покрывают ключевые сценарии
    - [ ] Документация Swagger обновлена
    - [ ] Соблюдение code-style

---

## Troubleshooting

### Ошибка: "Database not initialized"

```bash
docker-compose down -v && docker-compose up -d
npm run migrate:deploy
```

### Ошибка: "Invalid JWT secret"

- Убедитесь, что в `.env` задана переменная `JWT_SECRET`

### Swagger не отображает схемы

- Проверьте использование `@ApiExtraModels()` в контроллерах
- Убедитесь, что DTO экспортируются из `index.ts`

## Архитектурные решения (ADR)

Документация в директории `docs/adr/`:

- [ADR-001: Выбор Prisma в качестве ORM](docs/adr/001-prisma-as-orm.md)
- [ADR-002: Использование Redis для кэширования](docs/adr/002-using-redis-for-caching.md)
- [ADR-003: Модульная структура на основе DDD](docs/adr/003-ddd-modular-architecture.md)
- [ADR-004: Интеграция Swagger для API-документации](docs/adr/004-swagger-integration.md)

После внедрения архитектурного решения (ADR) в проект, необходимо создать соответствующий файл в директории `docs/adr/`. Поля могут необязательными, но рекомендуется указать все.
ADR включает следующие разделы:

1. Заголовок: Название решения и уникальный идентификатор (например, ADR-001).
2. Дата: Дата принятия решения.
3. Статус: Предложено, Принято, Устарело и т.д.
4. Контекст: Проблема, которую нужно решить, цели, ограничения.
5. Варианты решения: Рассмотренные альтернативы (с плюсами и минусами).
6. Выбранное решение: Подробное описание выбранного подхода.
7. Последствия: Влияние на систему, команду, сроки, технический долг.
8. Участники: Кто участвовал в принятии решения.

Пример файла:

```markdown
# ADR-001: Использование GraphQL вместо REST API

**Статус**: Принято  
**Дата**: 2025-01-01

## Контекст

Требуется гибкий API для клиентов с разнообразными запросами данных. REST API приводит к over-fetching и under-fetching.

## Варианты

1. **REST API с расширенными ендпоинтами**: Простота, но недостаточная гибкость.
2. **GraphQL**: Клиенты сами формируют запросы, но сложнее в поддержке.

## Решение

Выбран GraphQL из-за требований клиентов к гибкости.

## Последствия

- Необходимо обучение команды.
- Добавление инструментов (Apollo Server, схемы).
```
