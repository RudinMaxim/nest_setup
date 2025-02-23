import { Module } from '@nestjs/common';
import { ExampleController } from './controllers';
import { ExampleService } from './services';
import { DatabaseRepository, CacheRepository } from './repositories';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { RedisModule } from '../../infrastructure/redis/redis.module';

@Module({
    imports: [RedisModule],
    controllers: [ExampleController],
    providers: [ExampleService, DatabaseRepository, CacheRepository, PrismaService],
})
export class ExampleModule {}
