# ADR-004: Интеграция Swagger (OpenAPI)

**Дата:** 2025-02-26  
**Статус:** Принято

## Контекст

Требовалась автоматизированная документация API для:

- Внешних разработчиков.
- Тестирования через UI.

## Решение

Использование `@nestjs/swagger` с декораторами.  
**Пример:**

```typescript
@ApiTags('Users')
@Controller('users')
export class UserController {
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    type: UserDto,
    description: 'User found'
  })
  @Get(':id')
  getUser(@Param('id') id: string) { ... }
}
```

**Правила:**

1. Все DTO имеют `@ApiProperty`.
2. Ответы разделены по доменам в `src/swagger/responses/`.
3. Генерация через `npm run swagger`.

## Альтернативы

- **Postman**: Требует ручного обновления.
- **Redoc**: Меньше возможностей кастомизации.

## Последствия

- ✅ Снижение времени на поддержку документации.
- ❗ Нагрузка на производительность в dev-режиме.
