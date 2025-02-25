# Backend NEST.JS

## Инструкция по запуску

Перед началом работ необходимо установить docker и docker-compose и скопировать переменные окружения из `.env.example` в `.env`.

### Запуск проекта

    1. Ручной запуск
        1. Установить зависимости (Node.js v.17+): `npm install`
        2. Может потребоваться выполнить генерацию типов Prisma: `npm run generate`
        3. Запуск локальной сборки: `npm run start:dev`
    2. Docker
       1. Убедитесь, что у вас установлен Docker и Docker Compose: `docker --version` и `docker-compose --version`
       2. Запустить контейнер: `docker-compose -f docker-compose.local.yml up -d`

### Доступные сервисы

        - Backend API: [localhost:3000](http://localhost:3000)
        - Swagger: [localhost:3000/api/v1/docs](http://localhost:3000/api/v1/docs)

## Prisma migrate

Миграции в prisma работают по шаблону [model/entity-first](https://www.prisma.io/docs/concepts/components/prisma-migrate/mental-model#patterns-for-evolving-database-schemas)

### Develop environment

Изменения должны быть внесены локально в схему `/prisma/schema.prisma`.

Для генерации файла миграции и последующего его применения к локальной БД, используется команда:

```shell
npm run migrate:dev
```

Во время миграции могут возникнуть конфликты, что потребует сбросить локальную БД и пересоздать её заново

Для работы с различиями внутри миграций используется команда:

```shell
npm run migrate:dev
```

Все созданные файлы sql-миграций должны быть отправлены в git

> Документация: [Prisma миграции в локальном окружении](https://www.prisma.io/docs/concepts/components/prisma-migrate/mental-model#prisma-migrate-in-a-development-environment-local)

### Production environment

Для синхронизации истории миграций в продуктовом окружении, используется команда:

```shell
npm run migrate:deploy
```

Например: http://localhost:3000/api-docs/

### Порядок работы:

Отделяем повторяющиеся, или содержащие большое количество описания схемы данных, схемы ответов и т.д. от [основной документации](https://swagger.io/docs/specification/components/):

- Схемы входящих данных описываем в файлах DTO

- Схемы данных, общие для ВСЕХ доменных областей, описываем в файле `src/swagger/schemas/base.schemas.ts`

- Для общих схем данных КОНКРЕТНОЙ доменной области создаем отдельный файл содержащий название этой доменной области
  `src/swagger/schemas/<доменная область>.schemas.ts`
  Например: `src/swagger/schemas/users.schemas.ts`

- При описании схем данных, по возможности, используем наследование с помощью [allOf](https://swagger.io/docs/specification/data-models/inheritance-and-polymorphism/)

- Готовые схемы данных интегрируем в описание документации при помощи [$ref](https://swagger.io/docs/specification/using-ref/).

- При описании схем ответов (responses), действуем так же, как и при описании схем данных.

- Файлы содержащие схемы ответов находятся в папке `src/swagger/responses/`

- Файлы, содержание схемы ответов, именуются следующим образом: `<доменная область>.responses.ts`
