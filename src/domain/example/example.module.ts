import { Module } from '@nestjs/common';
import { ExampleController } from './controllers';
import { ExampleService } from './services';
import { DatabaseRepository, CacheRepository } from './repositories';
import { PrismaService, RedisService } from '../../app.module';

@Module({
    controllers: [ExampleController],
    providers: [ExampleService, DatabaseRepository, CacheRepository, PrismaService, RedisService],
    // exports: [ExampleService], // Экспортируем, если сервис будет использоваться в других модулях
})
export class ExampleModule {}
