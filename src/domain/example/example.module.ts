import { Module } from '@nestjs/common';
import { ExampleController } from './controllers';
import { ExampleService } from './services';
import { DatabaseRepository, CacheRepository } from './repositories';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { RedisServiceImpl as RedisService } from '../../infrastructure/redis/redis.service';

@Module({
    controllers: [ExampleController],
    providers: [ExampleService, DatabaseRepository, CacheRepository, PrismaService, RedisService],
    // exports: [ExampleService], // Экспортируем, если сервис будет использоваться в других модулях
})
export class ExampleModule {}
