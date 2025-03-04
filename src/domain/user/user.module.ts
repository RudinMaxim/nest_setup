import { UsersController } from './controllers';
import { UsersService } from './service';
import { UsersRepository } from './repositories';
import { PrismaService } from '../../infrastructure/prisma';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule],
    controllers: [UsersController],
    providers: [UsersService, UsersRepository, PrismaService],
    exports: [UsersService],
})
export class UsersModule {}
